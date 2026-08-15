import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const root=read('style.css');
const siteCss=read('styles/site-detail-readable.css');
const pricingCss=read('styles/pricing-readable.css');
const pricing=read('ja/pricing/index.html');
const contact=read('ja/contact/index.html');
const contactJs=read('scripts/contact-form.js');

const siteMenuPages=[
  'ja/news/index.html','ja/qa/index.html','ja/developer/index.html',
  'ja/developer/achievements/index.html','ja/developer/prototypes/index.html','ja/developer/theories/index.html',
  'ja/corporate/index.html','ja/contact/index.html','ja/legal/terms/index.html',
  'ja/legal/privacy/index.html','ja/legal/commerce/index.html','ja/support/index.html','ja/investors/index.html',
];

test('site-menu detail readability CSS is shared and Main10 detail remains excluded',()=>{
  assert.match(root,/site-detail-readable\.css\?v=cu-site-detail-comprehension-20260815/);
  assert.match(root,/pricing-readable\.css\?v=cu-pricing-comprehension-20260815/);
  assert.match(siteCss,/\.detail-main:not\(:has\(\.detail-main10-nav\)\)/);
  assert.match(siteCss,/\.detail-toc\{display:none!important\}/);
});

test('all site-menu detail route files still exist',()=>{
  for(const path of siteMenuPages)assert.equal(fs.existsSync(new URL(`../${path}`,import.meta.url)),true,path);
});

test('site-menu detail typography prioritizes reading over decoration',()=>{
  assert.match(siteCss,/max-width:68ch/);
  assert.match(siteCss,/font-size:17px;/);
  assert.match(siteCss,/line-height:1\.9/);
  assert.doesNotMatch(siteCss,/linear-gradient|radial-gradient|conic-gradient|@keyframes|animation:/);
});

test('pricing begins with plan fit and presents five independent plan cards',()=>{
  assert.match(pricing,/class="detail-main pricing-page"/);
  assert.doesNotMatch(pricing,/detail-eyebrow/);
  assert.match(pricing,/最初に、どのPlanが合うか/);
  assert.equal((pricing.match(/class="plan-card(?: plan-card--wide)?"/g)||[]).length,5);
  for(const value of ['0円','980円','2,980円','9,980円','29,800円','180,000','640,000','2,200,000','6,600,000'])assert.ok(pricing.includes(value),value);
});

test('pricing removes the giant plan table as the primary presentation and stays mobile readable',()=>{
  assert.doesNotMatch(pricing,/class="detail-table"/);
  assert.match(pricingCss,/\.plan-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(pricingCss,/@media \(max-width:760px\)/);
  assert.match(pricingCss,/\.pricing-page \.pricing-choice,\.pricing-page \.plan-grid,\.pricing-page \.plain-pair\{grid-template-columns:1fr\}/);
});

test('contact is an operational form client, not a description-only page',()=>{
  for(const name of ['category','reply_email','display_name','subject','message','attachments','privacy_consent','turnstile_token'])assert.match(contact,new RegExp(`name="${name}"`));
  assert.match(contact,/data-contact-form/);
  assert.match(contact,/お問い合わせを送信/);
  assert.match(contact,/scripts\/contact-form\.js/);
  assert.match(contactJs,/MAX_FILES=5/);
  assert.match(contactJs,/MAX_TOTAL_BYTES=25\*1024\*1024/);
  assert.match(contactJs,/method:'POST'/);
});

test('contact client does not invent a public backend binding',()=>{
  assert.match(contact,/data-contact-endpoint=""/);
  assert.match(contact,/data-turnstile-site-key=""/);
  assert.match(contactJs,/const endpoint=\(form\.dataset\.contactEndpoint\|\|''\)\.trim\(\)/);
  assert.match(contactJs,/if\(!clientReady\)/);
});
