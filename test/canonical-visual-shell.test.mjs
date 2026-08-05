import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('TOP globe sits on pure black without a card while all SVG effects remain visible', async () => {
  const css = await read('site/assets/astera-hero-restoration.css');

  for (const marker of [
    'background:#000 !important',
    'border:0 !important',
    'border-radius:0 !important',
    'box-shadow:none !important',
    '.astera-hero-svg #effects-orbits',
    '.astera-hero-svg #effects-particles',
    '.astera-hero-svg #effects-front',
    '.astera-hero-svg .data-line',
    '.astera-hero-svg .glow-node',
    'display:inline !important',
    'visibility:visible !important',
    '@keyframes asteraBlackStageStream'
  ]) assert.ok(css.includes(marker), `Missing canonical black-stage marker: ${marker}`);

  assert.doesNotMatch(css, /\.astera-hero-depth[^{]*\{[^}]*border-radius:(?!0)/s);
});

test('mobile navigation contains Main 8 inside the same readable menu flow', async () => {
  const header = await read('site/templates/partials/header.html');
  const css = await read('site/assets/navigation-canonical.css');
  const script = await read('site/assets/navigation-canonical.js');
  const base = await read('site/templates/base.html');

  const navStart = header.indexOf('<nav id="global-nav"');
  const navEnd = header.indexOf('</nav>', navStart);
  const productMenu = header.indexOf('id="product-menu"', navStart);
  assert.ok(navStart >= 0 && navEnd > navStart, 'Global navigation is missing');
  assert.ok(productMenu > navStart && productMenu < navEnd, 'Main 8 must be nested inside the global menu');
  assert.ok(header.indexOf('{{MAIN8_LINKS}}', productMenu) < navEnd, 'Main 8 links are not inside the menu');

  for (const marker of [
    '.global-nav>.product-menu',
    'position:static',
    'grid-template-columns:46px minmax(0,1fr)',
    '.nav-meta',
    'background:#000',
    'min-height:calc(100dvh - 70px)'
  ]) assert.ok(css.includes(marker), `Missing canonical navigation marker: ${marker}`);

  assert.ok(script.includes('exposeMain8InMobileMenu'));
  assert.ok(script.includes('productMenu.hidden = false'));
  assert.ok(script.includes("productToggle.setAttribute('aria-expanded', 'true')"));
  assert.ok(base.includes('/assets/navigation-canonical.css'));
  assert.ok(base.includes('/assets/navigation-canonical.js'));
});
