import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../styles/detail-page.css',import.meta.url),'utf8');
const script=fs.readFileSync(new URL('../script.js',import.meta.url),'utf8');
const count=(s,c)=>[...s].filter(x=>x===c).length;

test('stylesheet is structurally complete',()=>{
  assert.equal(count(css,'{'),count(css,'}'),'unbalanced CSS braces');
  assert.ok(css.trim().endsWith('}'),'stylesheet must not end in an incomplete selector');
});

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
  assert.match(css,/\.detail-visual::before,\.detail-visual::after\{content:""/);
  assert.match(css,/\.flow__step::after\{content:""/);
});

test('legacy detail-page brand palette variables are not used',()=>{
  assert.doesNotMatch(css,/var\(--brand-signal/);
  assert.doesNotMatch(css,/var\(--surface-/);
  assert.doesNotMatch(css,/var\(--hover-metal/);
  assert.doesNotMatch(css,/var\(--line(?:-|\))/);
});

test('bottom Main10 navigation remains generated and styled',()=>{
  assert.match(script,/nav\.className='detail-main10-nav'/);
  assert.match(script,/MAIN10_ITEMS\.forEach/);
  assert.match(script,/document\.createElement\(isCurrent\?'span':'a'\)/);
  for(const selector of ['.detail-main10-nav{','.detail-main10-nav__title{','.detail-main10-nav__grid{','.detail-main10-nav__item{','.detail-main10-nav__item.is-current{']){
    assert.ok(css.includes(selector),`${selector} missing`);
  }
  assert.match(css,/a\.detail-main10-nav__item::after\{content:"→"/);
});

test('bottom navigation is one column on mobile and two columns on larger screens',()=>{
  assert.match(css,/\.detail-main10-nav__grid\{[\s\S]*grid-template-columns:1fr/);
  assert.match(css,/@media \(min-width:760px\)[\s\S]*\.detail-main10-nav__grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.match(css,/@media \(max-width:480px\)[\s\S]*\.detail-main10-nav__grid\{grid-template-columns:1fr\}/);
});

test('mobile keeps black network UI without forced horizontal layout',()=>{
  assert.match(css,/@media \(max-width:720px\)/);
  assert.match(css,/\.detail-table\{display:block;width:100%;min-width:0\}/);
  assert.match(css,/@media \(max-width:480px\)/);
  assert.match(css,/\.detail-section\{padding:26px 0 26px 18px\}/);
});
