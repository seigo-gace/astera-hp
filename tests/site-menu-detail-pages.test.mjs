import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('shared menu keeps developer PR and ecosystem as different top-level responsibilities', () => {
  const source = read('scripts/menu-canon.js');
  for (const label of ['News','Q&amp;A','料金プラン','開発者情報・IR・リーガル','独自開発・エコシステム','開発支援']) {
    assert.ok(source.includes(label), label);
  }
  const developer = source.match(/data-menu-group="developer"[\s\S]*?<\/section>/)?.[0] ?? '';
  const ecosystem = source.match(/data-menu-group="ecosystem"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(developer.includes('/developer/achievements/'));
  assert.ok(developer.includes('/developer/prototypes/'));
  assert.ok(developer.includes('/developer/theories/'));
  assert.doesNotMatch(developer, /TGserver|Webhook Gateway|Libral-Vault/);
  assert.match(ecosystem, /ECOSYSTEM_ITEMS\.map/);
  for (const label of ['TGserver','Webhook Gateway','Libral-Vault']) assert.ok(source.includes(label));
  assert.doesNotMatch(ecosystem, /Astera v8|Deterministic Japanese Parser|UTP|KAGRRA|Customer AI/);
});

test('ecosystem uses the existing same-site routes instead of a separate domain', () => {
  const source = read('scripts/menu-canon.js');
  for (const href of ['/developer/ecosystem/','/developer/ecosystem/tgserver/','/developer/ecosystem/webhook-gateway/','/developer/ecosystem/libral-vault/']) {
    assert.ok(source.includes(href), href);
  }
  assert.doesNotMatch(source, /https?:\/\/[^'"`]*ecosystem/i);
});

test('developer page is profile-first and does not duplicate project or system descriptions', () => {
  const source = read('ja/developer/index.html');
  assert.match(source, /seigo-gace/);
  assert.match(source, /開発の出発点/);
  assert.match(source, /開発者の役割/);
  assert.match(source, /強みとRisk/);
  assert.match(source, /開発者PR/);
  assert.doesNotMatch(source, /TGserverを詳しく|Webhook Gatewayを詳しく|Libral-Vaultを詳しく/);
  assert.doesNotMatch(source, /KAGRRA-AI|UTP v2\.1|Deterministic Japanese Parser MCP/);
});

test('ecosystem index owns exactly the three developed system descriptions', () => {
  const source = read('ja/developer/ecosystem/index.html');
  for (const label of ['TGserver','Webhook Gateway','Libral-Vault']) assert.match(source, new RegExp(label));
  assert.doesNotMatch(source, /KAGRRA-AI|UTP v2\.1|Deterministic Japanese Parser MCP/);
  assert.match(source, /開発者PRとは分離|開発者プロフィールや公開実績とは分けて/);
});
