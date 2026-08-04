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
  for (const expected of ['data-official-logo-pending','製品','活用シーン','支援・投資','ドキュメント','会社情報','https://app.asterav8.jp/pricing','CAMPFIRE','LAUNCH APP','Language']) assert.match(header, new RegExp(expected.replaceAll('.', '\\.')));
  assert.doesNotMatch(header, /brand-text/);
  for (const expected of ['問いを星図に変える。','利用規約','Privacy','特商法']) assert.match(footer, new RegExp(expected));
});

test('TOP retains canonical section order and new network-globe visual system', async () => {
  const source = await read('site/templates/home.html');
  const expectedOrder = ['class="hero ', 'class="process ', 'class="comparison ', 'class="main-eight ', 'class="capsule ', 'class="audiences ', 'class="evidence ', 'class="final-cta '];
  let previous = -1;
  for (const marker of expectedOrder) {
    const current = source.indexOf(marker);
    assert.ok(current > previous, `${marker} must retain canonical order`);
    previous = current;
  }
  for (const expected of [
    'assets/visual/hero/hero-core.svg', 'assets/visual/process/process-purpose.svg',
    'assets/visual/comparison/comparison-portal.svg', 'assets/visual/capsule/capsule-radar.svg',
    'assets/visual/audience/audience-personal.svg', 'assets/visual/cta/cta-support.svg',
    'data-network-canvas', 'data-network-hero'
  ]) assert.match(source, new RegExp(expected.replaceAll('.', '\\.')));
  assert.doesNotMatch(source, /STABLE|LOAD 62%|128K TOKENS|旧衛星/);
});

test('base loads the independent visual layer without replacing canonical CSS or JS', async () => {
  const source = await read('site/templates/base.html');
  assert.match(source, /assets\/style\.css/);
  assert.match(source, /assets\/astera-aurora\.css/);
  assert.match(source, /assets\/app\.js/);
  assert.match(source, /assets\/motion\.js/);
  assert.match(source, /assets\/astera-aurora\.js/);
});

test('built TOP exposes all Main 8 routes in order', async () => {
  const html = await read('site/dist/index.html');
  let previous = -1;
  for (const route of main8) {
    const current = html.indexOf(`href="${route}"`);
    assert.ok(current > previous, `${route} must exist in Main 8 order`);
    previous = current;
  }
  assert.match(html, /AI USAGE QUALITY LAYER/);
  assert.match(html, /JUDGMENT CAPSULE/);
  assert.match(html, /Astera総合案内AI/);
});

test('pricing remains an external App link, never an HP pricing page', async () => {
  const redirects = await read('site/public/_redirects');
  assert.match(redirects, /\/pricing https:\/\/app\.asterav8\.jp\/pricing 301/);
  const home = await read('site/dist/index.html');
  assert.match(home, /https:\/\/app\.asterav8\.jp\/pricing/);
  assert.doesNotMatch(home, /料金表|Credit表|Plan比較/);
});

test('all 12 visual assets are implemented original SVG files while brand remains blocked', async () => {
  const manifest = JSON.parse(await read('site/data/asset-manifest.json'));
  assert.equal(manifest.visual.length, 12);
  assert.equal(manifest.visual[0].file, '/assets/visual/hero/hero-core.svg');
  assert.ok(manifest.visual.every((asset) => asset.status === 'implemented-original-svg'));
  assert.match(manifest.status, /brand-byte-production-blocked/);
  for (const asset of manifest.visual) {
    const url = new URL(`../site/${asset.file.replace(/^\//, '')}`, import.meta.url);
    const info = await stat(url);
    assert.ok(info.size > 500, `${asset.id} must be materialized`);
    assert.match(await readFile(url, 'utf8'), /^<svg\b/);
  }
});
