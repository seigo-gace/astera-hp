const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');
const root = document.documentElement;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function installPointerLight() {
  if (coarsePointer.matches || reduceMotion.matches) return;
  let frame = 0;
  window.addEventListener('pointermove', (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
    });
  }, {passive: true});
}

function installHeroParallax(stage) {
  if (coarsePointer.matches || reduceMotion.matches) return;
  let frame = 0;
  let nextX = 0;
  let nextY = 0;

  const flush = () => {
    frame = 0;
    stage.style.setProperty('--mx', `${nextX.toFixed(2)}px`);
    stage.style.setProperty('--my', `${nextY.toFixed(2)}px`);
  };

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) - 0.5;
    const relativeY = ((event.clientY - rect.top) / rect.height) - 0.5;
    nextX = clamp(relativeX * 32, -16, 16);
    nextY = clamp(relativeY * 26, -13, 13);
    if (!frame) frame = requestAnimationFrame(flush);
  }, {passive: true});

  stage.addEventListener('pointerleave', () => {
    nextX = 0;
    nextY = 0;
    if (!frame) frame = requestAnimationFrame(flush);
  }, {passive: true});
}

class NetworkField {
  constructor(canvas, stage) {
    this.canvas = canvas;
    this.stage = stage;
    this.context = canvas.getContext('2d', {alpha: true});
    this.dpr = 1;
    this.width = 1;
    this.height = 1;
    this.points = [];
    this.visible = false;
    this.running = false;
    this.frame = 0;
    this.lastTime = 0;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        this.sync();
      },
      {rootMargin: '180px 0px'}
    );
    this.handleVisibility = () => this.sync();
    this.handleMotion = () => {
      this.seed();
      this.sync();
    };
  }

  mount() {
    if (!this.context) return;
    this.resizeObserver.observe(this.stage);
    this.intersectionObserver.observe(this.stage);
    document.addEventListener('visibilitychange', this.handleVisibility);
    reduceMotion.addEventListener('change', this.handleMotion);
    this.resize();
    this.seed();
    this.sync();
  }

  resize() {
    const rect = this.stage.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = Math.max(1, rect.width * 1.16);
    this.height = Math.max(1, rect.height * 1.16);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
  }

  seed() {
    const count = reduceMotion.matches ? 0 : (window.innerWidth < 768 ? 34 : 82);
    const seed = 8042026;
    let state = seed >>> 0;
    const random = () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    };

    this.points = Array.from({length: count}, (_, index) => {
      const angle = random() * Math.PI * 2;
      const radius = 0.12 + random() * 0.43;
      return {
        angle,
        radius,
        speed: (0.000035 + random() * 0.000075) * (index % 3 === 0 ? -1 : 1),
        size: 0.8 + random() * 1.9,
        alpha: 0.18 + random() * 0.58,
        amber: random() > 0.88,
        tilt: 0.55 + random() * 0.35
      };
    });
  }

  sync() {
    const shouldRun = this.visible && !document.hidden && !reduceMotion.matches;
    if (shouldRun && !this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.frame = requestAnimationFrame((time) => this.draw(time));
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.frame);
      this.context.clearRect(0, 0, this.width, this.height);
    }
  }

  draw(time) {
    if (!this.running) return;
    const delta = Math.min(34, time - this.lastTime);
    this.lastTime = time;
    const context = this.context;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const scale = Math.min(this.width, this.height);
    context.clearRect(0, 0, this.width, this.height);

    const positions = this.points.map((point) => {
      point.angle += point.speed * delta;
      const x = centerX + Math.cos(point.angle) * point.radius * scale;
      const y = centerY + Math.sin(point.angle) * point.radius * scale * point.tilt;
      return {...point, x, y};
    });

    context.lineWidth = 0.7;
    for (let index = 0; index < positions.length; index += 1) {
      const point = positions[index];
      for (let otherIndex = index + 1; otherIndex < positions.length; otherIndex += 1) {
        const other = positions[otherIndex];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        const threshold = scale * 0.105;
        if (distance > threshold) continue;
        const alpha = (1 - distance / threshold) * 0.11;
        context.strokeStyle = `rgba(74, 226, 248, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }

    for (const point of positions) {
      const color = point.amber ? '241, 161, 88' : '95, 237, 255';
      const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.size * 5.5);
      glow.addColorStop(0, `rgba(${color}, ${point.alpha})`);
      glow.addColorStop(0.16, `rgba(${color}, ${(point.alpha * 0.7).toFixed(3)})`);
      glow.addColorStop(1, `rgba(${color}, 0)`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(point.x, point.y, point.size * 5.5, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = `rgba(${color}, ${Math.min(1, point.alpha + 0.22)})`;
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fill();
    }

    this.frame = requestAnimationFrame((nextTime) => this.draw(nextTime));
  }
}

function installNetworkHero() {
  const stage = document.querySelector('[data-network-stage]');
  const canvas = document.querySelector('[data-network-canvas]');
  if (!stage || !(canvas instanceof HTMLCanvasElement)) return;
  installHeroParallax(stage);
  const field = new NetworkField(canvas, stage);
  field.mount();
}

installPointerLight();
installNetworkHero();
