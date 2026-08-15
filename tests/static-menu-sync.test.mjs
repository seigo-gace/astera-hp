import test from 'node:test';import assert from 'node:assert/strict';import {syncHtml} from '../scripts/sync-static-menu.mjs';
const legacy='<!doctype html><html><body><button data-menu-open>menu</button><aside id="side-menu" aria-hidden="true" inert><div class="side-menu-header"></div><nav class="side-menu-body" aria-label="サイドメニュー"><a href="/ja/news/">old</a></nav></aside></body></html>';
test('sync replaces legacy menu and adds no-js fallback',()=>{const s=syncHtml(legacy,'ja').html;for(const x of ['開発者情報・IR・リーガル','TGserver','Webhook Gateway','Libral-Vault','/ja/developer/ecosystem/tgserver/','<noscript>'])assert.ok(s.includes(x),x);});
test('sync is idempotent',()=>{const a=syncHtml(legacy,'ja').html;assert.equal(syncHtml(a,'ja').html,a);});
