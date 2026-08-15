import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const menu = readFileSync(resolve(root, 'scripts/menu.js'), 'utf8');
const menuCanon = readFileSync(resolve(root, 'scripts/menu-canon.js'), 'utf8');
const menuCss = readFileSync(resolve(root, 'styles/menu.css'), 'utf8');
const contactCss = readFileSync(resolve(root, 'styles/contact-form.css'), 'utf8');
const headerCss = readFileSync(resolve(root, 'styles/header.css'), 'utf8');
const profile = readFileSync(resolve(root, 'scripts/developer-profile.js'), 'utf8');

test('side menu exposes the six canonical top-level groups', () => {
  for (const label of ['News', 'Q&amp;A', '料金プラン', '開発者情報・IR・リーガル', '独自開発・エコシステム', '開発支援']) {
    assert.match(menuCanon, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('developer PR and ecosystem are separate menu groups', () => {
  const developerBlock = menuCanon.match(/data-menu-group="developer"[\s\S]*?<\/section>/)?.[0] ?? '';
  const ecosystemBlock = menuCanon.match(/data-menu-group="ecosystem"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.doesNotMatch(developerBlock, /TGserver|Webhook Gateway|Libral-Vault|独自開発・エコシステム/);
  assert.match(ecosystemBlock, /ECOSYSTEM_ITEMS\.map/);
  for (const label of ['TGserver', 'Webhook Gateway', 'Libral-Vault']) assert.match(menuCanon, new RegExp(label));
  assert.match(menuCanon, /\/developer\/ecosystem\//);
  assert.doesNotMatch(ecosystemBlock, /Deterministic Japanese Parser|UTP|Astera v8|Customer AI/);
});

test('developer profile does not duplicate system or achievement descriptions', () => {
  assert.match(profile, /Public identity/);
  assert.match(profile, /seigo-gace/);
  assert.match(profile, /開発者PR/);
  assert.doesNotMatch(profile, /TGserverへ|Webhook Gatewayへ|Libral-Vaultへ/);
  assert.doesNotMatch(profile, /KAGRRA-AI|UTP v2\.1|Deterministic Japanese Parser/);
});

test('menu behavior includes escape, focus trap, focus return and outside click', () => {
  assert.match(menu, /event\.key === 'Escape'/);
  assert.match(menu, /event\.key !== 'Tab'/);
  assert.match(menu, /opener\.focus\(\)/);
  assert.match(menu, /pointerdown/);
  assert.match(menu, /body\.classList\.toggle\('menu-open'/);
  assert.match(menu, /data-menu-group="ecosystem"/);
});

test('menu visual supports current route state', () => {
  assert.match(menuCss, /is-current/);
  assert.match(menuCss, /prefers-reduced-motion/);
});

test('contact layout remains form-first and responsive', () => {
  assert.match(contactCss, /grid-template-columns:repeat\(12/);
  assert.match(contactCss, /input\[type="file"\]::file-selector-button/);
  assert.match(contactCss, /contact-warning/);
  assert.match(contactCss, /contact-consent/);
  assert.match(contactCss, /contact-status\[data-state="error"\]/);
  assert.match(contactCss, /@media\(max-width:760px\)/);
});

test('header upper row keeps language left and brand right', () => {
  assert.match(headerCss, /\.brand\{order:2/);
  assert.match(headerCss, /\.language-select-field\{order:1/);
  assert.match(headerCss, /\.header-actions\{[^}]*justify-content:flex-end/);
});
