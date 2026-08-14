import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../styles/detail-page.css',import.meta.url),'utf8');

test('detail pages keep a pure black background with no decorative background effects',()=>{
  assert.match(css,/\.detail-main\{[\s\S]*background:#000/);
  assert.match(css,/\.detail-hero\{[\s\S]*background:#000/);
  assert.match(css,/\.detail-hero::before,\.detail-hero::after\{content:none\}/);
  assert.doesNotMatch(css,/linear-gradient|radial-gradient|conic-gradient/i);
  assert.doesNotMatch(css,/nebula|particle|orbital-grid|starfield/i);
});

test('near-future character is expressed by line, node and frame UI only',()=>{
  assert.match(css,/--detail-cyan:#54d9ff/);
  assert.match(css,/--detail-blue:#6f8cff/);
  assert.match(css,/--detail-violet:#a174ff/);
  assert.match(css,/\.detail-section::before/);
  assert.match(css,/\.detail-section::after/);
  assert.match(css,/\.detail-toc::before/);
  assert.match(css,/\.detail-visual::before,\.detail-visual::after/);
  assert.match(css,/\.flow__step::after/);
});

test('legacy detail-page brand palette variables are not used',()=>{
  assert.doesNotMatch(css,/var\(--brand-signal/);
  assert.doesNotMatch(css,/var\(--surface-/);
  assert.doesNotMatch(css,/var\(--hover-metal/);
  assert.doesNotMatch(css,/var\(--line(?:-|\))/);
});

test('content-heavy components remain black and readable',()=>{
  for(const selector of ['.detail-code','.table-wrap','.detail-visual','.comparison__side','.hub__center','.hub__node','.evidence-example']){
    assert.ok(css.includes(selector),`${selector} missing`);
  }
  assert.match(css,/\.detail-table th[\s\S]*color:var\(--detail-text\)/);
  assert.match(css,/\.detail-section p,\.detail-section li[\s\S]*color:var\(--detail-text-secondary\)/);
});

test('mobile keeps the same black network UI without forced horizontal layout',()=>{
  assert.match(css,/@media \(max-width:720px\)/);
  assert.match(css,/\.detail-table\{display:block;width:100%;min-width:0\}/);
  assert.match(css,/@media \(max-width:480px\)/);
  assert.match(css,/\.detail-section\{padding:26px 0 26px 18px\}/);
});
