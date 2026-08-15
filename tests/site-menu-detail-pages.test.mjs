import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const direct = [
  'ja/news/index.html','ja/qa/index.html','ja/developer/index.html',
  'ja/developer/achievements/index.html','ja/developer/prototypes/index.html',
  'ja/developer/theories/index.html','ja/developer/ecosystem/index.html','ja/developer/ecosystem/tgserver/index.html','ja/developer/ecosystem/webhook-gateway/index.html','ja/developer/ecosystem/libral-vault/index.html','ja/corporate/index.html','ja/contact/index.html',
  'ja/legal/terms/index.html','ja/legal/privacy/index.html','ja/legal/commerce/index.html',
  'ja/support/index.html','ja/investors/index.html',
];
const deps = [
  'ja/developer/achievements/astera/index.html',
  'ja/developer/achievements/japanese-parser/index.html',
  'ja/developer/achievements/utp-v2-1/index.html',
  'ja/developer/prototypes/kagrra-ai/index.html',
  'ja/developer/theories/ai-structure/index.html','ja/supporters/index.html',
];
const files = [...direct, ...deps];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const routeExists = (href) => {
  if (!href.startsWith('/ja/')) return true;
  const clean = href.split(/[?#]/)[0].replace(/^\//, '');
  return fs.existsSync(path.join(root, clean, 'index.html'));
};

test('all internal side-menu detail routes exist', () => {
  for (const file of direct) assert.ok(fs.existsSync(path.join(root, file)), file);
});

test('direct dependency routes exist', () => {
  for (const file of deps) assert.ok(fs.existsSync(path.join(root, file)), file);
});

test('detail pages reuse shared detail chassis without duplicate background design', () => {
  for (const file of files) {
    const source = read(file);
    assert.match(source, /styles\/detail-page\.css/);
    for (const className of ['detail-main','detail-hero','detail-shell','detail-article']) {
      assert.ok(source.includes(className), `${file}: ${className}`);
    }
    assert.ok(source.includes('id="side-menu"'), file);
    assert.doesNotMatch(source, /<footer\b/i);
  }
});

test('shared menu runtime contains the current five-group canon', () => {
  const source = read('scripts/menu-canon.js');
  for (const label of ['News','Q&amp;A','料金プラン','開発者情報・IR・リーガル','開発支援']) {
    assert.ok(source.includes(label), label);
  }
  for (const label of ['TGserver','Webhook Gateway','Libral-Vault']) assert.ok(source.includes(label), label);
  for (const href of ['/developer/ecosystem/','/developer/ecosystem/tgserver/','/developer/ecosystem/webhook-gateway/','/developer/ecosystem/libral-vault/']) assert.ok(source.includes(href), href);
});

test('menu preserves approved routes and CAMPFIRE external link', () => {
  const source = read('scripts/menu-canon.js');
  for (const href of ['/news/','/qa/','/pricing/','/developer/','/developer/achievements/','/developer/prototypes/','/developer/theories/','/corporate/','/contact/','/legal/terms/','/legal/privacy/','/legal/commerce/','/support/','/investors/']) {
    assert.ok(source.includes(href), href);
  }
  assert.ok(source.includes('https://camp-fire.jp/projects/968933/view'));
});

test('contact is the current form-first canon and does not invent a backend binding', () => {
  const source = read('ja/contact/index.html');
  assert.match(source, /<form\b[^>]*data-contact-form/i);
  assert.match(source, /data-contact-endpoint=""/);
  assert.match(source, /data-turnstile-site-key=""/);
  assert.doesNotMatch(source, /\saction=/i);
  for (const name of ['category','reply_email','display_name','subject','message','attachments','privacy_consent']) {
    assert.match(source, new RegExp(`name="${name}"`));
  }
  assert.match(source, /最大5件、合計25MB/);
  assert.match(source, /Password、API Key、Token、Secret/);
});

test('all internal ja links in detail pages resolve in assembled site', () => {
  for (const file of files) {
    for (const match of read(file).matchAll(/href="(\/ja\/[^\"]*)"/g)) {
      assert.ok(routeExists(match[1]), `${file}: ${match[1]}`);
    }
  }
});
