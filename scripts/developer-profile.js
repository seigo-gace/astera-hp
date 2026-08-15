const PROFILE_PATH = '/ja/developer/';

const section = (id, title, body) => `<section id="${id}" class="detail-section developer-profile__section"><h2>${title}</h2>${body}</section>`;

export function initDeveloperProfile() {
  if (window.location.pathname !== PROFILE_PATH) return;
  const article = document.querySelector('.detail-article');
  if (!article || article.hasAttribute('data-developer-profile-static')) return;

  article.innerHTML = [
    section('profile', '開発者について', `
      <p class="developer-profile__lead">Asteraは、大規模な専任開発組織から始まったProjectではありません。<strong>一人の開発者が、AIを調査・設計・比較・実装・検証を進める協働手段として使い、実務上の問題を構造化してきたProject</strong>です。</p>
      <div class="developer-profile__identity"><span>Public identity</span><strong>seigo-gace</strong></div>
    `),
    section('origin', '開発の出発点', `
      <p>開発開始時点で、AI／LLM、Programming、Runtime／V8、Server／Cloud、Network、Security、Database、API／Webhook等を体系的に修得済みだったわけではありません。</p>
      <p>分からないことを回答だけで埋めず、前提・依存・Riskを整理し、実際に作り、Failureを確認して責務を分ける進め方を採っています。</p>
    `),
    section('role', '開発者の役割', `
      <p>すべての専門作業を一人で代替することではなく、解決すべき問題を定義し、責務と境界を整理し、AIやToolへ役割を分け、Evidenceを確認しながら一つの目的へ統合することを中核にしています。</p>
      <ul><li>本当の問題と完了条件を定義する</li><li>依存関係と責務境界を整理する</li><li>AI出力を鵜呑みにせず比較する</li><li>実装・Test・Evidenceを要求する</li><li>専門家Reviewが必要な境界を明確にする</li></ul>
    `),
    section('solo', '強みとRisk', `
      <p>複数のAI、Tool、Repository、Service、専門情報を一つの目的へ統合し、責務・依存・Failureを整理することを強みとしています。</p>
      <p>一方で、一人への知識・権限・作業集中はRiskです。Security、法務・Privacy、Product／UX、法人営業、SRE、専門分野Review等は外部専門家・Partnerによる補完対象です。</p>
    `),
    section('pr', '開発者PR', `
      <p>公開成果、Prototype、理論・研究はプロフィール本文へ重複掲載せず、それぞれの専用Pageで確認できます。</p>
      <div class="detail-cta"><div class="detail-cta__links"><a href="/ja/developer/achievements/">公開実績</a><a href="/ja/developer/prototypes/">試作実績</a><a href="/ja/developer/theories/">理論・研究</a></div></div>
    `),
    section('contact', '法人・協業・連絡', `
      <p>法人・協業、問い合わせ、法務情報はそれぞれの専用Pageへ分離しています。独自開発Systemの説明もSide Menuの独立した「独自開発・エコシステム」へ分けています。</p>
      <div class="detail-cta"><div class="detail-cta__links"><a href="/ja/corporate/">法人・協業相談</a><a href="/ja/contact/">お問い合わせForm</a><a href="/ja/legal/terms/">利用規約</a><a href="/ja/legal/privacy/">Privacy Policy</a><a href="/ja/legal/commerce/">特定商取引法表記</a></div></div>
    `),
  ].join('');
}
