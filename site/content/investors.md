# 投資家向け情報
Asteraは、新しい生成AI Modelを作る事業ではありません。AIが出した答えをそのまま採用する前に、**本当の目的、足りない条件、事実、危険、反対意見、比較案、推奨条件を整理し、人または主役AIが判断しやすい状態へ変える仕組み**を事業にします。
このページでは、技術用語を知らなくても、事業の必要性、製品、顧客、初期Evidence、収益化、Risk、資金用途を確認できるようにします。技術的な成立性を確認する資料は、開発者向け・技術資料へ分離します。

## 解決する問題
生成AIは速く、自然で、説得力のある回答を作れます。一方で、次が自動的に十分確認されるとは限りません。
- 表面的な依頼と本当の目的のずれ
- 結論を変える前提不足
- 事実、推測、古い情報の混在
- 依頼者への迎合
- Riskと停止条件の不足
- 最初の一案への固定
- 反対Evidenceと代替案の不足
- AIの能力範囲外での誤利用

企業や個人は、AIを導入した後も、確認、再調査、会議、差し戻し、専門家確認を人手で行っています。Asteraは、この判断前後の工程を共通化する位置を狙います。

## 製品
Astera v8の正式な位置付けは、**Multi-Perspective Cognition Runtime**です。問い、資料、計画、設計、AI回答等を受け取り、8項目の判断材料と主役AIへの再指示へ変換します。
AsteraはChatGPT、Claude、Gemini、自作AI、自社AIを置き換えません。利用者が現在使っているAIを主役のまま残し、その外側から判断工程を追加します。

## 顧客
- AI回答を業務へ利用する個人・Team
- AIを使って資料、調査、設計、Codeを作る開発者
- 判断工程を共通化したい法人・組織
- 自社AI・AI Agentへ判断材料生成を組み込みたい事業者
- Evidence、Risk、反対案を必要とする研究・専門業務

## 利用方法
最初はコピー＆ペーストで利用でき、必要に応じてWeb App、API、Webhook、Knowledge Base、Storage、Vault等へ拡張します。最初から大規模導入を求めず、既存AIと業務Systemを残したまま段階的に追加できる構造です。

## 初期Evidence
### 実回答例
Astera適用前の回答、Asteraが生成した判断材料、主役AIが判断材料を反映した再回答を比較します。

### 5社横断評価
同一の相談文とAsteraの同一判断材料を異なるAI 5社へ提示した初期評価では、事実と推測の分離、本当の目的、第三案、危機・停止条件、主役AIの具体化支援が共通して評価されました。
これは第三者認証、統計的比較試験、科学的な効果保証ではありません。一つのAIだけの自己評価でもない、初期の横断評価Evidenceとして扱います。

### 実装・Test
公開するTest結果は、対象Version、Commit、実施日、Command、結果、未検証範囲を同時に表示します。過去Versionの合格を現在Versionへ転用しません。

## 事業上の位置付け
Asteraは、基盤Modelの性能競争ではなく、複数のAIや業務Systemの外側で再利用できる判断工程を製品化します。Modelが変わっても、目的、前提、事実、Risk、反対、比較、再指示を扱う必要性は残ります。
競合・代替には、汎用AI、専門Tool、Consulting、人による確認業務があります。Asteraはそれらを不要にするのではなく、各手段へ渡す前の判断材料と確認工程を共通化します。

## 収益化
収益は、Astera Appの利用、追加利用、法人利用、API、専門Knowledge、個別契約等を組み合わせる設計です。現在のPlan、料金、Credit、Optionは[Astera Appのプラン料金ページ](https://app.asterav8.jp/pricing)が唯一の公開正本であり、HPや投資家資料へ固定複製しません。
売上予測を掲載する場合は、実績、契約済み、見込み、仮定、将来予測を分け、期間と計算式を明示します。

## 顧客獲得
- 公式HPと公開Documentation
- CAMPFIREと開発支援
- 実回答例とEvidence公開
- 個人・開発者向けWeb App
- 法人PoCと業務連携
- API・AI製品への組込み
- Sponsor・事業提携

## 創業者・開発体制
Asteraは個人運営から開始し、AIを開発補助、調査、検証、Documentationへ活用しながら構築されています。創業者の役割、外部協力、AIの役割、専門家確認を分け、技術、Security、法務、Accessibility等で必要な協力を段階的に追加します。

## 主なRisk
- 実装と設計の差
- 本番負荷・長期運用の未検証
- 外部AI・Cloud・決済Providerへの依存
- 法務・Privacy・Security対応
- 一人運営の継続性
- 顧客獲得Costと解約
- 公開Claimと実測Evidenceの不一致

Riskは隠さず、停止条件、検証Gate、責務分離、段階導入、外部専門家確認で管理します。

## 資金用途
資金用途は、募集・契約ごとに公開し、次を中心に管理します。
- Server・配信
- AI・API利用
- Security
- Test・検証
- 法務・Privacy
- Accessibility・UX
- 専門Knowledge
- 法人PoC
- 運用・監視

一般支援、Sponsor、投資、事業提携は同じ契約として扱いません。

## 技術確認
技術的な成立性、Architecture、公開Test、API、Security境界は、[技術基盤](/product/technology/)、[連携・拡張性](/product/integration/)、[開発者向け情報](/developers/)で確認できます。

## 次の手続き
- [投資・事業提携について問い合わせる](/contact/?category=investor)
- [開発支援・Sponsor](/support/)
- [公開Evidence](/docs/#evidence)
