(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  const depth = visual?.querySelector('[data-astera-depth]');
  const mount = visual?.querySelector('[data-astera-svg-mount]') || depth;
  if (!(visual instanceof HTMLElement) || !(mount instanceof HTMLElement) || !(depth instanceof HTMLElement)) return;

  const svgSource = visual.dataset.svgSrc || '/assets/visual/hero/astera-globe-exact-layered.svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  let disposeMotion = () => {};
  let disposed = false;

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  function ensureGsap() {
    if (window.gsap) return Promise.resolve(window.gsap);
    const existing = document.querySelector('script[data-astera-gsap]');
    if (existing) return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(window.gsap), {once: true});
      existing.addEventListener('error', () => reject(new Error('ASTERA_GSAP_LOAD_FAILED')), {once: true});
    });
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/assets/vendor/gsap-3.12.2.min.js';
      script.async = true;
      script.dataset.asteraGsap = 'true';
      script.addEventListener('load', () => window.gsap ? resolve(window.gsap) : reject(new Error('ASTERA_GSAP_GLOBAL_MISSING')), {once: true});
      script.addEventListener('error', () => reject(new Error('ASTERA_GSAP_LOAD_FAILED')), {once: true});
      document.head.append(script);
    });
  }

  function parseLayeredSvg(source) {
    const documentNode = new DOMParser().parseFromString(source, 'image/svg+xml');
    if (documentNode.querySelector('parsererror')) throw new Error('ASTERA_GLOBE_SVG_PARSE_FAILED');
    const svg = documentNode.documentElement;
    if (svg.localName !== 'svg' || svg.querySelector('script, foreignObject')) throw new Error('ASTERA_GLOBE_SVG_UNSAFE');
    if (!svg.querySelector('#base-image, #effects-orbits, #effects-particles, #effects-front')) throw new Error('ASTERA_GLOBE_LAYER_CONTRACT_MISSING');
    svg.classList.add('astera-hero-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    return document.importNode(svg, true);
  }

  function createMotion(svg) {
    const gsap = window.gsap;
    if (!gsap) {
      visual.classList.add('is-svg-static');
      return () => {};
    }

    const lines = [...svg.querySelectorAll('.data-line')].filter((line) => getComputedStyle(line).display !== 'none');
    const nodes = [...svg.querySelectorAll('.glow-node')].filter((node) => getComputedStyle(node).display !== 'none');
    const particles = [...svg.querySelectorAll('.ambient-particle')].filter((node) => getComputedStyle(node).display !== 'none');
    const orbitLayer = svg.querySelector('#effects-orbits');
    const particleLayer = svg.querySelector('#effects-particles');
    const behindLayer = svg.querySelector('#effects-behind');
    const frontLayer = svg.querySelector('#effects-front');
    const animations = [];
    const cleanups = [];
    const track = (animation) => {
      animations.push(animation);
      return animation;
    };

    const context = gsap.context(() => {
      gsap.set(svg, {transformOrigin: '50% 52%', transformBox: 'view-box'});
      gsap.set([orbitLayer, particleLayer, behindLayer, frontLayer].filter(Boolean), {
        transformOrigin: '50% 52%',
        transformBox: 'view-box'
      });

      if (reducedMotion.matches) {
        gsap.set(lines, {strokeDasharray: 'none', strokeDashoffset: 0, opacity: 0.58});
        gsap.set(nodes, {opacity: 0.78, scale: 1});
        gsap.set(particles, {opacity: 0.3});
        gsap.set([svg, depth, orbitLayer, particleLayer, behindLayer, frontLayer].filter(Boolean), {clearProps: 'transform'});
        return;
      }

      track(gsap.to(svg, {
        y: -7,
        rotationZ: 0.16,
        scale: 1.006,
        duration: 6.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      }));
      if (behindLayer) track(gsap.to(behindLayer, {
        scale: 1.028,
        opacity: 0.92,
        duration: 8.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      }));
      if (orbitLayer) track(gsap.to(orbitLayer, {
        rotation: 360,
        duration: 120,
        ease: 'none',
        repeat: -1
      }));
      if (frontLayer) track(gsap.to(frontLayer, {
        opacity: 0.9,
        scale: 1.008,
        duration: 5.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      }));

      lines.forEach((line, index) => {
        const length = Math.max(1, line.getTotalLength());
        const segment = clamp(length * gsap.utils.random(0.055, 0.11), 18, 92);
        const gap = Math.max(24, length - segment);
        const direction = index % 2 === 0 ? 1 : -1;
        gsap.set(line, {
          strokeDasharray: `${segment} ${gap}`,
          strokeDashoffset: direction * length,
          opacity: index % 3 === 0 ? 0.82 : 0.64
        });
        track(gsap.to(line, {
          strokeDashoffset: direction * -length,
          duration: gsap.utils.random(5.8, 10.8),
          delay: gsap.utils.random(-8, 0),
          ease: 'none',
          repeat: -1
        }));
      });

      nodes.forEach((node, index) => {
        const depthFactor = Number(node.dataset.depth || 1);
        gsap.set(node, {transformOrigin: '50% 50%', transformBox: 'fill-box'});
        track(gsap.to(node, {
          opacity: gsap.utils.random(0.34, 0.72),
          scale: gsap.utils.random(0.58, 0.82) * depthFactor,
          duration: gsap.utils.random(1.15, 2.65),
          delay: -(index * 0.17 + gsap.utils.random(0, 1.8)),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          repeatRefresh: true
        }));
      });

      particles.forEach((particle, index) => {
        track(gsap.to(particle, {
          x: gsap.utils.random(-9, 9),
          y: gsap.utils.random(-18, -7),
          opacity: gsap.utils.random(0.12, 0.48),
          duration: gsap.utils.random(4.5, 8.5),
          delay: -index * 0.43,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          repeatRefresh: true
        }));
      });
    }, visual);

    let inViewport = true;
    let pageVisible = !document.hidden;
    const syncPlayback = () => {
      const active = inViewport && pageVisible && !reducedMotion.matches;
      for (const animation of animations) active ? animation.resume() : animation.pause();
    };

    const viewportObserver = new IntersectionObserver(([entry]) => {
      inViewport = Boolean(entry?.isIntersecting && entry.intersectionRatio > 0.04);
      syncPlayback();
    }, {threshold: [0, 0.04, 0.2]});
    viewportObserver.observe(visual);
    cleanups.push(() => viewportObserver.disconnect());

    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      syncPlayback();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    cleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

    if (!reducedMotion.matches && finePointer.matches) {
      const rotateX = gsap.quickTo(depth, 'rotationX', {duration: 0.62, ease: 'power3.out'});
      const rotateY = gsap.quickTo(depth, 'rotationY', {duration: 0.62, ease: 'power3.out'});
      const translateX = gsap.quickTo(depth, 'x', {duration: 0.68, ease: 'power3.out'});
      const translateY = gsap.quickTo(depth, 'y', {duration: 0.68, ease: 'power3.out'});
      const orbitX = orbitLayer ? gsap.quickTo(orbitLayer, 'x', {duration: 0.8, ease: 'power3.out'}) : () => {};
      const orbitY = orbitLayer ? gsap.quickTo(orbitLayer, 'y', {duration: 0.8, ease: 'power3.out'}) : () => {};
      const particleX = particleLayer ? gsap.quickTo(particleLayer, 'x', {duration: 0.9, ease: 'power3.out'}) : () => {};
      const particleY = particleLayer ? gsap.quickTo(particleLayer, 'y', {duration: 0.9, ease: 'power3.out'}) : () => {};

      const resetPointer = () => {
        rotateX(0);
        rotateY(0);
        translateX(0);
        translateY(0);
        orbitX(0);
        orbitY(0);
        particleX(0);
        particleY(0);
      };
      const onPointerMove = (event) => {
        if (document.hidden) return;
        const box = visual.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const normalizedX = clamp(((event.clientX - box.left) / box.width - 0.5) * 2, -1, 1);
        const normalizedY = clamp(((event.clientY - box.top) / box.height - 0.5) * 2, -1, 1);
        rotateX(normalizedY * -5.4);
        rotateY(normalizedX * 6.2);
        translateX(normalizedX * 7);
        translateY(normalizedY * 5);
        orbitX(normalizedX * 10);
        orbitY(normalizedY * 8);
        particleX(normalizedX * -7);
        particleY(normalizedY * -6);
      };
      visual.addEventListener('pointermove', onPointerMove, {passive: true});
      visual.addEventListener('pointerleave', resetPointer, {passive: true});
      visual.addEventListener('pointercancel', resetPointer, {passive: true});
      cleanups.push(() => {
        visual.removeEventListener('pointermove', onPointerMove);
        visual.removeEventListener('pointerleave', resetPointer);
        visual.removeEventListener('pointercancel', resetPointer);
      });
    }

    syncPlayback();
    return () => {
      for (const cleanup of cleanups) cleanup();
      for (const animation of animations) animation.kill();
      context.revert();
    };
  }

  async function mountLayeredSvg() {
    if (!svgSource) throw new Error('ASTERA_GLOBE_SVG_SOURCE_MISSING');
    const response = await fetch(svgSource, {credentials: 'same-origin', cache: 'force-cache'});
    if (!response.ok) throw new Error(`ASTERA_GLOBE_SVG_FETCH_FAILED_${response.status}`);
    const svg = parseLayeredSvg(await response.text());
    const embeddedImage = svg.querySelector('image');

    embeddedImage?.addEventListener('load', () => visual.classList.add('is-svg-image-ready'), {once: true});
    embeddedImage?.addEventListener('error', () => visual.classList.add('is-svg-image-failed'), {once: true});
    mount.append(svg);
    visual.classList.add('is-svg-mounted');
    await ensureGsap();
    disposeMotion = createMotion(svg);
  }

  const rebuildMotion = () => {
    const svg = mount.querySelector('svg[data-astera-layered-svg]');
    if (!(svg instanceof SVGSVGElement)) return;
    disposeMotion();
    disposeMotion = createMotion(svg);
  };

  reducedMotion.addEventListener?.('change', rebuildMotion);
  window.addEventListener('pagehide', () => {
    disposed = true;
    disposeMotion();
  }, {once: true});

  mountLayeredSvg().catch((error) => {
    if (disposed) return;
    visual.classList.add('is-svg-failed');
    console.error('[Astera Hero]', error);
  });
})();
