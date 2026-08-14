import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('Main10 expanded detail action uses the bottom-right action deck', () => {
  const script = read('scripts/cosmic-interface.js');
  const css = read('styles/cosmic-interface-equal-stack.css');
  assert.match(script, /data-expanded-action-deck/);
  assert.match(script, /deck\.append\(detail\)/);
  assert.match(css, /\.cosmic-expanded__action-deck\{/);
  assert.match(css, /justify-content:flex-end/);
  assert.match(css, /\.cosmic-expanded:not\(\.is-supporters\) \.cosmic-expanded__detail\{/);
});

test('supporters expanded panel keeps its existing header action placement', () => {
  const script = read('scripts/cosmic-interface.js');
  const css = read('styles/cosmic-interface-equal-stack.css');
  assert.match(script, /deck\.hidden=true/);
  assert.match(script, /top\.append\(detail\)/);
  assert.match(css, /\.cosmic-expanded\.is-supporters \.cosmic-expanded__detail\{/);
  assert.match(css, /right:16px/);
  assert.match(css, /bottom:5px/);
});

test('Main10 expanded typography avoids arbitrary Japanese breaks and keeps lead/body hierarchy', () => {
  const css = read('styles/cosmic-interface-equal-stack.css');
  assert.match(css, /@supports \(word-break:auto-phrase\)/);
  assert.doesNotMatch(css, /overflow-wrap:anywhere/);
  assert.match(css, /\.cosmic-expanded:not\(\.is-supporters\) \.cosmic-expanded__lead\{/);
  assert.match(css, /\.cosmic-expanded:not\(\.is-supporters\) \.cosmic-expanded__copy\{/);
  assert.match(css, /margin-right:58px/);
});

test('mobile expanded panel reserves a separate bottom action area without body overlap', () => {
  const css = read('styles/cosmic-interface-equal-stack.css');
  assert.match(css, /inset:104px 0 58px/);
  assert.match(css, /\.cosmic-expanded__action-deck\{left:18px;right:18px;bottom:9px/);
});

test('CTA wording remains the Master-approved current text', () => {
  const html = read('ja/index.html');
  assert.match(html, /詳細はコチラ/);
});
