(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  const depth = visual?.querySelector('[data-astera-depth]');
  if (!(visual instanceof HTMLElement) || !(depth instanceof HTMLElement)) return;

  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
  const bounds = Object.freeze({x: 825, y: 1338, width: 110, height: 112});

  function cssUrl(value) {
    const match = String(value || '').trim().match(/^url\((['"]?)(.*)\1\)$/s);
    return match?.[2] || '';
  }

  function canonicalizeWebpDataUri(value) {
    const prefix = 'data:image/webp;base64,';
    if (!value.startsWith(prefix)) return '';
    try {
      const binary = atob(value.slice(prefix.length));
      if (binary.length < 12 || binary.slice(0, 4) !== 'RIFF' || binary.slice(8, 12) !== 'WEBP') return '';
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const declaredBytes = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8;
      if (declaredBytes < 12 || declaredBytes > bytes.length) return '';
      const canonicalBytes = bytes.subarray(0, declaredBytes);
      let canonicalBinary = '';
      for (let offset = 0; offset < canonicalBytes.length; offset += 0x8000) {
        canonicalBinary += String.fromCharCode(...canonicalBytes.subarray(offset, offset + 0x8000));
      }
      return `${prefix}${btoa(canonicalBinary)}`;
    } catch {
      return '';
    }
  }

  function readPatchSource() {
    const computed = canonicalizeWebpDataUri(cssUrl(getComputedStyle(depth, '::after').backgroundImage));
    if (computed) return computed;

    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (!(rule instanceof CSSStyleRule)) continue;
        if (!rule.selectorText?.split(',').some((selector) => selector.trim() === '.astera-hero-depth::after')) continue;
        const source = canonicalizeWebpDataUri(cssUrl(rule.style.backgroundImage));
        if (source) return source;
      }
    }
    return '';
  }

  function install(svg) {
    if (!(svg instanceof SVGSVGElement)) return false;
    if (svg.querySelector('#lower-right-sparkle-removal')) {
      visual.classList.add('is-sparkle-patch-in-svg');
      return true;
    }

    const baseLayer = svg.querySelector('#base-image');
    const patchSource = readPatchSource();
    if (!baseLayer || !patchSource) return false;

    const patch = document.createElementNS(SVG_NAMESPACE, 'image');
    patch.id = 'lower-right-sparkle-removal';
    patch.setAttribute('x', String(bounds.x));
    patch.setAttribute('y', String(bounds.y));
    patch.setAttribute('width', String(bounds.width));
    patch.setAttribute('height', String(bounds.height));
    patch.setAttribute('preserveAspectRatio', 'none');
    patch.setAttribute('pointer-events', 'none');
    patch.setAttribute('aria-hidden', 'true');
    patch.setAttribute('href', patchSource);
    patch.setAttributeNS(XLINK_NAMESPACE, 'xlink:href', patchSource);
    baseLayer.after(patch);
    visual.classList.add('is-sparkle-patch-in-svg');
    return true;
  }

  const mount = visual.querySelector('[data-astera-svg-mount]') || depth;
  const attempt = () => install(mount.querySelector('svg[data-astera-layered-svg]'));
  if (attempt()) return;

  const observer = new MutationObserver(() => {
    if (!attempt()) return;
    observer.disconnect();
  });
  observer.observe(mount, {childList: true, subtree: true});
  addEventListener('pagehide', () => observer.disconnect(), {once: true});
})();
