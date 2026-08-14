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
  assert.match(css,/\.cosmic-card__stack\{\s*height:70px;/);
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
