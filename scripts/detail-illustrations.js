const ILLUSTRATION_ROOT = new URL('../assets/images/illustrations/main10/', import.meta.url);
const STYLESHEET_HREF = new URL('../styles/detail-illustrations.css?v=cu-main10-illustrations-01', import.meta.url).href;

const ROUTE_ILLUSTRATIONS = {
  '/ja/product/what-is-astera': [
    { file: '01-what-is-astera-overview.webp', alt: 'Asteraが人・文書・会話・コードなどの入力を受け、判断材料へ整理する全体像', targets: ['#summary'] },
  ],
  '/ja/product/why-astera': [
    { file: '02-why-astera-preflight.webp', alt: 'AIの回答を採用する前に問いと材料を整理し、確認工程を挟む必要性を示す図', targets: ['#summary'] },
  ],
  '/ja/product/value': [
    { file: '03-value-decision-balance.webp', alt: '費用対効果、複数の利害関係者、構造化、Riskをバランスして導入価値を考える図', targets: ['#summary'] },
  ],
  '/ja/product/process': [
    { file: '04-process-idea-to-system.webp', alt: '入力から複数の確認工程を経て判断材料へ変換するAsteraの流れ', targets: ['#summary'] },
  ],
  '/ja/product/engine': [
    { file: '05-engine-initial-answer.webp', alt: '初期回答をそのまま採用せず、複数の確認工程へ渡して判断材料を生成する流れ', targets: ['#summary'] },
    { file: '05-engine-perspective-routing.webp', alt: '質問を分野と複数観点へ振り分け、多角的に確認する構造', targets: ['#section-03', '#summary'] },
  ],
  '/ja/product/usage': [
    { file: '06-usage-work-cycle.webp', alt: '問いや資料を入力し、Asteraの結果を確認してAIや次の作業へ戻す利用サイクル', targets: ['#summary'] },
    { file: '06-usage-individual-to-team.webp', alt: '個人利用から開発、事業、研究、組織までAsteraを活用する範囲', targets: ['#section-07', '#summary'] },
  ],
  '/ja/product/technology': [
    { file: '07-technology-runtime-hub.webp', alt: 'Runtimeと役割ごとの処理を分離して管理するAstera技術基盤の全体像', targets: ['#summary'] },
  ],
  '/ja/product/integration': [
    { file: '08-integration-astera-hub.webp', alt: 'Asteraを中心にAI、Web、外部System、Storageなどを役割ごとに接続する拡張構造', targets: ['#summary'] },
    { file: '08-integration-routing.webp', alt: 'Asteraと外部AI、API、Webhook、Storageの責務を分離して接続する経路', targets: ['#section-08', '#summary'] },
  ],
  '/ja/evidence': [
    { file: '09-evidence-review-comparison.webp', alt: 'Asteraの実行結果とAIレビュー、比較評価を横断して確認するEvidenceの図', targets: ['#summary'] },
  ],
  '/ja/app': [
    { file: '10-app-overview.webp', alt: '入力、目的選択、結果、履歴、共有などAstera Appの主要機能全体像', targets: ['#section-04', '#summary'] },
    { file: '10-app-storage.webp', alt: 'Astera Appの保存、Private Mode、StorageとData取扱いの関係', targets: ['#section-10', '#summary'] },
    { file: '10-app-developer-mode.webp', alt: 'Astera AppのDeveloper ModeでAPI、Key、利用状況などを管理するイメージ', targets: ['#section-13', '#summary'] },
  ],
};

const normalizePathname = (pathname) => pathname
  .replace(/\/index\.html$/i, '')
  .replace(/\/$/, '') || '/';

const ensureStylesheet = () => {
  if (document.querySelector('link[data-detail-illustration-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLESHEET_HREF;
  link.dataset.detailIllustrationStyle = '';
  document.head.append(link);
};

const resolveTarget = (article, selectors) => {
  for (const selector of selectors) {
    const target = article.querySelector(selector);
    if (target) return target;
  }
  return article.querySelector('.detail-section');
};

const createFigure = ({ file, alt }) => {
  const figure = document.createElement('figure');
  figure.className = 'detail-illustration';
  figure.dataset.detailIllustration = file;
  const image = document.createElement('img');
  image.className = 'detail-illustration__image';
  image.src = new URL(file, ILLUSTRATION_ROOT).href;
  image.alt = alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 1536;
  image.height = 857;
  figure.append(image);
  return figure;
};

export const initDetailIllustrations = () => {
  const article = document.querySelector('.detail-article');
  if (!article) return;
  const route = normalizePathname(window.location.pathname);
  const illustrations = ROUTE_ILLUSTRATIONS[route];
  if (!illustrations?.length) return;
  ensureStylesheet();
  illustrations.forEach((item) => {
    if (article.querySelector(`[data-detail-illustration="${item.file}"]`)) return;
    const target = resolveTarget(article, item.targets);
    if (!target) return;
    target.after(createFigure(item));
  });
};
