import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const expected = [
  ['Asteraでできること', 'ja/product/what-is-astera/index.html'],
  ['AIの答えをそのまま使わないために', 'ja/product/why-astera/index.html'],
  ['AI時代の「判断」を支える新しい価値', 'ja/product/market/index.html'],
  ['導入すると何が変わるのか', 'ja/product/value/index.html'],
  ['Asteraの使い方', 'ja/app/index.html'],
  ['料金とCredit', 'ja/pricing/index.html'],
  ['Asteraはどう判断材料を作るのか', 'ja/product/process/index.html'],
  ['Astera v8はどう動くのか', 'ja/product/technology/index.html'],
  ['日本語を正しく読むための技術', 'ja/product/japanese-reading/index.html'],
  ['開発者向け連携', 'ja/product/integration/index.html'],
];

const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('Main10 current Canon titles and routes exist', () => {
  const source = read('data/public-main10.ja.js');
  for (const [title, file] of expected) {
    assert.match(source, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} missing`);
    const html = read(file);
    assert.match(html, /<h1 id="page-title">/);
    const key = title.startsWith('開発者向け連携') ? 'Developer Mode' : title.split('｜')[0];
    assert.match(html, new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('supporting detail routes are present', () => {
  for (const file of [
    'ja/product/usage/index.html',
    'ja/evidence/index.html',
    'ja/product/engine/index.html',
  ]) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} missing`);
});

test('Astera is not presented as generative AI and core KB is not claimed', () => {
  const all = expected.map(([, file]) => read(file)).join('\n');
  assert.match(all, /Astera v8は「答えを作るAI」ではなく/);
  assert.doesNotMatch(read('ja/product/integration/index.html'), /Knowledge Base|ナレッジベース|Astera KB|AsteraのKB/);
  assert.match(read('ja/product/integration/index.html'), /根拠検索API/);
});

test('Japanese parser role boundary is explicit', () => {
  const html = read('ja/product/japanese-reading/index.html');
  assert.match(html, /MCP：日本語を読む/);
  assert.match(html, /Astera v8：読んだ内容から判断材料を作る/);
  assert.doesNotMatch(html, /完全統合済み|統合完了/);
});

test('public pages do not expose project execution vocabulary', () => {
  const publicFiles = [...expected.map(([, f]) => f),
    'ja/product/usage/index.html','ja/evidence/index.html','ja/product/engine/index.html'];
  const all = publicFiles.map(read).join('\n');
  assert.doesNotMatch(all, /\bG[0-5]\b|Authority Gate|Change Unit|Push Scope Lock|Commit SHA|Branch Strategy|NOT_RUN/);
});

test('TOP data and routing source contain exactly ten entries in Canon order', async () => {
  const data = await import('../data/public-main10.ja.js');
  const text = await import('../scripts/main10-text.js');
  assert.equal(data.PUBLIC_MAIN10.length, 10);
  assert.equal(text.MAIN10_ITEMS.length, 10);
  assert.deepEqual(data.PUBLIC_MAIN10.map(x => x.title), expected.map(x => x[0]));
  assert.deepEqual(text.MAIN10_ITEMS.map(x => x.title), expected.map(x => x[0]));
});

test('value and adoption-effect responsibilities stay separated', () => {
  const data = read('data/public-main10.ja.js');
  const valueBlock = data.slice(data.indexOf("id: 'value'"), data.indexOf("id: 'engine'"));
  const adoptionBlock = data.slice(data.indexOf("id: 'engine'"), data.indexOf("id: 'process'"));
  assert.doesNotMatch(valueBlock, /費用対効果|人件費|意思決定遅延/);
  assert.match(adoptionBlock, /費用対効果/);
  assert.match(adoptionBlock, /人件費/);
  assert.match(adoptionBlock, /意思決定遅延/);
});

test('public process page does not list 5 Overlay as a public feature', () => {
  const html = read('ja/product/process/index.html');
  assert.match(html, /38 Genre Lens/);
  assert.doesNotMatch(html, /5 Overlay/);
});

test('detail layout suppresses visible numbering and mobile horizontal tables', () => {
  const css = read('styles/detail-page.css');
  const script = read('script.js');
  assert.match(css, /\.detail-eyebrow,\.detail-section__index\{display:none\}/);
  assert.match(css, /\.detail-toc a::before\{content:none\}/);
  assert.match(css, /@supports \(word-break:auto-phrase\)/);
  assert.match(css, /@media \(max-width:720px\)/);
  assert.match(css, /\.table-wrap\{overflow:visible/);
  assert.match(css, /\.detail-table\{display:block;width:100%;min-width:0\}/);
  assert.match(script, /data-main10-detail-nav/);
  assert.match(script, /MAIN10_ITEMS\.forEach/);
  assert.match(script, /aria-current/);
});
