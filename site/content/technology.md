# 技術基盤
## 結論
Astera v8は、AIモデルではありません。
Google V8上で動くNode.js Runtimeを使用し、問い、資料、AI回答を複数の独立した確認工程へ分解し、依存関係を守りながら並列・順次実行し、人間と主役AIが再利用できる判断材料へ変換する**Multi-Perspective Cognition Runtime**です。
> AIへすべてを一度に考えさせるのではなく、AIが答える前後の認知処理を、交換可能な独立基盤として外側へ分離する。
これが技術設計の中心です。

## V8の役割
V8は、Google ChromeやNode.js等でJavaScriptを実行するために使われる高性能なEngineです。
AsteraにおけるV8の役割は、AI推論そのものではありません。
- Workflow制御
- Task分割
- Worker管理
- 非同期処理
- 並列処理
- Event処理
- 軽量Data変換
- 状態管理
- Timeout、Failure、結果統合

重いLLM推論、外部検索、専門Database、GPU処理等は、それぞれの責務を持つ外部処理へ分離します。

## Runtimeとして分離する理由
一つのAIへ、次のすべてを同時に任せるとします。
- 目的を読み取る
- 前提不足を確認する
- 事実を確認する
- Riskを探す
- 反対意見を出す
- 複数案を作る
- 比較する
- 最終文章を生成する

この場合、確認工程と回答生成が同じ推論へ混ざります。最終回答をきれいにまとめる過程で、未確認事項、反対意見、弱い候補が消える可能性があります。
Asteraは、判断材料生成を独立Runtimeへ分離し、主役AIを次の役割へ集中させます。
- 最終推論
- 文章、Code、画像等の生成
- 利用者との対話
- Asteraが生成した判断材料の反映

## 処理の依存関係
すべての処理を無条件に同時実行しません。
```plain text
Inquiry Preflight
↓
Fact・Risk・Inquiryを並列実行
↓
Multiが前段結果を利用
↓
Dialecticが候補を生成
↓
Compareが全結果を統合
↓
8項目と再指示を生成
```
### 並列にできる処理
Fact、Risk、Inquiryは、それぞれ異なる確認目的を持ち、同じ入力を独立して確認できます。

### 前段結果が必要な処理
MultiはFact、Risk、Inquiryの結果を使います。Dialecticは複数視点から候補を作り、Compareは全候補、Evidence、Risk、矛盾を比較します。
依存関係を守ることで、同じ分析の重複を抑えながら、必要な確認を省略しない構造を作ります。

## Worker Pool
Asteraは、複数の確認する役割をWorkerへ分けます。
主な責務：
- Fact Worker
- Risk Worker
- Inquiry Worker
- Multi Worker
- Dialectic Worker
- Compare Worker
- Human Reader
- Domain Router
- Quality評価

Workerを分ける目的は、処理数を見せるためではありません。
- 一つの責務へ集中させる
- Failureの影響範囲を限定する
- 個別にTestできる
- 将来交換できる
- 依存順序を明確にする
- 同じ基準で再実行しやすくする

## 5本柱と8項目の違い
5本柱は内部の認知処理です。
- Fact
- Risk
- Multi
- Inquiry
- Compare

8項目は、内部処理の結果を人間と主役AIが使える形へ再編集した外部成果物です。
- 本当の目的
- 前提不足
- 事実確認
- 危機察知
- 反対視点
- 比較案
- 推奨判断
- 主役AIへの再指示

内部構造をそのまま利用者へ押しつけず、判断に使用できる固定形式へ変換します。

## 複数候補生成
Dialectic Workerは、次の候補を生成します。
- 主案
- 悪手案
- 反対案
- 第三案
- 人読み最適案

完全PCEのように候補ごとに外部LLMを何度も呼ぶのではなく、ルールベースのPCE-DCEで候補を生成・競合させ、最終LLM呼び出しを必要最小限に抑える設計を採用しています。
目的：
- 外部AI費用を増やしすぎない
- Provider障害の影響を抑える
- 処理時間を抑える
- 候補生成工程を再現しやすくする
- AIを増やすのではなく、入力と判断工程を強くする

## Provider非依存
Asteraは、最終回答を作るAIを固定しません。
Adapterの対象例：
- OpenAI
- Anthropic
- Ollama
- OpenAI互換API
- Rule-based／Null

ChatGPT、Claude、Gemini、自社AI等へ判断材料を渡すことができます。API接続はOptionであり、コピー＆ペーストでも認知処理を利用できます。
Providerごとに料金、Privacy、得意分野、利用規約、障害、仕様変更が異なります。主役AIを交換可能にし、Asteraの判断工程を特定Providerから分離します。

## Cognitive Mapと成果物
Asteraは、処理結果を次の形で返します。
- Cognitive Map
- 8項目の判断材料セット
- Compact Output
- 主役AI用Prompt
- 接続時の任意LLM回答

主役AIへ渡す中心成果物は、最終回答ではなく、目的、前提、Fact、Risk、反対、比較、推奨、再指示です。

## Human Reader
Human Readerは、入力文章から次の状態の可能性を検出します。
- urgency
- anger
- fatigue
- confusion
- precision
- scope pressure
- build mode

これは感情診断や人格判定ではありません。説明量、確認質問、出力順序、実行形式を調整するために使います。

## Domain Router・Lens・Overlay
Domain Routerは、問いの分野を判定し、Primary Lens、Secondary Lens、Overlayを選択します。
Lensが変更する内容：
- 何をFactとして確認するか
- どのRiskを優先するか
- 誰の立場から見るか
- 何を問い直すか
- どの案を、何で比較するか
- どのEvidenceを要求するか
- どこで断定を止めるか

これにより、医療、法律、事業、開発、研究等へ同じ一般論を適用するのではなく、確認基準そのものを切り替えます。

## QualityCompletionEvaluator
Asteraの品質Gateは、文章が自然かどうかだけを評価しません。
合格条件として管理する項目：
- 品質95点以上
- 完成度95点以上
- Blocking 0件
- 必須Requirement未達 0件
- Evidence不整合 0件
- 評価処理が正常完了
- 平均点だけによる合格を禁止

一部の項目が極端に低い出力を、他項目の点数で相殺して完成扱いにしないためのGateです。
95点という内部品質基準は、最終回答の正しさを95％保証する意味ではありません。**定義した必須要件と構造が欠けていないかを判定する受入基準**です。

## v1.1.1公開Document Bundleで確認できる検証
公開Document BundleのManifestでは、次の検証手順が定義されています。
```plain text
npm test
bash scripts/smoke.sh
npm run verify
```
同Bundleに記録された検証結果：
- 11 tests／11 pass
- smoke ok

これはv1.1.1 Bundleに記録された範囲の検証結果です。現在の全構成、将来Version、本番負荷、長期運用を一括して保証するものではありません。

## 検証を分ける理由
技術基盤の「完成」は、一つのTestが通ったことだけでは判断しません。
必要な検証階層：
- 構文
- Build
- Unit Test
- Integration Test
- API Test
- Security Test
- 異常系
- 境界値
- Timeout、Retry
- Data整合性
- 障害・復旧
- 性能
- 長時間運用
- 実環境でのBefore／After

実行していない検証を、完了・合格として扱いません。

## Securityと責務分離
公開画面、認証、課金、保存、外部通知、Log、検索、秘密情報を、一つの処理へ混在させません。
主な考え方：
- API KeyとTenant状態の管理
- Rate Limit
- Request Payload上限
- CORS Allowlist
- HTTPS／HSTS
- Secret Masking
- Webhook署名検証
- 使用量管理
- 状態保存
- Logの外部配送
- Container単位の運用

内部Endpoint、Network構成、秘密鍵、監視値、復旧手順等はSecurity上公開しません。公開すべき責務、Data取扱い、利用条件、検証Evidenceを分けます。

## 軽量性の設計
AsteraはAIモデルを内蔵して巨大化するのではなく、次をRuntime側へ置きます。
- 軽量分類
- 処理Routing
- ルールベースの候補生成
- Worker制御
- 結果統合
- 再指示生成

高価な外部AI呼び出しを必要な部分へ限定し、主役AIを交換可能にします。
軽量性は機能を削る意味ではありません。**必要な機能を残しながら、重複した推論、不要な外部呼び出し、責務の混在を減らす**という意味です。

## 現在のEvidenceと今後の実測を分ける
### 構造・実装資料から説明できること
- Runtimeとしての責務分離
- Workerと処理順
- 5本柱と8項目
- Provider非依存
- 候補生成と比較構造
- 公開Bundleに記録されたTest結果
- 品質Gateの判定条件

### 実環境で継続測定が必要なこと
- AI回答正答率の改善率
- 手戻り削減率
- 業務時間削減率
- 外部AI費用削減率
- 大量同時利用時の性能
- 長期本番障害率
- 障害復旧時間

実装構造から推測できる効果と、実測された効果を混同しません。

## 公開範囲
本ページでは、利用者、開発者、投資家が技術的な役割、依存関係、検証方法を判断するために必要な情報を公開します。
無断転用、攻撃、秘密情報漏えいにつながる内部Code、秘密鍵、Endpoint、Network詳細、非公開Prompt、制御値は公開しません。
