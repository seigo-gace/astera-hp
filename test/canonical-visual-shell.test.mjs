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

test('Header upper row keeps an extensible language dropdown on the left and verified Astera assets on the right', async () => {
  const header = await read('site/templates/partials/header.html');
  const css = await read('site/assets/navigation-canonical.css');
  const app = await read('site/assets/app.js');
  const base = await read('site/templates/base.html');
  const materializer = await read('site/scripts/materialize-binary-assets.mjs');
  const manifest = JSON.parse(await read('site/data/asset-manifest.json'));

  const upperStart = header.indexOf('<div class="header-upper">');
  const upperEnd = header.indexOf('</div>\n  </div>\n  <div class="header-action-row">', upperStart);
  const language = header.indexOf('class="language-select"', upperStart);
  const brand = header.indexOf('class="brand brand-official"', upperStart);
  assert.ok(upperStart >= 0 && upperEnd > upperStart, 'Canonical header upper row is missing');
  assert.ok(language > upperStart && language < brand, 'Language dropdown must be left of the official logo');
  assert.ok(brand < upperEnd, 'Official logo must remain inside the header upper row');

  assert.match(header, /<select[^>]+data-language-select/);
  assert.match(header, /<option value="ja" selected>日本語<\/option>/);
  assert.match(header, /<option value="en" disabled>English（準備中）<\/option>/);
  assert.doesNotMatch(header, /data-language-open|language-switch__divider|language-switch__option/);
  assert.ok(header.includes('/assets/brand/astera-logo-dark.svg'));
  assert.ok(header.includes('/assets/brand/astera-symbol-dark.svg'));

  const navStart = header.indexOf('<nav id="global-nav"');
  const navEnd = header.indexOf('</nav>', navStart);
  const navSource = header.slice(navStart, navEnd);
  assert.doesNotMatch(navSource, /data-language-select|data-language-open|language-button/, 'Language must not be duplicated in the side menu');

  for (const marker of [
    '--header-upper-height:46px',
    '--header-action-height:70px',
    '.header-upper-shell',
    '.language-select-field',
    '.language-select option:disabled',
    '.language-select-arrow',
    'appearance:none',
    'inset:var(--header-total-height) 0 0',
    '@media(max-width:599px)'
  ]) assert.ok(css.includes(marker), `Missing canonical upper-header CSS marker: ${marker}`);

  for (const marker of [
    "q('[data-language-select]')",
    "localStorage.getItem('astera-language')",
    "localStorage.setItem('astera-language', next)",
    "document.documentElement.lang = next"
  ]) assert.ok(app.includes(marker), `Missing language dropdown behavior marker: ${marker}`);
  assert.doesNotMatch(base, /data-language-dialog|language-dialog|data-language-close/);

  const verified = new Map(manifest.brand.map((asset) => [asset.file, asset]));
  assert.deepEqual(verified.get('/assets/brand/astera-logo-dark.svg'), {
    file: '/assets/brand/astera-logo-dark.svg',
    required: true,
    status: 'verified-notion-hash',
    bytes: 35733,
    sha256: 'cab61af560b3165130f7e8d922c093911f41e822ff01ea0c139db494c4612e52',
    usage: 'dark header desktop and tablet'
  });
  assert.deepEqual(verified.get('/assets/brand/astera-symbol-dark.svg'), {
    file: '/assets/brand/astera-symbol-dark.svg',
    required: true,
    status: 'verified-notion-hash',
    bytes: 26011,
    sha256: 'd576d9cc6c4cb09914e807dc2dab62e5b0a2aca049e774599ca43efd24a947bd',
    usage: 'dark header mobile'
  });

  for (const marker of [
    "file: 'astera-logo-dark.svg'",
    "file: 'astera-symbol-dark.svg'",
    'ASTERA_BRAND_HASH_MISMATCH',
    "join(site, 'assets', 'brand', asset.file)"
  ]) assert.ok(materializer.includes(marker), `Missing deterministic brand materialization marker: ${marker}`);
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
