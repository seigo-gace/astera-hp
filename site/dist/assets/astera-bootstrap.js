const ensureStylesheet = (id, href) => {
  if (document.getElementById(id) || document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

ensureStylesheet('astera-aurora-styles', '/assets/astera-aurora.css');

const legacyShell = document.querySelector('.header-inner, main > .page > .page-hero');
if (legacyShell) ensureStylesheet('astera-legacy-bridge-styles', '/assets/astera-legacy-bridge.css');

function upgradeLegacyShell() {
  const header = document.querySelector('.site-header');
  header?.setAttribute('data-header', '');
  document.querySelector('.header-inner')?.classList.add('header-shell');
  document.querySelector('.site-nav')?.classList.add('global-nav');
  document.querySelector('.site-footer')?.classList.add('is-legacy-shell');
}

function upgradeLegacyHome() {
  if (document.body.dataset.route !== 'home') return;
  const article = document.querySelector('main#main > .page');
  if (!article || article.querySelector('[data-network-stage]')) return;
  const oldHero = article.querySelector(':scope > .page-hero');
  if (!oldHero) return;

  article.classList.add('home-page', 'is-legacy-upgraded');
  const hero = document.createElement('section');
  hero.className = 'hero section-frame hero-network';
  hero.setAttribute('aria-labelledby', 'hero-title');
  hero.setAttribute('data-network-hero', '');
  hero.innerHTML = `
    <div class="hero-copy" data-reveal>
      <p class="eyebrow">AI USAGE QUALITY LAYER</p>
      <h1 id="hero-title">問いを星図に変える。</h1>
      <p class="hero-lead">AIを置き換えず、AIの外側から判断品質を強化する。</p>
      <p>Asteraは、問いと主役AIの回答から、目的、前提、事実、Risk、反対視点、比較案、推奨判断、主役AIへの再指示を整理する判断材料生成Runtimeです。</p>
      <div class="hero-actions"><a class="button is-primary" href="https://app.asterav8.jp/">Asteraを使う</a><a class="button" href="/product/what-is-astera/">Asteraとは？</a><a class="text-link" href="https://app.asterav8.jp/pricing">プラン・料金</a></div>
    </div>
    <div class="visual-stage hero-visual network-stage" data-network-stage data-motion-root data-motion-strength="18" data-reveal>
      <canvas class="network-canvas" data-network-canvas aria-hidden="true"></canvas>
      <div class="visual-glow" aria-hidden="true"></div>
      <span class="network-orbit is-a" aria-hidden="true"></span>
      <span class="network-orbit is-b" aria-hidden="true"></span>
      <picture class="visual-base network-globe"><img src="/assets/visual/hero/hero-core.svg" width="1400" height="1400" fetchpriority="high" decoding="async" alt="青緑色に発光する地球型ネットワークと、Asteraが判断材料を接続する構造の概念図" data-required-asset></picture>
      <span class="network-flare is-cyan" aria-hidden="true"></span>
      <span class="network-flare is-amber" aria-hidden="true"></span>
      <div class="asset-fallback" hidden data-asset-fallback><strong>Hero Visualを読み込めません</strong><span>本文と全導線は利用できます。</span></div>
      <div class="scan-layer" aria-hidden="true"></div>
      <div class="concept-labels" aria-hidden="true"><span>PURPOSE</span><span>FACT</span><span>RISK</span><span>COMPARE</span><span>RE-INSTRUCTION</span></div>
    </div>
    <aside class="hero-concept" data-reveal><p class="eyebrow">DOCKING EXOSHELL</p><h2>主役AIの外側で働く。</h2><dl><div><dt>INPUT</dt><dd>問い・資料・AI回答</dd></div><div><dt>PROCESS</dt><dd>確認・反対・比較</dd></div><div><dt>OUTPUT</dt><dd>8項目と再指示</dd></div></dl></aside>`;
  oldHero.replaceWith(hero);
}

upgradeLegacyShell();
upgradeLegacyHome();

if (!globalThis.__asteraAuroraImport) {
  globalThis.__asteraAuroraImport = import('./astera-aurora.js').catch((error) => {
    console.error('ASTERA_AURORA_LOAD_FAILED', error);
  });
}
