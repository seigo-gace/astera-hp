# 多角的判断エンジン
## 結論
一つのAIが、一つの会話の中で、目的確認、事実確認、危険検出、反対意見、候補作成、比較、文章生成まで全部行うと、それぞれの責務が混ざり、一方向の回答へ流れやすくなります。
Asteraは、問いに応じて確認方法を切り替え、異なる目的を持つ処理を分離し、複数候補を競わせ、最後に同じ基準で比較します。
> **多角とは、同じ対象を異なる立場や評価軸から見ること。多重とは、異なる責務を持つ処理工程を分離し、その結果を重ねて比較・統合することです。**

## 全体構造
```plain text
入力
↓
Domain Router
↓
Primary Lens ＋ Secondary Lens ＋ Overlay
↓
Fact ／ Risk ／ Inquiry
↓
Multi
↓
Dialectic Candidate
↓
Compare
↓
8項目の判断材料
```

## Domain Router｜質問がどの分野かを見分ける
利用者が毎回、専門分野やModeを正確に選ぶ必要はありません。
Domain Routerは、質問、Context、資料、利用目的を読み取り、次を判定します。
- 主となる分野
- 同時に関係する副分野
- 最新情報の確認が必要か
- 法律、医療、安全等の高Risk領域か
- 厳しいEvidence条件が必要か
- General Lensで処理できるか

複合案件を一つの分類へ無理に押し込みません。
たとえば、医療Serviceの事業計画には、Business、Finance、Legal、Medical、Privacy、AI Governance等が同時に関係します。AsteraはPrimary Lensだけで終わらず、Secondary LensとOverlayを追加します。

## 21種類のDomain Lens
公開時の主要Domain Lensは、Generalを含む21種類です。
1. General Judgment／Default
2. Business／Executive Strategy
3. Finance／Investment／Capital Allocation
4. Legal／Compliance／Contract
5. Medical／Health／Clinical
6. Marketing／Growth／Brand
7. Product／UX／Roadmap
8. Engineering／Architecture／Implementation
9. Cybersecurity／Privacy／Trust
10. AI／ML／LLM Governance
11. Project／Program／Operations
12. HR／Organization／People
13. Sales／Customer Success／Negotiation
14. Research／Academic／Evidence Review
15. Education／Training／Learning Design
16. Procurement／Vendor／Build-vs-Buy
17. Crisis／Reputation／Public Communication
18. Policy／Public Sector／Nonprofit
19. Creative／Writing／Content
20. Personal Decision／Coaching／Life Planning
21. Data／Analytics／Experimentation

「オールジャンル対応」とは、何でも知っているという意味ではありません。
- 入力分野を限定しない
- 分野ごとに確認方法を切り替える
- 複合案件へ複数Lensを適用する
- 専門Lensに当てはまらない場合はGeneral Lensで処理する
- 知らない情報を未確認として残す
- 必要に応じて外部KB、検索、専門Data、利用者資料へ接続する

つまり、**どの質問にも同じ一般論を返すのではなく、分野に合った調べ方と確認基準へ切り替える**という意味です。

## Lensが切り替える基準
<table header-row="true">
<tr><td>基準</td><td>確認する内容</td></tr>
<tr><td>Fact Lens</td><td>その分野で何を事実として確認するか</td></tr>
<tr><td>Risk Lens</td><td>どの危険や失敗を優先して探すか</td></tr>
<tr><td>Multi Lens</td><td>誰の立場から確認するか</td></tr>
<tr><td>Inquiry Lens</td><td>判断前に何を問い直すか</td></tr>
<tr><td>Compare Lens</td><td>どの案を、どの軸で比較するか</td></tr>
<tr><td>Evidence to Collect</td><td>必要な資料、Data、一次情報</td></tr>
<tr><td>Safety Gate</td><td>断定停止条件、専門家確認条件</td></tr>
</table>

Lensは文章Templateではありません。**何を見るか、何を危険とするか、何をEvidenceとして要求するかを変える認知・評価基準**です。

## 5種類の追加Overlay
高Risk条件や厳しいEvidence条件がある場合、主要LensへOverlayを重ねます。
### High-Stakes Legal Overlay
- 法令、契約、権利、表示義務
- 管轄、適用地域、施行日
- 法的判断を止める条件
- 弁護士、行政、権限者へ確認する条件

### Medical Safety Overlay
- 医療機関、学会、Guideline、添付文書等の優先
- 緊急性
- 禁忌、受診条件
- 個別診断を避ける境界

### Current-Information Overlay
- 料金、規約、役職、製品仕様、政治、法令、時事等の現在確認
- 情報の公開日、更新日
- 古いSourceを断定に使わない

### Evidence-Strict Overlay
- 一次資料の優先
- 引用と主張の一致
- 調査条件、Sample、対象範囲
- Evidence不足時の断定停止

### Safety／Abuse Overlay
- 生命、身体、重大損失、Security、違法利用等の危険確認
- 安全側への制限
- 実行手順を出してはいけない条件

Overlayは、通常確認へ追加する二重・三重の安全確認です。

## 5本柱
### Fact｜事実と未確認情報の整理
入力内容を、確認済みの事実、未確認情報、意見、推測、予測、矛盾へ仕分けます。

### Risk｜危険と失敗条件
実行するRisk、実行しないRisk、途中失敗、復旧不能、信用、法務、Security、費用、運用等を確認します。

### Multi｜多角
利用者、顧客、運営者、開発者、経営者、投資家、法務、第三者等、問いに必要な立場へ切り替えます。

### Inquiry｜反対・問い直し
前提、隠れた目的、曖昧な言葉、矛盾、見落とした選択肢を問い直します。

### Compare｜比較
候補を同じ評価軸へ揃え、目的への適合、Evidence、Risk、実現性、費用、時間等で比較します。

## Human Reader｜人の状態も処理条件へ含める
Asteraは入力内容だけでなく、利用者が現在どのような状態で依頼している可能性があるかも処理条件に含めます。
検出対象の例：
- urgency：急ぎ・時間圧
- anger：怒り・強い不満
- fatigue：疲労
- confusion：混乱
- precision：正確性要求
- scope_pressure：全部・完璧・最大範囲要求
- build_mode：Code、Download、起動、Test等の実行要求

Human Readerは心理診断ではありません。**説明量、質問量、出力順序、実行しやすい形式を調整するための補助情報**です。
急いでいる利用者へ長い前置きを増やさず、混乱している利用者へ前提や手順を省略せず、正確性要求が高い場合はEvidenceと未確認事項を強化します。

## Dialectic｜複数候補を競わせる
Asteraは、一つの案だけを改善し続けません。異なる性質を持つ候補を生成します。
### 主案
目的達成へ最も直接的な候補。

### 悪手案
意図的に弱い案、危険な案、破綻しやすい案を作り、失敗原因を可視化します。採用するためではなく、どこで転ぶかを確認するために使います。

### 反対案
主案と逆の価値観、慎重側、別の立場を優先する候補。

### 第三案
二択そのものを疑い、構造を変える案、段階案、組み合わせ案を作ります。

### 人読み最適案
利用者の緊急度、理解度、負担、実行可能性へ合わせた候補。

## Compare｜候補を同じものさしで比較する
Compareは、候補を印象で選びません。
- 目的への適合
- 成功条件
- 前提依存
- Evidenceの強さ
- Risk
- 費用
- 時間
- 実現性
- 運用・保守
- 撤退しやすさ
- 将来拡張
- 矛盾

各候補のscore、answer line distance、成立条件、破綻条件を比較し、selected candidateとcandidate rankingへ統合します。
点数が高い案を機械的に最終決定するのではありません。**なぜ高いか、どの条件で順位が変わるか、残る不確実性は何か**を判断材料として返します。

## Evidenceの扱い
Asteraは、Evidenceを「絶対に正しい」という印として付けません。
Evidenceは、利用者と主役AIが次を確認するために使います。
- どのSourceが主張を支えているか
- 一次情報か
- いつ公開・更新されたか
- どの対象・条件に適用できるか
- 反対Evidenceがあるか
- まだ確認できていない部分はどこか

一般的な優先順位は次のとおりですが、分野によって適切なSourceは異なります。
1. 法令、行政、公式発表
2. 専門機関、学会、一次資料
3. 査読研究、公式Documentation
4. 信頼できる報道、専門解説
5. その他の参考情報

## なぜこの構造が必要か
真実だけを見ると、危険を見落とします。
Riskだけを見ると、何も進められません。
攻めだけを見ると、壊れやすくなります。
反対だけを見ると、結論へ進めません。
比較だけを見ると、候補が増えて迷います。
Asteraは、それぞれを独立させたうえで一つの流れへ統合します。
> **異なる目的を持つ処理を分離し、互いの結果を検証させ、最後に判断可能な8項目へまとめる。**
これが、多角的判断エンジンの役割です。

## 重要事項
多角的に確認しても、すべての情報、将来変化、個別事情を網羅できる保証はありません。Asteraは正解を保証するのではなく、見落とし、未確認情報、反対材料、Risk、比較条件を発見しやすい状態を作ります。重要な判断では、Source本文、適用条件、専門家または権限者の確認が必要です。
