const PROFILE_PATH = '/ja/developer/';

const section = (id, title, body) => `<section id="${id}" class="detail-section developer-profile__section"><h2>${title}</h2>${body}</section>`;

export function initDeveloperProfile() {
  if (window.location.pathname !== PROFILE_PATH) return;
  const article = document.querySelector('.detail-article');
  if (!article || article.hasAttribute('data-developer-profile-static')) return;

  article.innerHTML = [
    section('profile', '開発者について', `
      <p class="developer-profile__lead">Asteraは、大規模な専任開発組織や、AI・Runtime・Cloud・Securityの専門家集団から始まったProjectではありません。<strong>一人の開発者が、AIを調査・設計・比較・実装・検証を進める協働手段として使いながら、実務上の問題をSystemへ変換してきたProject</strong>です。</p>
      <div class="developer-profile__identity"><span>Public identity</span><strong>seigo-gace</strong></div>
    `),
    section('origin', '開発の出発点', `
      <p>開発開始時点で、AI／LLM、Programming、Runtime／V8、Server／Cloud、Network、Security、Database、API／Webhook、暗号化・Key管理などを体系的に修得済みだったわけではありません。</p>
      <p>分からないことを回答だけで埋めず、前提・依存・Riskを洗い出し、実際に作り、Failureを確認し、不足した責務を別Systemへ分離する進め方を採っています。</p>
      <div class="developer-flow" aria-label="開発の流れ"><span>問題を発見</span><span>複数案を検討</span><span>前提・Riskを整理</span><span>実装</span><span>Failureを確認</span><span>責務を分離</span><span>再利用可能なSystemへ</span></div>
    `),
    section('role', '開発者の役割', `
      <p>すべての専門作業を一人で最高水準に代替することが役割ではありません。中核は、解決すべき問題を定義し、必要な責務と境界を見つけ、AIやToolへ役割を分け、Evidenceを確認しながら一つのSystemへ統合することです。</p>
      <ul><li>本当の問題と完了条件を定義する</li><li>依存関係と責務境界を整理する</li><li>AI出力を比較し、推測をそのまま採用しない</li><li>実装・Test・Evidenceを要求する</li><li>個別成果を再利用可能なSystemへ分離する</li><li>専門家Reviewが必要な境界を明確にする</li></ul>
    `),
    section('principles', '問題からSystemを逆算する', `
      <p>既存Toolを先に決めて業務を合わせるのではなく、「何が失敗しているか」「なぜ繰り返すか」「どの責務が混ざっているか」から必要なSystemを逆算します。</p>
      <div class="developer-profile__examples"><article><strong>Logが実行本体を圧迫する</strong><span>→ TGserverへ運用記録を分離</span></article><article><strong>Webhook処理が各Appへ重複する</strong><span>→ Webhook Gatewayへ外部Event責務を分離</span></article><article><strong>Secretが通常Dataへ混ざる</strong><span>→ Libral-Vaultへ保護責務を分離</span></article><article><strong>AI回答を鵜呑みにできない</strong><span>→ Asteraへ判断材料生成を分離</span></article></div>
    `),
    section('solo', '強みとRisk｜ワンオペを前提にした設計', `
      <p>Asteraは、開発・運用・Support・営業・Documentationの十分な専任組織を前提にせず、一人でも継続できるよう責務の自動化と分離を進めています。</p>
      <p>一方で、一人への知識・権限・作業集中はRiskです。Security、法務・Privacy、Product／UX、法人営業、SRE、専門分野Reviewなどは、外部専門家・Partnerによる補完対象として扱います。</p>
    `),
    section('work', '公開実績・試作・理論', `
      <p>構想、設計、実装、Test、本番運用を同じ完成Statusとして扱わず、確認できるものを分類して公開します。</p>
      <div class="detail-cta"><div class="detail-cta__links"><a href="/ja/developer/achievements/">公開実績</a><a href="/ja/developer/prototypes/">試作実績</a><a href="/ja/developer/theories/">理論・研究</a></div></div>
    `),
    section('ecosystem', '独自開発・エコシステム', `
      <p>TGserver、Webhook Gateway、Libral-Vaultは別Domainや別Siteではなく、Astera公式HPのDeveloper領域で役割と関係を詳しく説明します。</p>
      <div class="developer-ecosystem-grid"><a href="/ja/developer/ecosystem/tgserver/"><strong>TGserver</strong><span>運用記録・Audit・障害追跡</span></a><a href="/ja/developer/ecosystem/webhook-gateway/"><strong>Webhook Gateway</strong><span>外部Eventの受信・受け渡し</span></a><a href="/ja/developer/ecosystem/libral-vault/"><strong>Libral-Vault</strong><span>認証情報・Secretの責務分離</span></a></div>
      <div class="detail-cta"><div class="detail-cta__links"><a href="/ja/developer/ecosystem/">エコシステム全体を見る</a></div></div>
    `),
    section('contact', '連絡・協力', `
      <p>問い合わせ、開発協力、Sponsor、投資・事業提携などは公式HPのContact Formへ集約します。個人住所、電話番号、私用Email、内部Account情報は一般公開しません。</p>
      <div class="detail-cta"><div class="detail-cta__links"><a href="/ja/contact/">お問い合わせForm</a><a href="/ja/corporate/">法人・協業相談</a><a href="/ja/investors/">投資家・事業提携向け情報</a></div></div>
    `),
  ].join('');
}
