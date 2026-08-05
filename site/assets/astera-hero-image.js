(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  const depth = visual?.querySelector('[data-astera-depth]');
  const mount = visual?.querySelector('[data-astera-svg-mount]') || depth;
  if (!(visual instanceof HTMLElement) || !(mount instanceof HTMLElement) || !(depth instanceof HTMLElement)) return;

  const svgSource = visual.dataset.svgSrc || '/assets/visual/hero/astera-globe-exact-layered.svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
  const PATCH_PREFIX = 'data:image/webp;base64,';
  const PATCH_SOURCE = `${PATCH_PREFIX}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`;
  const sparkleRemovalBounds = Object.freeze({x: 825, y: 1338, width: 110, height: 112});
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

  function canonicalizeWebpDataUri(value) {
    if (!value.startsWith(PATCH_PREFIX)) return '';
    try {
      const binary = atob(value.slice(PATCH_PREFIX.length));
      if (binary.length < 12 || binary.slice(0, 4) !== 'RIFF' || binary.slice(8, 12) !== 'WEBP') return '';
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const declaredBytes = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8;
      if (declaredBytes < 12 || declaredBytes > bytes.length) return '';
      const canonicalBytes = bytes.subarray(0, declaredBytes);
      let canonicalBinary = '';
      for (let offset = 0; offset < canonicalBytes.length; offset += 0x8000) {
        canonicalBinary += String.fromCharCode(...canonicalBytes.subarray(offset, offset + 0x8000));
      }
      return `${PATCH_PREFIX}${btoa(canonicalBinary)}`;
    } catch {
      return '';
    }
  }

  function installSparkleRemoval(svg) {
    const existing = svg.querySelector('#lower-right-sparkle-removal');
    if (existing) return true;

    const patchSource = canonicalizeWebpDataUri(PATCH_SOURCE);
    const baseLayer = svg.querySelector('#base-image');
    if (!patchSource || !baseLayer) return false;

    const patch = document.createElementNS(SVG_NAMESPACE, 'image');
    patch.id = 'lower-right-sparkle-removal';
    patch.setAttribute('x', String(sparkleRemovalBounds.x));
    patch.setAttribute('y', String(sparkleRemovalBounds.y));
    patch.setAttribute('width', String(sparkleRemovalBounds.width));
    patch.setAttribute('height', String(sparkleRemovalBounds.height));
    patch.setAttribute('preserveAspectRatio', 'none');
    patch.setAttribute('pointer-events', 'none');
    patch.setAttribute('aria-hidden', 'true');
    patch.setAttribute('href', patchSource);
    patch.setAttributeNS(XLINK_NAMESPACE, 'xlink:href', patchSource);
    baseLayer.after(patch);
    return true;
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
    const sparklePatchInstalled = installSparkleRemoval(svg);
    if (!sparklePatchInstalled) throw new Error('ASTERA_GLOBE_PATCH_INSTALL_FAILED');
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
