import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PANEL_COPY_LIMITS, PUBLIC_MAIN10 } from '../data/public-main10.ja.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

test('Main10 panel keeps locked geometry and removes the accidental action deck',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  const js=read('scripts/cosmic-interface.js');
  assert.match(css,/\.cosmic-expanded__top\{\s*height:clamp\(104px,17%,118px\);/);
  assert.match(css,/\.cosmic-expanded__body\{\s*inset:clamp\(104px,17%,118px\) 0 0;\s*padding-top:10px;/);
  assert.match(css,/font-size:clamp\(18px,2\.8vw,28px\)/);
  assert.doesNotMatch(css,/cosmic-expanded__action-deck/);
  assert.doesNotMatch(js,/data-expanded-action-deck|document\.createElement\('div'\)/);
});

test('latest detail-link override is implemented with the existing control at right-bottom',()=>{
  const css=read('styles/cosmic-interface-equal-stack.css');
  const js=read('scripts/cosmic-interface.js');
  assert.match(css,/\.cosmic-expanded__detail\{[\s\S]*right:16px;[\s\S]*bottom:5px;/);
  assert.match(js,/const target=isSupporters\?top:glass;/);
  assert.match(js,/target\.append\(detail\)/);
  assert.match(read('ja/index.html'),/>詳細はコチラ</);
});

test('Main10 text density follows the 2026-08-12 panel contract',()=>{
  assert.equal(PUBLIC_MAIN10.length,10);
  for(const item of PUBLIC_MAIN10){
    assert.ok(item.lead.length>=PANEL_COPY_LIMITS.leadMin,`${item.id} lead too short: ${item.lead.length}`);
    assert.ok(item.lead.length<=PANEL_COPY_LIMITS.leadMax,`${item.id} lead too long: ${item.lead.length}`);
    assert.ok(item.body.length>=PANEL_COPY_LIMITS.bodyMin,`${item.id} body too short: ${item.body.length}`);
    assert.ok(item.body.length<=PANEL_COPY_LIMITS.bodyMax,`${item.id} body too long: ${item.body.length}`);
  }
});

test('current Main10 responsibilities remain in the 2026-08-14 order',()=>{
  assert.deepEqual(PUBLIC_MAIN10.map(x=>x.title),[
    'Asteraでできること','AIの答えをそのまま使わないために','AI時代の「判断」を支える新しい価値','導入すると何が変わるのか','Asteraの使い方','料金とCredit','Asteraはどう判断材料を作るのか','Astera v8はどう動くのか','日本語を正しく読むための技術','開発者向け連携'
  ]);
  const value=PUBLIC_MAIN10.find(x=>x.id==='value');
  const adoption=PUBLIC_MAIN10.find(x=>x.id==='engine');
  assert.doesNotMatch(value.lead+value.body,/費用対効果|人件費|意思決定遅延/);
  assert.match(adoption.body,/費用対効果/);
  assert.doesNotMatch(PUBLIC_MAIN10.map(x=>x.lead+x.body).join(' | '),/5 Overlay/);
});

test('existing top cache contract remains unchanged by this panel correction',()=>{
  const index=read('ja/index.html');
  const script=read('script.js');
  assert.match(index,/cosmic-interface-equal-stack\.css\?v=cu51-supporters-placement/);
  assert.match(index,/script\.js\?v=cu67-supporters-crown-overlay/);
  assert.match(script,/cosmic-interface\.js\?v=cu67-supporters-crown-overlay/);
});
