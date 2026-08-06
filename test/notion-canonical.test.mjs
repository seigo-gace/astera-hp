import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const main8 = [
  '/product/what-is-astera/', '/product/why-astera/', '/product/value/', '/product/process/',
  '/product/engine/', '/product/usage/', '/product/technology/', '/product/integration/'
];

test('Notion canonical shared shell is retained', async () => {
  const header = await read('site/templates/partials/header.html');
  const footer = await read('site/templates/partials/footer.html');

  for (const expected of [
    'header-upper', 'data-language-select', '>JP<', '>EN<',
    '/assets/brand/astera-logo-dark.svg',
    'header-action-row', 'data-app-route="/app/"', '/assets/icons/ai-guide-robot.svg',
    'data-ai-launcher', 'data-nav-toggle',
    'data-nav-route="/news/"', 'data-nav-route="/qa/"', 'data-nav-route="/pricing/"',
    '>開発者<', '>開発支援<', 'https://camp-fire.jp/projects/968933/view'
  ]) assert.ok(header.includes(expected), `Missing canonical shell marker: ${expected}`);

  assert.doesNotMatch(header, /brand-text|data-official-logo-pending|data-language-open|astera-symbol-dark\.svg/);
  assert.match(header, /<a class="brand brand-official" href="\/" aria-label="Asteraトップページへ戻る">/);

  const upperStart = header.indexOf('<div class="header-upper"');
  const actionStart = header.indexOf('<div class="header-action-row"', upperStart);
  const brand = header.indexOf('class="brand brand-official"', upperStart);
  const language = header.indexOf('class="language-select-field"', upperStart);
  assert.ok(brand > upperStart && brand < language && language < actionStart, 'Header upper order must be logo then language');

  const appEntry = header.indexOf('data-app-entry', actionStart);
  const aiEntry = header.indexOf('data-ai-launcher', actionStart);
  const menuEntry = header.indexOf('data-nav-toggle', actionStart);
  assert.ok(appEntry < aiEntry && aiEntry < menuEntry, 'Header action order must be App, AI, Menu');

  const navStart = header.indexOf('<nav id="global-nav"');
  const navEnd = header.indexOf('</nav>', navStart);
  assert.ok(navStart >= 0 && navEnd > navStart, 'Side menu must exist');
  assert.doesNotMatch(header.slice(navStart, navEnd), /data-language-select|data-ai-launcher|data-app-entry|MAIN 8|\/docs\/|use-cases/, 'Header controls and forbidden categories must not be duplicated in Side Menu');

  for (const expected of ['問いを星図に変える。','利用規約','Privacy','特商法']) assert.match(footer, new RegExp(expected));
});

test('TOP retains canonical section order and a clean latest user-provided hero image', async () => {
  const source = await read('site/templates/home.html');
  const expectedOrder = ['class="hero ', '{{HOME_SUMMARY}}', 'class="process ', 'class="comparison ', 'class="main-eight ', 'class="capsule ', 'class="audiences ', 'class="evidence ', 'class="final-cta '];
  let previous = -1;
  for (const marker of expectedOrder) {
    const current = source.indexOf(marker);
    assert.ok(current > previous, `${marker} must retain canonical order`);
    previous = current;
  }
  for (const expected of [
    'assets/images/astera-globe-top.webp', 'assets/visual/process/process-purpose.svg',
    'assets/visual/comparison/comparison-portal.svg', 'assets/visual/capsule/capsule-radar.svg',
    'assets/visual/audience/audience-personal.svg', 'assets/visual/cta/cta-support.svg',
    'data-astera-hero', 'data-network-hero'
  ]) assert.match(source, new RegExp(expected.replaceAll('.', '\\.')));
  assert.doesNotMatch(source, /STABLE|LOAD 62%|128K TOKENS|旧衛星|astera-hero-canvas|astera-hero-hud|astera-hero-orbit|astera-data-node|<canvas/);
});

test('base loads canonical, hero and completion layers without a duplicate floating AI launcher', async () => {
  const source = await read('site/templates/base.html');
  assert.match(source, /assets\/style\.css/);
  assert.match(source, /assets\/navigation-canonical\.css/);
  assert.match(source, /assets\/astera-aurora\.css/);
  assert.match(source, /assets\/astera-hero-image\.css/);
  assert.match(source, /assets\/notion-complete\.css/);
  assert.match(source, /assets\/app\.js/);
  assert.match(source, /assets\/navigation-canonical\.js/);
  assert.match(source, /assets\/motion\.js/);
  assert.match(source, /id="customer-ai"/);
  assert.doesNotMatch(source, /<canvas|astera-hero-hud|data-language-dialog|language-dialog|<button class="ai-launcher"/);
});

test('built TOP exposes Main 8 and the required summary in order', async () => {
  const html = await read('site/dist/index.html');
  let previous = -1;
  for (const route of main8) {
    const current = html.indexOf(`href="${route}"`);
    assert.ok(current > previous, `${route} must exist in Main 8 order`);
    previous = current;
  }
  assert.match(html, /このページで分かること/);
  assert.match(html, /main-eight-card-visual/);
  assert.match(html, /AI USAGE QUALITY LAYER/);
  assert.match(html, /JUDGMENT CAPSULE/);
  assert.match(html, /Astera総合案内AI/);
  assert.doesNotMatch(html, /astera-hero-hud|astera-hero-orbit|astera-data-node|data-astera-canvas/);
});

test('pricing remains an external App link, never an HP pricing page', async () => {
  const redirects = await read('site/public/_redirects');
  assert.match(redirects, /\/pricing https:\/\/app\.asterav8\.jp\/pricing 301/);
  const home = await read('site/dist/index.html');
  assert.match(home, /https:\/\/app\.asterav8\.jp\/pricing/);
  assert.doesNotMatch(home, /料金表|Credit表|Plan比較/);
});

test('latest user-provided TOP image and supporting visual assets are materialized while remaining brand assets stay blocked', async () => {
  const manifest = JSON.parse(await read('site/data/asset-manifest.json'));
  const hero = manifest.visual.find((asset) => asset.id === 'astera-globe-top');
  assert.equal(hero.file, '/assets/images/astera-globe-top.webp');
  assert.equal(hero.status, 'user-provided-web-optimized');
  assert.equal(hero.sha256, '64f34c997275d1769c8b767957038eaf1bfe3f0f0dd672e68ea550bc5314b8b2');
  assert.ok(hero.psnrDb >= 43.5);
  assert.match(manifest.status, /brand-byte-production-blocked/);

  const darkLogo = manifest.brand.find((asset) => asset.file === '/assets/brand/astera-logo-dark.svg');
  const darkSymbol = manifest.brand.find((asset) => asset.file === '/assets/brand/astera-symbol-dark.svg');
  assert.equal(darkLogo?.status, 'verified-notion-hash');
  assert.equal(darkSymbol?.status, 'verified-notion-hash');
  assert.ok(manifest.brand.some((asset) => asset.status === 'pending-byte-verification'));

  const heroInfo = await stat(new URL('../site/assets/images/astera-globe-top.webp', import.meta.url));
  assert.equal(heroInfo.size, 178672);
  for (const asset of manifest.visual.filter((item) => item.file.endsWith('.svg'))) {
    const url = new URL(`../site/${asset.file.replace(/^\//, '')}`, import.meta.url);
    const info = await stat(url);
    assert.ok(info.size > 500, `${asset.id} must be materialized`);
    assert.match(await readFile(url, 'utf8'), /^<svg\b/);
  }
});
