(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  const depth = document.querySelector('[data-astera-depth]');
  const canvas = document.querySelector('[data-astera-canvas]');

  if (!visual || !depth || !(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext('2d', {alpha: true, desynchronized: true});
  if (!context) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = reducedMotionQuery.matches;
  let isVisible = true;
  let isPageVisible = !document.hidden;
  let animationFrameId = null;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];
  let lastFrameTime = 0;

  const COLORS = {
    cyan: {point: 'rgba(144, 241, 255, 0.88)', line: [83, 220, 247]},
    amber: {point: 'rgba(255, 196, 139, 0.9)', line: [226, 160, 109]}
  };

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
  const getParticleCount = () => window.innerWidth <= 560 ? 16 : window.innerWidth <= 900 ? 24 : 34;
  const createParticle = (index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.115,
    vy: (Math.random() - 0.5) * 0.115,
    radius: Math.random() * 1.25 + 0.45,
    opacity: Math.random() * 0.48 + 0.28,
    phase: Math.random() * Math.PI * 2,
    color: index % 7 === 0 ? COLORS.amber : COLORS.cyan
  });

  function rebuildParticles() {
    particles = Array.from({length: getParticleCount()}, (_, index) => createParticle(index));
  }

  function resizeCanvas() {
    const rectangle = visual.getBoundingClientRect();
    width = Math.max(1, Math.round(rectangle.width));
    height = Math.max(1, Math.round(rectangle.height));
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    rebuildParticles();
    if (reducedMotion) drawStaticFrame();
  }

  function updateParticle(particle, deltaFactor) {
    particle.x += particle.vx * deltaFactor;
    particle.y += particle.vy * deltaFactor;
    const margin = 12;
    if (particle.x < -margin) particle.x = width + margin;
    if (particle.x > width + margin) particle.x = -margin;
    if (particle.y < -margin) particle.y = height + margin;
    if (particle.y > height + margin) particle.y = -margin;
  }

  function drawConnectionLines() {
    const maximumDistance = window.innerWidth <= 560 ? 76 : window.innerWidth <= 900 ? 92 : 108;
    for (let firstIndex = 0; firstIndex < particles.length; firstIndex += 1) {
      const first = particles[firstIndex];
      for (let secondIndex = firstIndex + 1; secondIndex < particles.length; secondIndex += 1) {
        const second = particles[secondIndex];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance >= maximumDistance) continue;
        const opacity = (1 - distance / maximumDistance) * 0.16;
        const color = first.color === COLORS.amber || second.color === COLORS.amber ? COLORS.amber.line : COLORS.cyan.line;
        context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
        context.lineWidth = 0.65;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }
    }
  }

  function drawParticles(time) {
    for (const particle of particles) {
      const pulse = 0.72 + Math.sin(time * 0.0015 + particle.phase) * 0.28;
      context.globalAlpha = clamp(particle.opacity * pulse, 0.08, 0.95);
      context.fillStyle = particle.color.point;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
      context.fill();
      if (particle.radius > 1.2) {
        context.globalAlpha = 0.11 * pulse;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 4.2, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.globalAlpha = 1;
  }

  function drawGlobePulse(time, staticFrame = false) {
    const centerX = width * 0.5;
    const centerY = height * 0.545;
    const baseRadius = Math.min(width, height) * 0.305;
    const pulse = staticFrame ? 0 : Math.sin(time * 0.00105) * 4;
    context.save();
    context.globalCompositeOperation = 'lighter';
    context.strokeStyle = 'rgba(89, 224, 252, 0.12)';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(centerX, centerY, baseRadius + pulse, Math.PI * 0.07, Math.PI * 1.73);
    context.stroke();
    context.strokeStyle = 'rgba(226, 160, 109, 0.09)';
    context.lineWidth = 0.8;
    context.beginPath();
    context.arc(centerX, centerY, baseRadius * 1.13 - pulse * 0.45, Math.PI * 0.72, Math.PI * 2.28);
    context.stroke();
    if (!staticFrame) {
      const expandingPulse = ((time * 0.018) % 45) / 45;
      context.strokeStyle = `rgba(119, 231, 255, ${0.15 * (1 - expandingPulse)})`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(centerX, centerY, baseRadius * (0.78 + expandingPulse * 0.38), 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }

  const clearCanvas = () => context.clearRect(0, 0, width, height);

  function drawStaticFrame() {
    clearCanvas();
    context.save();
    context.globalCompositeOperation = 'lighter';
    drawConnectionLines();
    drawParticles(0);
    drawGlobePulse(0, true);
    context.restore();
  }

  function drawFrame(time) {
    animationFrameId = null;
    if (reducedMotion || !isVisible || !isPageVisible) return;
    const elapsed = time - lastFrameTime;
    if (elapsed < 16) {
      animationFrameId = requestAnimationFrame(drawFrame);
      return;
    }
    const deltaFactor = Math.min(elapsed / 16.667, 2);
    lastFrameTime = time;
    clearCanvas();
    context.save();
    context.globalCompositeOperation = 'lighter';
    for (const particle of particles) updateParticle(particle, deltaFactor);
    drawConnectionLines();
    drawParticles(time);
    drawGlobePulse(time);
    context.restore();
    animationFrameId = requestAnimationFrame(drawFrame);
  }

  function startAnimation() {
    if (reducedMotion || !isVisible || !isPageVisible || animationFrameId !== null) return;
    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(drawFrame);
  }

  function stopAnimation() {
    if (animationFrameId === null) return;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  function resetPointerPosition() {
    visual.style.setProperty('--astera-pointer-x', '0');
    visual.style.setProperty('--astera-pointer-y', '0');
  }

  function handlePointerMove(event) {
    if (reducedMotion) return;
    const rectangle = visual.getBoundingClientRect();
    if (rectangle.width <= 0 || rectangle.height <= 0) return;
    const localX = (event.clientX - rectangle.left) / rectangle.width;
    const localY = (event.clientY - rectangle.top) / rectangle.height;
    const pointerScale = event.pointerType === 'touch' ? 0.5 : 1;
    const pointerX = clamp((localX - 0.5) * 2, -1, 1) * pointerScale;
    const pointerY = clamp((localY - 0.5) * 2, -1, 1) * pointerScale;
    visual.style.setProperty('--astera-pointer-x', pointerX.toFixed(4));
    visual.style.setProperty('--astera-pointer-y', pointerY.toFixed(4));
  }

  function handleReducedMotionChange(event) {
    reducedMotion = event.matches;
    resetPointerPosition();
    if (reducedMotion) {
      stopAnimation();
      drawStaticFrame();
    } else {
      startAnimation();
    }
  }

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(visual);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = Boolean(entry) && entry.isIntersecting && entry.intersectionRatio > 0.05;
    if (isVisible) startAnimation(); else stopAnimation();
  }, {threshold: [0, 0.05, 0.25]});
  visibilityObserver.observe(visual);

  visual.addEventListener('pointermove', handlePointerMove, {passive: true});
  visual.addEventListener('pointerleave', resetPointerPosition, {passive: true});
  visual.addEventListener('pointercancel', resetPointerPosition, {passive: true});
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) startAnimation(); else stopAnimation();
  });
  reducedMotionQuery.addEventListener?.('change', handleReducedMotionChange);

  resizeCanvas();
  if (reducedMotion) drawStaticFrame(); else startAnimation();
})();
