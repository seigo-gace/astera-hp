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

test('Header upper row remains logo-left and compact language-right', async () => {
  const header = await read('site/templates/partials/header.html');
  const css = await read('site/assets/navigation-canonical.css');
  const app = await read('site/assets/app.js');
  const materializer = await read('site/scripts/materialize-binary-assets.mjs');
  const manifest = JSON.parse(await read('site/data/asset-manifest.json'));

  const upperStart = header.indexOf('<div class="header-upper"');
  const actionStart = header.indexOf('<div class="header-action-row"', upperStart);
  const brand = header.indexOf('class="brand brand-official"', upperStart);
  const language = header.indexOf('class="language-select-field"', upperStart);
  assert.ok(upperStart >= 0 && actionStart > upperStart, 'Header upper row is missing');
  assert.ok(brand > upperStart && brand < language && language < actionStart, 'Upper row order must be logo then language');

  assert.match(header, /<a class="brand brand-official" href="\/" aria-label="Asteraトップページへ戻る">/);
  assert.match(header, /<option value="ja" selected>JP<\/option>/);
  assert.match(header, /<option value="en" disabled>EN<\/option>/);
  assert.ok(header.includes('/assets/brand/astera-logo-dark.svg'));

  for (const marker of ['--header-upper-height:46px','.header-upper-shell','width:54px','margin-left:auto','@media(max-width:599px)']) {
    assert.ok(css.includes(marker), `Missing upper header marker: ${marker}`);
  }

  for (const marker of [
    "q('[data-language-select]')",
    "localStorage.getItem('astera-language')",
    "localStorage.setItem('astera-language', next)",
    "document.documentElement.lang = next"
  ]) assert.ok(app.includes(marker), `Missing language behavior marker: ${marker}`);

  const verified = new Map(manifest.brand.map((asset) => [asset.file, asset]));
  assert.equal(verified.get('/assets/brand/astera-logo-dark.svg')?.sha256, 'cab61af560b3165130f7e8d922c093911f41e822ff01ea0c139db494c4612e52');
  assert.ok(materializer.includes("file: 'astera-logo-dark.svg'"));
});

test('Header action row is directly below upper row and keeps App, AI, Menu in that order', async () => {
  const header = await read('site/templates/partials/header.html');
  const css = await read('site/assets/navigation-canonical.css');
  const script = await read('site/assets/navigation-canonical.js');
  const base = await read('site/templates/base.html');
  const robot = await read('site/assets/icons/ai-guide-robot.svg');

  const upper = header.indexOf('<div class="header-upper"');
  const actions = header.indexOf('<div class="header-action-row"', upper);
  const appEntry = header.indexOf('data-app-entry', actions);
  const aiEntry = header.indexOf('data-ai-launcher', actions);
  const menuEntry = header.indexOf('data-nav-toggle', actions);
  const drawer = header.indexOf('id="global-nav"', actions);
  assert.ok(upper >= 0 && actions > upper, 'Action row must be under the upper row');
  assert.ok(appEntry > actions && appEntry < aiEntry && aiEntry < menuEntry && menuEntry < drawer, 'Action order must be App, AI, Menu');

  assert.match(header, /data-app-route="\/app\/"/);
  assert.match(header, /src="\/assets\/icons\/ai-guide-robot\.svg"/);
  assert.match(header, /aria-controls="customer-ai"/);
  assert.match(header, /aria-controls="global-nav"/);
  assert.doesNotMatch(header.slice(drawer), /data-language-select|data-ai-launcher|data-app-entry/);

  for (const marker of [
    '--header-action-height:60px',
    '--header-cyan:#67e8ff',
    '--header-pink:#ff62c7',
    '.header-action-controls',
    '.header-app-entry',
    '.header-ai-launcher',
    '.global-nav.is-open',
    'body.nav-open .nav-backdrop',
    '.side-menu-accordion__trigger'
  ]) assert.ok(css.includes(marker), `Missing action header marker: ${marker}`);

  for (const marker of [
    "document.querySelector('[data-nav-toggle]')",
    "document.querySelector('[data-app-entry]')",
    'window.location.assign(route)',
    "document.querySelectorAll('[data-nav-accordion]')",
    'globalNav.inert = !open'
  ]) assert.ok(script.includes(marker), `Missing action behavior marker: ${marker}`);

  assert.doesNotMatch(base, /<button class="ai-launcher"/);
  assert.match(base, /id="customer-ai"/);
  assert.match(robot, /提供画像の上段右から2番目のロボットアイコン/);
  assert.match(robot, /data:image\/webp;base64,/);
});

test('Side menu follows the canonical five-item structure without duplicating header controls', async () => {
  const header = await read('site/templates/partials/header.html');
  const drawerStart = header.indexOf('<nav id="global-nav"');
  const drawer = header.slice(drawerStart);

  for (const expected of [
    'data-nav-route="/news/"',
    'data-nav-route="/qa/"',
    'data-nav-route="/pricing/"',
    '>開発者<',
    '>開発支援<',
    'data-nav-route="/developer/"',
    'data-nav-route="/support/"',
    'https://camp-fire.jp/projects/968933/view',
    'data-nav-route="/investors/"'
  ]) assert.ok(drawer.includes(expected), `Missing side menu item: ${expected}`);

  assert.doesNotMatch(drawer, /MAIN 8|use-cases|\/docs\/|data-language-select|data-ai-launcher|data-app-entry/);
  assert.match(drawer, /data-nav-accordion/);
  assert.match(drawer, /side-menu-developer/);
  assert.match(drawer, /side-menu-support/);
});
