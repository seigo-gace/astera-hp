import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PANEL_COPY_LIMITS, PUBLIC_MAIN10 } from '../data/public-main10.ja.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

test('Current Canon places Main10 detail link in a dedicated bottom action deck',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  const js=read('scripts/cosmic-interface.js');
  assert.match(js,/data-expanded-action-deck/);
  assert.match(js,/deck\.append\(detail\)/);
  assert.match(css,/\.cosmic-expanded__action-deck\{/);
  assert.match(css,/bottom:0;/);
  assert.match(css,/justify-content:flex-end/);
  assert.match(css,/\.cosmic-expanded:not\(\.is-supporters\) \.cosmic-expanded__detail\{/);
});

test('Main10 moved-link header is compacted and does not keep a dead row',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  assert.match(css,/\.cosmic-expanded__top\{\s*height:clamp\(88px,14%,100px\);\s*padding:0 clamp\(28px,5vw,46px\);/);
  assert.match(css,/\.cosmic-expanded__body\{\s*inset:clamp\(88px,14%,100px\) 0 48px;/);
  assert.match(css,/\.cosmic-expanded:not\(\.is-supporters\) \.cosmic-expanded__top\{\s*border-bottom:0;\s*box-shadow:none;/);
  assert.match(css,/\.cosmic-expanded__top\{height:86px;padding:0 18px\}/);
  assert.match(css,/\.cosmic-expanded__body\{inset:86px 0 46px;/);
});

test('Main10 detail link is a compact UI without underline or separator lines',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  assert.match(css,/\.cosmic-expanded__action-deck\{[\s\S]*min-height:48px;[\s\S]*border:0;[\s\S]*background:transparent;[\s\S]*box-shadow:none;/);
  assert.match(css,/\.cosmic-expanded:not\(\.is-supporters\) \.cosmic-expanded__detail\{[\s\S]*border:1px solid rgba\(190,225,255,.30\);[\s\S]*border-radius:999px;[\s\S]*background:linear-gradient/);
  assert.match(css,/\.cosmic-expanded:not\(\.is-supporters\) \.cosmic-expanded__detail::after\{\s*content:none;/);
  assert.doesNotMatch(css,/border-left:1px solid rgba\(190,225,255,.24\)/);
  assert.doesNotMatch(css,/border-top:1px solid rgba\(171,205,239,.12\)/);
});

test('Supporters keeps its established header action while Main10 uses the deck',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  const js=read('scripts/cosmic-interface.js');
  assert.match(js,/deck\.hidden=true/);
  assert.match(js,/top\.append\(detail\)/);
  assert.match(css,/\.cosmic-expanded\.is-supporters \.cosmic-expanded__detail\{/);
  assert.match(css,/right:16px/);
  assert.match(css,/bottom:5px/);
});

test('Expanded title wraps naturally within two lines without arbitrary Japanese splitting',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  assert.doesNotMatch(css,/overflow-wrap:anywhere/);
  assert.match(css,/overflow-wrap:normal/);
  assert.match(css,/line-break:strict/);
  assert.match(css,/text-wrap:balance/);
  assert.match(css,/-webkit-line-clamp:2/);
  assert.match(css,/@supports \(word-break:auto-phrase\)/);
});

test('Expanded body uses Lead plus multiple paragraph presentation without changing panel/card geometry',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  const js=read('scripts/cosmic-interface.js');
  assert.match(js,/function splitBodyParagraphs/);
  assert.match(js,/data-expanded-copy-group/);
  assert.match(js,/data-expanded-copy-extra/);
  assert.match(css,/\.cosmic-expanded__copy-group\{/);
  assert.match(css,/\.cosmic-card\{\s*height:88px;/);
  assert.match(css,/\.cosmic-card__stack\{\s*height:7ppx;/);
  assert.match(css,/\.cosmic-expanded\{width:94vw;height:min\(630px,78svh\);min-height:min\(455px,78svh\)\}/);
});

test('Main10 text density follows the approved panel contract',()=>{
  assert.equal(PUBLIC_MAIN10.length,10);
  for(const item of PUBLIC_MAIN10){
    assert.ok(item.lead.length>=PANEL_COPY_LIMITS.leadMin,`${item.id} lead too short: ${item.lead.length}`);
    assert.ok(item.lead.length<=PANEL_COPY_LIMITS.leadMax,`${item.id} lead too long: ${item.lead.length}`);
    assert.ok(item.body.length>=PANEL_COPY_LIMITS.bodyMin,`${item.id} body too short: ${item.body.length}`);
    assert.ok(item.body.length<=PANEL_COPY_LIMITS.bodyMax,`${item.id} body too long: ${item.body.length}`);
  }
});

test('Current Main10 responsibilities and public boundaries remain unchanged',()=>{
  assert.deepEqual(PUBLIC_MAIN10.map(x=>x.title),[
    'Asteraでできること','AIの答えをそのまま使わないために','AI時代の「判断」を支える新しい価値','導入すると何が変わるのか','Asteraの使い方','料金とCredit','Asteraはどう判断材料を作るのか','Astera v8はどう動くのか','日本語を正しく読むための技術','開発者向け連携'
  ]);
  const value=PUBLIC_MAIN10.find(x=>x.id==='value');
  const adoption=PUBLIC_MAIN10.find(x=>x.id==='engine');
  assert.doesNotMatch(value.lead+value.body,/費用対効果|人件費|意思決定遅延/);
  assert.match(adoption.body,/費用対効果/);
  assert.doesNotMatch(PUBLIC_MAIN10.map(x=>x.lead+x.body).join(' | '),/5 Overlay/);
});
