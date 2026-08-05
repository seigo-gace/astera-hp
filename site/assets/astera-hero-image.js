(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  const depth = visual?.querySelector('[data-astera-depth]');
  const mount = visual?.querySelector('[data-astera-svg-mount]') || depth;
  if (!(visual instanceof HTMLElement) || !(depth instanceof HTMLElement) || !(mount instanceof HTMLElement)) return;

  const svgSource = visual.dataset.svgSrc || '/assets/visual/hero/astera-globe-exact-layered.svg';
  const patchAsset = '/assets/images/astera-globe-lower-right-restoration.webp';
  const patchBounds = Object.freeze({x: 825, y: 1338, width: 110, height: 112});
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
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

  function installSparkleRemoval(svg) {
    const patch = svg.querySelector('#lower-right-sparkle-removal');
    if (!(patch instanceof SVGImageElement)) return false;

    const actual = {
      x: Number(patch.getAttribute('x')),
      y: Number(patch.getAttribute('y')),
      width: Number(patch.getAttribute('width')),
      height: Number(patch.getAttribute('height'))
    };
    if (Object.entries(patchBounds).some(([key, value]) => actual[key] !== value)) return false;

    patch.setAttribute('href', patchAsset);
    patch.removeAttribute('xlink:href');
    patch.removeAttributeNS(XLINK_NAMESPACE, 'href');
    patch.setAttribute('preserveAspectRatio', 'none');
    patch.setAttribute('pointer-events', 'none');
    patch.setAttribute('aria-hidden', 'true');
    return patch.getAttribute('href') === patchAsset;
  }

  function parseLayeredSvg(source) {
    const documentNode = new DOMParser().parseFromString(source, 'image/svg+xml');
    if (documentNode.querySelector('parsererror')) throw new Error('ASTERA_GLOBE_SVG_PARSE_FAILED');
    const svg = documentNode.documentElement;
    if (svg.localName !== 'svg' || svg.querySelector('script, foreignObject')) throw new Error('ASTERA_GLOBE_SVG_UNSAFE');
    for (const selector of ['#base-image', '#effects-orbits', '#effects-particles', '#effects-front', '#lower-right-sparkle-removal']) {
      if (!svg.querySelector(selector)) throw new Error(`ASTERA_GLOBE_LAYER_CONTRACT_MISSING_${selector}`);
    }
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

    const lines = [...svg.querySelectorAll('.data-line')];
    const nodes = [...svg.querySelectorAll('.glow-node')];
    const particles = [...svg.querySelectorAll('.ambient-particle')];
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
        gsap.set(lines, {strokeDasharray: 'none', strokeDashoffset: 0, opacity: 0.6});
        gsap.set(nodes, {opacity: 0.76, scale: 1});
        gsap.set(particles, {opacity: 0.3});
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

      if (orbitLayer) track(gsap.to(orbitLayer, {rotation: 360, duration: 120, ease: 'none', repeat: -1}));
      if (behindLayer) track(gsap.to(behindLayer, {scale: 1.028, opacity: 0.92, duration: 8.4, ease: 'sine.inOut', repeat: -1, yoyo: true}));
      if (frontLayer) track(gsap.to(frontLayer, {scale: 1.008, opacity: 0.9, duration: 5.6, ease: 'sine.inOut', repeat: -1, yoyo: true}));

      lines.forEach((line, index) => {
        const length = Math.max(1, line.getTotalLength());
        const segment = clamp(length * (0.06 + (index % 4) * 0.012), 18, 92);
        const direction = index % 2 === 0 ? 1 : -1;
        gsap.set(line, {
          strokeDasharray: `${segment} ${Math.max(24, length - segment)}`,
          strokeDashoffset: direction * length,
          opacity: index % 3 === 0 ? 0.82 : 0.64
        });
        track(gsap.to(line, {
          strokeDashoffset: direction * -length,
          duration: 6.2 + (index % 5) * 0.85,
          delay: -(index * 0.48),
          ease: 'none',
          repeat: -1
        }));
      });

      nodes.forEach((node, index) => {
        gsap.set(node, {transformOrigin: '50% 50%', transformBox: 'fill-box'});
        track(gsap.to(node, {
          opacity: 0.38 + (index % 4) * 0.1,
          scale: 0.66 + (index % 3) * 0.08,
          duration: 1.4 + (index % 5) * 0.28,
          delay: -(index * 0.17),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        }));
      });

      particles.forEach((particle, index) => {
        track(gsap.to(particle, {
          x: (index % 2 ? 1 : -1) * (4 + index),
          y: -8 - (index % 4) * 3,
          opacity: 0.18 + (index % 3) * 0.1,
          duration: 4.8 + (index % 4) * 0.8,
          delay: -(index * 0.43),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
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

      const resetPointer = () => {
        rotateX(0);
        rotateY(0);
        translateX(0);
        translateY(0);
        orbitX(0);
        orbitY(0);
      };
      const onPointerMove = (event) => {
        if (document.hidden) return;
        const box = visual.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const x = clamp(((event.clientX - box.left) / box.width - 0.5) * 2, -1, 1);
        const y = clamp(((event.clientY - box.top) / box.height - 0.5) * 2, -1, 1);
        rotateX(y * -5.4);
        rotateY(x * 6.2);
        translateX(x * 7);
        translateY(y * 5);
        orbitX(x * 10);
        orbitY(y * 8);
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
      cleanups.forEach((cleanup) => cleanup());
      animations.forEach((animation) => animation.kill());
      context.revert();
    };
  }

  async function mountLayeredSvg() {
    const response = await fetch(svgSource, {credentials: 'same-origin', cache: 'force-cache'});
    if (!response.ok) throw new Error(`ASTERA_GLOBE_SVG_FETCH_FAILED_${response.status}`);
    const svg = parseLayeredSvg(await response.text());
    if (!installSparkleRemoval(svg)) throw new Error('ASTERA_GLOBE_PATCH_CONTRACT_INVALID');

    const embeddedImage = svg.querySelector('#base-image image');
    embeddedImage?.addEventListener('load', () => visual.classList.add('is-svg-image-ready'), {once: true});
    embeddedImage?.addEventListener('error', () => visual.classList.add('is-svg-image-failed'), {once: true});

    mount.append(svg);
    visual.classList.add('is-svg-mounted', 'is-sparkle-patch-in-svg');
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
