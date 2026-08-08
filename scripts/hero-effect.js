const TAU = Math.PI * 2;

export function initHeroEffect() {
  const stage = document.querySelector('[data-hero-stage]');
  if (!stage) return;

  const tilt = stage.querySelector('[data-hero-tilt]');
  const canvas = stage.querySelector('[data-hero-particles]');
  if (!tilt || !(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let visible = true;
  let pointerRaf = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;

  const particleCount = () => {
    if (reduceMotion.matches) return 10;
    return window.innerWidth < 700 ? 18 : 34;
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      const radius = Math.min(width, height) * (0.13 + Math.random() * 0.34);
      const angle = Math.random() * TAU;
      this.x = width / 2 + Math.cos(angle) * radius;
      this.y = height / 2 + Math.sin(angle) * radius;
      this.radius = 0.45 + Math.random() * 1.35;
      this.alpha = 0.16 + Math.random() * 0.48;
      this.phase = Math.random() * TAU;
      this.phaseSpeed = 0.006 + Math.random() * 0.014;
      this.drift = (Math.random() - 0.5) * 0.0008;
      this.orbit = angle;
      this.orbitRadius = radius;
      if (!initial) this.phase = 0;
    }

    update() {
      this.phase += this.phaseSpeed;
      this.orbit += this.drift;
      const breathe = Math.sin(this.phase) * 1.8;
      const radius = this.orbitRadius + breathe;
      this.x = width / 2 + Math.cos(this.orbit) * radius;
      this.y = height / 2 + Math.sin(this.orbit) * radius;
    }

    draw() {
      const pulse = 0.55 + Math.sin(this.phase) * 0.45;
      const alpha = this.alpha * (0.55 + pulse * 0.45);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * (0.8 + pulse * 0.4), 0, TAU);
      ctx.fillStyle = `rgba(255, 211, 128, ${alpha})`;
      ctx.shadowColor = 'rgba(255, 190, 92, .55)';
      ctx.shadowBlur = 8 * dpr;
      ctx.fill();
    }
  }

  function rebuildParticles() {
    particles = Array.from({ length: particleCount() }, () => new Particle());
  }

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.6);

    if (nextWidth === width && nextHeight === height && canvas.width) return;
    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildParticles();
  }

  function renderFrame() {
    rafId = 0;
    if (!visible) return;

    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 0;

    particles.forEach((particle) => {
      if (!reduceMotion.matches) particle.update();
      particle.draw();
    });

    if (!reduceMotion.matches) rafId = requestAnimationFrame(renderFrame);
  }

  function startRendering() {
    if (!visible || rafId) return;
    renderFrame();
  }

  function stopRendering() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function applyTilt() {
    pointerRaf = 0;
    tilt.style.setProperty('--hero-rx', `${targetRotateX.toFixed(2)}deg`);
    tilt.style.setProperty('--hero-ry', `${targetRotateY.toFixed(2)}deg`);
  }

  function queueTilt() {
    if (!pointerRaf) pointerRaf = requestAnimationFrame(applyTilt);
  }

  function resetTilt() {
    targetRotateX = 0;
    targetRotateY = 0;
    queueTilt();
  }

  stage.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches || !finePointer.matches) return;
    const rect = stage.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    targetRotateY = nx * 7;
    targetRotateX = ny * -6;
    queueTilt();
  }, { passive: true });

  stage.addEventListener('pointerleave', resetTilt, { passive: true });

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    if (reduceMotion.matches) renderFrame();
  });
  resizeObserver.observe(stage);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) startRendering();
    else stopRendering();
  }, { threshold: 0.02 });
  intersectionObserver.observe(stage);

  const handleMotionChange = () => {
    stage.classList.toggle('is-reduced-motion', reduceMotion.matches);
    resetTilt();
    rebuildParticles();
    if (reduceMotion.matches) {
      stopRendering();
      renderFrame();
    } else {
      startRendering();
    }
  };

  reduceMotion.addEventListener?.('change', handleMotionChange);
  finePointer.addEventListener?.('change', resetTilt);

  resizeCanvas();
  handleMotionChange();
}
