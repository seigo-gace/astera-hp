import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../styles/site-detail-readable.css',import.meta.url),'utf8');
const root=fs.readFileSync(new URL('../style.css',import.meta.url),'utf8');
test('site detail override is wired without changing Main10 detail contract',()=>{
  assert.match(root,/site-detail-readable\.css\?v=cu-site-detail-readability-20260815/);
  assert.match(css,/\.detail-main:not\(:has\(\.detail-main10-nav\)\)/);
});
test('layout is comprehension-first and single-column',()=>{
  assert.match(css,/\.detail-shell\{display:block;grid-template-columns:none/);
  assert.match(css,/\.detail-toc\{position:static;max-height:none;overflow:visible/);
  assert.match(css,/content:"このページで分かること"/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
test('decorative network rails and nodes are removed on site detail pages',()=>{
  assert.match(css,/\.detail-section::before,[\s\S]*\.detail-section::after\{content:none\}/);
  assert.match(css,/\.detail-toc::before,[\s\S]*\.detail-toc::after\{content:none\}/);
  assert.match(css,/\.detail-cta::before\{content:none\}/);
});
test('body typography prioritizes readability',()=>{
  assert.match(css,/font-size:16px;line-height:1\.84/);
  assert.match(css,/max-width:72ch/);
  assert.match(css,/--site-detail-body:#d6deea/);
});
test('mobile keeps one-column navigation and readable body size',()=>{
  assert.match(css,/@media \(max-width:700px\)/);
  assert.match(css,/\.detail-toc ol,[\s\S]*\.detail-cta__links\{grid-template-columns:1fr\}/);
  assert.match(css,/font-size:16px;line-height:1\.8/);
});
test('no gradient or decorative animation is introduced',()=>{
  assert.doesNotMatch(css,/linear-gradient|radial-gradient|conic-gradient|@keyframes|animation:/);
});
