(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  const depth = visual?.querySelector('[data-astera-depth]');
  if (!(visual instanceof HTMLElement) || !(depth instanceof HTMLElement)) return;

  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
  const DATA_URI_PREFIX = 'data:image/webp;base64,';
  const bounds = Object.freeze({x: 825, y: 1338, width: 110, height: 112});
  const mount = visual.querySelector('[data-astera-svg-mount]') || depth;
  let patchSource = '';

  function cssUrl(value) {
    const match = String(value || '').trim().match(/^url\((['"]?)(.*)\1\)$/s);
    return match?.[2] || '';
  }

  function canonicalizeWebpDataUri(value) {
    if (!value.startsWith(DATA_URI_PREFIX)) return '';
    try {
      const binary = atob(value.slice(DATA_URI_PREFIX.length));
      if (binary.length < 12 || binary.slice(0, 4) !== 'RIFF' || binary.slice(8, 12) !== 'WEBP') return '';
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const declaredBytes = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8;
      if (declaredBytes < 12 || declaredBytes > bytes.length) return '';
      const canonicalBytes = bytes.subarray(0, declaredBytes);
      let canonicalBinary = '';
      for (let offset = 0; offset < canonicalBytes.length; offset += 0x8000) {
        canonicalBinary += String.fromCharCode(...canonicalBytes.subarray(offset, offset + 0x8000));
      }
      return `${DATA_URI_PREFIX}${btoa(canonicalBinary)}`;
    } catch {
      return '';
    }
  }

  function patchFromCssText(source) {
    const base64 = String(source || '').match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/)?.[1];
    return base64 ? canonicalizeWebpDataUri(`${DATA_URI_PREFIX}${base64}`) : '';
  }

  function patchFromLoadedStyles() {
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

  async function resolvePatchSource() {
    const loaded = patchFromLoadedStyles();
    if (loaded) return loaded;

    const response = await fetch('/assets/astera-hero-image.css', {
      credentials: 'same-origin',
      cache: 'force-cache'
    });
    if (!response.ok) throw new Error(`ASTERA_SPARKLE_PATCH_CSS_FETCH_FAILED_${response.status}`);
    const source = patchFromCssText(await response.text());
    if (!source) throw new Error('ASTERA_SPARKLE_PATCH_DATA_MISSING');
    return source;
  }

  function install(svg) {
    if (!(svg instanceof SVGSVGElement)) return false;
    if (svg.querySelector('#lower-right-sparkle-removal')) {
      visual.classList.add('is-sparkle-patch-in-svg');
      return true;
    }
    if (!patchSource) return false;

    const baseLayer = svg.querySelector('#base-image');
    if (!baseLayer) return false;

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

  const attempt = () => install(mount.querySelector('svg[data-astera-layered-svg]'));
  const observer = new MutationObserver(() => {
    if (!attempt()) return;
    observer.disconnect();
  });
  observer.observe(mount, {childList: true, subtree: true});

  resolvePatchSource()
    .then((source) => {
      patchSource = source;
      if (attempt()) observer.disconnect();
    })
    .catch((error) => console.error('[Astera Hero Patch]', error));

  addEventListener('pagehide', () => observer.disconnect(), {once: true});
})();
