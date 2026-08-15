import test from 'node:test';
import assert from 'node:assert/strict';
import { syncHtml } from '../scripts/sync-static-menu.mjs';

const legacy = `<!doctype html><html><body>
<button data-menu-open>menu</button>
<aside id="side-menu" aria-hidden="true" inert><div class="side-menu-header"></div><nav class="side-menu-body" aria-label="サイドメニュー"><a href="/ja/news/">old</a></nav></aside>
</body></html>`;

test('sync replaces legacy menu with all six top-level responsibilities and no-JS fallback', () => {
  const result = syncHtml(legacy, 'ja');
  assert.equal(result.changed, true);
  for (const label of ['開発者情報・IR・リーガル','独自開発・エコシステム','開発支援','TGserver','Webhook Gateway','Libral-Vault']) {
    assert.match(result.html, new RegExp(label));
  }
  assert.match(result.html, /<noscript>/);
  assert.match(result.html, /ASTERA_NOJS_MENU_START/);
});

test('sync is idempotent', () => {
  const first = syncHtml(legacy, 'ja').html;
  const second = syncHtml(first, 'ja').html;
  assert.equal(second, first);
});

test('sync keeps ecosystem separate from developer PR while reusing same-site ecosystem routes', () => {
  const result = syncHtml(legacy, 'ja').html;
  assert.match(result, /\/ja\/developer\/ecosystem\/tgserver\//);
  assert.match(result, /\/ja\/developer\/ecosystem\/webhook-gateway\//);
  assert.match(result, /\/ja\/developer\/ecosystem\/libral-vault\//);
  const developer = result.match(/<summary>開発者情報・IR・リーガル<\/summary>[\s\S]*?<\/details>/)?.[0] ?? '';
  assert.doesNotMatch(developer, /TGserver|Webhook Gateway|Libral-Vault/);
});
