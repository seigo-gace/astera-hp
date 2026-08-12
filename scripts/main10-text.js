export const MAIN10_ITEMS = Object.freeze([
  {
    id: "what-is-astera",
    title: "Asteraでできること",
    lead: "Asteraは、人やAIが答えを出す前に、判断に必要な材料を整理して「選べる状態」を作ります。",
    body: "質問や資料、AI回答から、目的、不足条件、事実、Risk、反対視点、比較案を分けて確認します。答えを代わりに決めるのではなく、何を確認し、何が未確認で、どの道を選べるのかを見えるようにします。「問いを星図に変える。」はこの役割を表した言葉です。",
    route: "./product/what-is-astera/"
  },
  {
    id: "why-astera",
    title: "AIの答えをそのまま使わないために",
    lead: "AIの答えが自然に見えても、前提不足、未確認情報、見落とし、比較不足が残っていることがあります。",
    body: "Asteraは結論の前に目的と条件を確認し、事実と未確認情報、Risk、反対意見、別案を分けます。外部確認が必要なものは根拠と出典を確認し、「どこまで分かっていて、何がまだ分からないか」を見える状態にしてから判断へ進みます。",
    route: "./product/why-astera/"
  },
  {
    id: "value",
    title: "AI時代の「判断」を支える新しい価値",
    lead: "Asteraは、AIが答えを作った後、それを実際の判断へ使う前に必要な確認・比較・整理の工程を扱います。",
    body: "AIが広く使われるほど、事実確認、Risk確認、比較、差し戻し、判断理由の共有といった作業が残ります。Asteraは、これまで人が個別に行っていた確認工程を共通化し、AI・人・業務Systemへ再利用できる判断材料へ変えることを価値の中心に置きます。",
    route: "./product/market/"
  },
  {
    id: "process",
    title: "Asteraの使い方",
    lead: "基本は、目的を選び、文章やFileを入力し、Creditを確認して実行し、整理された判断材料を見るだけです。",
    body: "「AIに任せる、レビュー、比較、検証、改善、調査、計画、検討」の8つから目的を選べます。結果は一つの長文ではなく判断材料ごとに確認でき、必要に応じて履歴、Project、共有、Download、Private Mode、追加機能へ進めます。",
    route: "./app/"
  },
  {
    id: "engine",
    title: "導入すると何が変わるのか",
    lead: "Asteraは、確認漏れや比較不足による再質問、やり直し、再設計を減らし、判断理由を共有しやすくします。",
    body: "目的、条件、比較軸を早い段階で整理することで、後から前提違いに気づく負担を減らしやすくします。効果は一律の改善率ではなく、現在の確認時間、手戻り、判断ミスの影響とAsteraの利用Costを比べ、自分の利用で測る考え方です。",
    route: "./product/value/"
  },
  {
    id: "usage",
    title: "料金とCredit",
    lead: "まず試す人から業務利用・開発者利用まで、毎月の利用量と必要な機能に合わせてPlanを選べます。",
    body: "Free、Basic、Pro、Business、Enterpriseの月額、毎月のCredit、File上限、Storage、Private Mode、Developer Modeなどを一つのページで比較できます。Creditの計算方法、追加購入、Storage、Plan変更まで同じページで確認できます。",
    route: "./pricing/"
  },
  {
    id: "technology",
    title: "Asteraはどう判断材料を作るのか",
    lead: "Asteraは問いをすぐ一つの結論へまとめず、目的から推奨までを8つの判断材料へ分けて確認します。",
    body: "目的、不足条件、事実、Risk、反対視点、比較案、推奨、AIへの再指示を順番に整理します。さらに問いの分野に応じて見る場所を切り替え、何が足りず、どの材料を根拠にその方向を選ぶのかを途中から確認できるようにします。",
    route: "./product/process/"
  },
  {
    id: "integration",
    title: "Astera v8はどう動くのか",
    lead: "Astera v8は、複数の確認処理を順序立てて動かし、状態や失敗を分けながら結果をまとめるRuntimeです。",
    body: "Google V8／Node.jsを基盤に、処理順、並列実行、状態管理、Timeout、結果統合などを扱います。判断工程を特定AIへ密結合させず役割ごとに分けることで、AIや外部Serviceが変わっても確認工程を再利用しやすい構造にしています。",
    route: "./product/technology/"
  },
  {
    id: "evidence",
    title: "日本語を正しく読むための技術",
    lead: "日本語の条件、例外、指示関係、文脈を、生成AIの推測だけに任せず整理する専用読解基盤です。",
    body: "Deterministic Japanese Parser MCPが、「誰が何を求めているか」「どの条件や例外がどこに掛かるか」といった意味の関係を整理します。MCPが日本語を読み、Astera v8がその結果から判断材料を作ることで、読解と判断を別の責務として扱います。",
    route: "./product/japanese-reading/"
  },
  {
    id: "app",
    title: "開発者向け連携",
    lead: "Developer Modeから、Asteraの判断材料生成や根拠確認を自作App・自社System・AI Agentへ組み込めます。",
    body: "判断材料生成、根拠確認、品質確認、統合利用などを用途に応じて外部から利用できます。Developer Modeでは利用情報やCreditを管理し、Webhook、外部Storage、関連Systemとも役割を分けて接続できます。公開情報は開発者に必要な範囲へ限定します。",
    route: "./product/integration/"
  },
]);

export const SUPPORTERS_ITEM = Object.freeze({
  id: 'supporters',
  iconId: 'integration',
  title: '支援者・スポンサーのご紹介',
  lead: 'Asteraを支えてくださる皆さまへ、深く感謝いたします。',
  body: '皆さまのご支援が、挑戦を前へ進める力です。',
  route: './supporters/'
});

export const SITE_TEXT = Object.freeze({
  topCopyright: 'Copyright © 2026 Astera'
});
