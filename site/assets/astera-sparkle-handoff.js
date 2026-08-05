(() => {
  'use strict';

  const visual = document.querySelector('[data-astera-hero]');
  const depth = visual?.querySelector('[data-astera-depth]');
  if (!(visual instanceof HTMLElement) || !(depth instanceof HTMLElement)) return;

  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
  const DATA_URI_PREFIX = 'data:image/webp;base64,';
  const RAW_PATCH_SOURCE = `${DATA_URI_PREFIX}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`;
  const bounds = Object.freeze({x: 825, y: 1338, width: 110, height: 112});
  const mount = visual.querySelector('[data-astera-svg-mount]') || depth;

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

  const patchSource = canonicalizeWebpDataUri(RAW_PATCH_SOURCE);
  if (!patchSource) {
    console.error('[Astera Hero Patch] ASTERA_SPARKLE_PATCH_DATA_INVALID');
    return;
  }

  function install(svg) {
    if (!(svg instanceof SVGSVGElement)) return false;
    if (svg.querySelector('#lower-right-sparkle-removal')) {
      visual.classList.add('is-sparkle-patch-in-svg');
      return true;
    }

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
  if (attempt()) return;

  const observer = new MutationObserver(() => {
    if (!attempt()) return;
    observer.disconnect();
  });
  observer.observe(mount, {childList: true, subtree: true});
  addEventListener('pagehide', () => observer.disconnect(), {once: true});
})();
