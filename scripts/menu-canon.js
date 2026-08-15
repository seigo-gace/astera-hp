export const MENU_GROUPS = Object.freeze({
  developer: Object.freeze({ label: '開発者情報・IR・リーガル', id: 'developer-menu' }),
  ecosystem: Object.freeze({ label: '独自開発・エコシステム', id: 'ecosystem-menu' }),
  support: Object.freeze({ label: '開発支援', id: 'support-menu' }),
});

export const ECOSYSTEM_ITEMS = Object.freeze([
  Object.freeze({ label: 'TGserver', route: '/developer/ecosystem/tgserver/' }),
  Object.freeze({ label: 'Webhook Gateway', route: '/developer/ecosystem/webhook-gateway/' }),
  Object.freeze({ label: 'Libral-Vault', route: '/developer/ecosystem/libral-vault/' }),
]);

const localPath = (language, suffix) => `/${language}${suffix}`.replace(/\/{2,}/g, '/');

export function buildCanonicalMenuMarkup(language = 'ja') {
  const route = (suffix) => localPath(language, suffix);
  return `
  <a class="side-menu-link" href="${route('/news/')}">News</a>
  <a class="side-menu-link" href="${route('/qa/')}">Q&amp;A</a>
  <a class="side-menu-link" href="${route('/pricing/')}">料金プラン</a>

  <section class="side-menu-accordion" data-menu-group="developer">
    <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="${MENU_GROUPS.developer.id}">
      <span>${MENU_GROUPS.developer.label}</span><span class="accordion-trigger__chevron" aria-hidden="true">⌄</span>
    </button>
    <div id="${MENU_GROUPS.developer.id}" class="accordion-panel" hidden>
      <a href="${route('/developer/')}">開発者プロフィール</a>
      <a href="${route('/developer/achievements/')}">公開実績</a>
      <a href="${route('/developer/prototypes/')}">試作実績</a>
      <a href="${route('/developer/theories/')}">理論・研究</a>
      <a href="${route('/corporate/')}">法人・協業相談</a>
      <a href="${route('/contact/')}">お問い合わせ</a>
      <a href="${route('/legal/terms/')}">利用規約</a>
      <a href="${route('/legal/privacy/')}">Privacy Policy</a>
      <a href="${route('/legal/commerce/')}">特定商取引法表記</a>
    </div>
  </section>

  <section class="side-menu-accordion" data-menu-group="ecosystem">
    <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="${MENU_GROUPS.ecosystem.id}">
      <span>${MENU_GROUPS.ecosystem.label}</span><span class="accordion-trigger__chevron" aria-hidden="true">⌄</span>
    </button>
    <div id="${MENU_GROUPS.ecosystem.id}" class="accordion-panel" hidden>
      <a href="${route('/developer/ecosystem/')}">全体</a>
      ${ECOSYSTEM_ITEMS.map((item) => `<a href="${route(item.route)}">${item.label}</a>`).join('\n      ')}
    </div>
  </section>

  <section class="side-menu-accordion" data-menu-group="support">
    <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="${MENU_GROUPS.support.id}">
      <span>${MENU_GROUPS.support.label}</span><span class="accordion-trigger__chevron" aria-hidden="true">⌄</span>
    </button>
    <div id="${MENU_GROUPS.support.id}" class="accordion-panel" hidden>
      <a href="${route('/support/')}">個人支援／スポンサー</a>
      <a href="https://camp-fire.jp/projects/968933/view" rel="external noopener">クラウドファンディング</a>
      <a href="${route('/investors/')}">投資家</a>
    </div>
  </section>
`;
}

export function buildNoJsMenuMarkup(language = 'ja') {
  const route = (suffix) => localPath(language, suffix);
  return `<!-- ASTERA_NOJS_MENU_START -->
<noscript>
  <nav class="nojs-site-menu" aria-label="サイトメニュー">
    <strong class="nojs-site-menu__title">Menu</strong>
    <a href="${route('/news/')}">News</a>
    <a href="${route('/qa/')}">Q&amp;A</a>
    <a href="${route('/pricing/')}">料金プラン</a>
    <details>
      <summary>${MENU_GROUPS.developer.label}</summary>
      <div class="nojs-site-menu__children">
        <a href="${route('/developer/')}">開発者プロフィール</a>
        <a href="${route('/developer/achievements/')}">公開実績</a>
        <a href="${route('/developer/prototypes/')}">試作実績</a>
        <a href="${route('/developer/theories/')}">理論・研究</a>
        <a href="${route('/corporate/')}">法人・協業相談</a>
        <a href="${route('/contact/')}">お問い合わせ</a>
        <a href="${route('/legal/terms/')}">利用規約</a>
        <a href="${route('/legal/privacy/')}">Privacy Policy</a>
        <a href="${route('/legal/commerce/')}">特定商取引法表記</a>
      </div>
    </details>
    <details>
      <summary>${MENU_GROUPS.ecosystem.label}</summary>
      <div class="nojs-site-menu__children">
        <a href="${route('/developer/ecosystem/')}">全体</a>
        ${ECOSYSTEM_ITEMS.map((item) => `<a href="${route(item.route)}">${item.label}</a>`).join('\n        ')}
      </div>
    </details>
    <details>
      <summary>${MENU_GROUPS.support.label}</summary>
      <div class="nojs-site-menu__children">
        <a href="${route('/support/')}">個人支援／スポンサー</a>
        <a href="https://camp-fire.jp/projects/968933/view" rel="external noopener">クラウドファンディング</a>
        <a href="${route('/investors/')}">投資家</a>
      </div>
    </details>
  </nav>
</noscript>
<!-- ASTERA_NOJS_MENU_END -->`;
}
