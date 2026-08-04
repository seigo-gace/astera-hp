import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const main8 = [
  '/product/what-is-astera/',
  '/product/why-astera/',
  '/product/value/',
  '/product/process/',
  '/product/engine/',
  '/product/usage/',
  '/product/technology/',
  '/product/integration/'
];

test('Notion canonical shared shell is retained', async () => {
  const header = await read('site/templates/partials/header.html');
  const footer = await read('site/templates/partials/footer.html');
  assert.match(header, /astera-logo-dark\.svg/);
  assert.match(header, /製品/);
  assert.match(header, /活用シーン/);
  assert.match(header, /支援・投資/);
  assert.match(header, /ドキュメント/);
  assert.match(header, /会社情報/);
  assert.match(header, /https:\/\/app\.asterav8\.jp\/pricing/);
  assert.match(header, /CAMPFIRE/);
  assert.match(header, /LAUNCH APP/);
  assert.match(header, /Language/);
  assert.doesNotMatch(header, /brand-text/);
  assert.match(footer, /問いを星図に変える。/);
  assert.match(footer, /利用規約/);
  assert.match(footer, /Privacy/);
  assert.match(footer, /特商法/);
});

test('TOP is a dedicated Notion canonical composition', async () => {
  const source = await read('site/templates/home.html');
  const expectedOrder = ['class="hero ', 'class="process ', 'class="comparison ', 'class="main-eight ', 'class="capsule ', 'class="audiences ', 'class="evidence ', 'class="final-cta '];
  let previous = -1;
  for (const marker of expectedOrder) {
    const current = source.indexOf(marker);
    assert.ok(current > previous, `${marker} must retain canonical order`);
    previous = current;
  }
  assert.match(source, /assets\/visual\/hero\/hero-core\.png/);
  assert.match(source, /assets\/visual\/process\/process-purpose\.png/);
  assert.match(source, /assets\/visual\/comparison\/comparison-portal\.png/);
  assert.match(source, /assets\/visual\/capsule\/capsule-radar\.png/);
  assert.match(source, /assets\/visual\/audience\/audience-personal\.png/);
  assert.match(source, /assets\/visual\/cta\/cta-support\.png/);
  assert.doesNotMatch(source, /STABLE|LOAD 62%|128K TOKENS|旧衛星/);
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

test('asset contract uses canonical nested paths and stays production blocked', async () => {
  const manifest = JSON.parse(await read('site/data/asset-manifest.json'));
  assert.equal(manifest.visual.length, 12);
  assert.equal(manifest.visual[0].file, '/assets/visual/hero/hero-core.png');
  assert.ok(manifest.visual.every((asset) => asset.status === 'source-recorded-binary-unavailable'));
  assert.match(manifest.status, /production-blocked/);
});
