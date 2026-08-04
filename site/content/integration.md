# 連携・拡張性
## 結論
Asteraは、既存のAI、App、業務System、Knowledge Base、通知・Log基盤を置き換えるのではありません。
それぞれの外側または間に、**判断材料生成レイヤー**として接続します。
> コピー＆ペーストで単独利用でき、必要になった部分だけAPI、Webhook、KB、暗号化、Logへ段階的に拡張できる。
特定AIや一つのCloud Serviceへ全体を依存させないことが、Asteraの拡張原則です。

## 全体の責務分離
```plain text
利用者・外部System
↓
Astera App／API Gateway
↓
Astera v8
判断材料生成・Lens・比較・再指示
↓
主役AI
最終回答・文章・Code等の生成

必要に応じて横から接続
├─ Knowledge Base：分野別の根拠・運用情報
├─ Webhook Gateway：外部Event受信・配送・再送
├─ Libral-Vault：秘密情報の暗号化・解錠制御
├─ TGserver：Log・監査・障害情報の外部保管
└─ 外部Storage：利用者Dataと履歴の保存
```
Astera v8がすべてを直接抱えません。
- 判断材料生成はAstera v8
- 最終回答生成は主役AI
- 外部Event処理はWebhook Gateway
- 秘密情報保護はLibral-Vault
- Log保管はTGserver
- 分野別知識はKB
- 決済と個人情報は決済Provider

責務を分けることで、一つの障害やProvider変更が全体へ広がることを防ぎ、個別交換しやすい構造を作ります。

## コピー＆ペースト接続
Asteraを利用するために、API接続は必須ではありません。
```plain text
1. ChatGPT、Claude、Gemini等の回答をコピー
2. Asteraへ貼り付け
3. 8項目の判断材料を生成
4. 再指示をコピー
5. 元のAIまたは別のAIへ貼り付け
```
この方法では、利用者は現在使っているAIを変更せず、Asteraの判断工程だけを追加できます。
「APIが使えないからAsteraを利用できない」という依存を作らないことが基本設計です。

## Web App
Astera Appは、利用者が直接操作する入口です。
主な責務：
- 問い・資料・AI回答の入力
- 用途とOptionの選択
- 実行前の消費予定表示
- 8項目の表示
- 再指示のコピー
- 履歴・保存設定
- 利用状況と残高確認

AppはAstera v8そのものではありません。Appを変更しても、認知処理Runtimeを別のClientやAPIから再利用できる構造を維持します。

## 外部AIとの接続
Asteraが生成した次の材料を、主役AIへ渡せます。
- 本当の目的
- 成功条件
- 前提不足
- 確認済みの事実
- 未確認情報
- 重点Risk
- 反対視点
- 比較候補
- 推奨判断
- 再指示

接続先の例：
- ChatGPT／OpenAI
- Claude／Anthropic
- Gemini
- Ollama
- OpenAI互換API
- 自作AI
- 自社AI
- Rule-based System

外部AIの回答精度、保存条件、利用規約、料金、障害、仕様変更は各Providerに依存します。Asteraは接続先AIそのものを管理・保証しません。

## API
APIは、Asteraの判断材料生成を、自作App、自社System、AI Agent、Bot、業務Workflow等へ組み込む入口です。
### APIの中心成果物
- Cognitive Map
- 8項目の判断材料
- Evidence情報
- Candidate Ranking
- 主役AI用の再指示

最終回答生成を必須にせず、利用側が選んだAIや人間へ材料を渡せることを重視します。

### 利用例
- 自社Appの入力前処理
- AI Agentの実行前確認
- 問い合わせAIの回答材料生成
- 社内稟議の論点整理
- 複数AIへ共通判断材料を配布
- 文書、比較、調査工程の共通化

### API Gatewayの役割
- 認証
- Tenant・Account確認
- 使用量・Credit確認
- Rate Limit
- Request検証
- Astera v8へのRouting
- Response整形
- Log・監査連携

アプリから直接内部Runtimeへ無制限に接続せず、Gatewayを関所として扱います。

## Webhook Gateway
Webhook Gatewayは、外部Serviceから送られるEventを一元受信し、検証、保存、配送、再送、復旧する独立Systemです。
### Asteraとの関係
Asteraが外部Serviceごとの署名形式、Retry、Event保存、配送失敗を直接抱えるのではなく、Webhook Gatewayが外部Eventを正規化し、必要な処理先へ届けます。
```plain text
GitHub／Stripe／Slack／Telegram／Generic HMAC
↓
Webhook Gateway
署名検証・正規化・保存・Queue
↓
Astera App／Astera v8／通知先／業務System
```
### 想定Provider
- GitHub
- Stripe
- Slack
- Telegram
- Generic HMAC

### 中核責務
- Raw Bodyを使用した署名検証
- CloudEvents形式への正規化
- EventとDeliveryの保存
- Queueによる配送
- Retry、Dead Letter、Replay
- Audit
- 障害時Spool退避とRecovery

### 重要な防御・配送保証設計
- Redis ZSET Sliding Window＋LuaによるRate Policy
- DNS解決とIP分類によるSSRF Guard
- DB保存後のQueue失敗を回収するOutbox
- Redis共有状態のCircuit Breaker
- Raw BodyのAES-256-GCM暗号化
- Replay Cooldownと回数上限
- DB障害時のSpool退避、上限、復旧

### 状態の表示原則
Webhook Gatewayについて、設計済み、実装済み、Test済み、本番検証済みを分けて表示します。設計書に存在する機能を、実装・検証済みとして扱いません。

## Knowledge Base
AsteraのKBは、回答を固定文から検索するだけのFAQ Botを目的としません。
Asteraの判断工程で必要になる、次の情報を供給します。
- 製品仕様
- 利用手順
- 料金・契約・解約
- 障害・復旧
- 開発者向け技術情報
- 法令・Guideline・公式情報
- Evidenceの参照先
- 追加質問への回答材料

### Free Layerと拡張Layer
公開情報を基にした基礎KBと、追加収集・検証した専門Dataを分離できます。
KBの内容だけで結論を固定せず、Domain Lens、Fact、Risk、Inquiry、Compareが、対象の問いに合わせて使用する情報を選びます。

### Private Knowledge
法人・開発者は、権限範囲内で自社資料、規定、製品情報、運用手順等を接続できます。
公開KB、利用者Private KB、外部検索結果を混同せず、Sourceと権限を分けることが必要です。

## Libral-Vault
Libral-Vaultは、秘密情報や機密Dataを扱うための独立した秘匿・鍵制御基盤です。
### 想定責務
- 通信・保存時の暗号化
- Key管理
- Secret Capsule
- Unlock Grant
- 一時復号
- 期限・権限付き利用
- Audit記録

### Asteraとの関係
Astera v8が秘密鍵や平文の機密情報を常時保持するのではなく、必要な処理へ必要な時間だけ解錠権限を渡す構造を目指します。
```plain text
暗号化されたData
↓
権限・期限・目的を確認
↓
一時Unlock Grant
↓
必要な処理だけが一時利用
↓
権限失効・監査記録
```

### 表示原則
暗号化を使用しても「絶対に漏えいしない」「完全に安全」とは表示しません。Algorithm、Key管理、実装、運用、権限、端末、外部Providerまで含めた実測と監査が必要です。

## TGserver
TGserverは、Asteraと周辺SystemのLog、障害情報、監査情報、Backupを、実行ServerのLocal Storageだけに依存せず外部へ配送・保管するための基盤です。
### 役割
- Application Log
- Error Log
- Audit Log
- Deploy・Build結果
- 障害時の状況
- Backup成果物
- Topic別整理

### 分離する理由
実行Serverが停止、破損、容量不足になった場合、同じServer内のLogだけでは原因調査できません。外部Log保管へ配送し、実行環境とEvidenceを分離します。
TGserverは判断材料生成を行いません。Astera v8、Webhook Gateway、App等の運用Evidenceを保存する補助基盤です。

## 外部Storage
利用者が選んだ外部Storageへ、結果、履歴、Template、Private Knowledge等を保存・転送する構造を取れます。
確認すべき項目：
- 保存対象
- 保存期間
- 暗号化
- Access権限
- Data削除
- Provider障害
- 容量
- 解約後の移行
- 国外移転

Asteraが外部Storage Providerの可用性、保存、削除、規約を保証するものではありません。

## Private Mode
Private Modeでは、入力、出力、履歴、Template等を、利用者が選択したStorageへ保存し、Astera側へ不要なDataを残さない構造を取ります。
ただし、次を事前に明確にする必要があります。
- 不正防止や課金に必要なMetadata
- Error調査に必要な最小情報
- 保存先ProviderのData取扱い
- 利用者自身のAccess管理
- 削除とBackupの関係

「Astera Serverに本文を保存しない」と「通信経路や外部Serviceを含めて誰もDataを扱わない」は同じではありません。

## 段階的な導入
### Stage 1｜手動利用
コピー＆ペーストでAsteraを使用します。既存AIと業務Systemを変更しません。

### Stage 2｜Web App
履歴、Option、保存、利用状況等を画面から管理します。

### Stage 3｜API
繰り返し処理や自社Appから判断材料生成を呼び出します。

### Stage 4｜Webhook・KB・Storage
外部Event、社内Knowledge、Storageへ接続します。

### Stage 5｜Vault・法人専有構成
秘密情報、権限、監査、専有環境、SLA等を個別設計します。

最初から全Systemを導入する必要はありません。必要な責務だけを追加し、既存構成を壊さず拡張します。

## 障害時の境界
### 主役AIが停止した場合
Asteraは判断材料を生成できても、接続先AIによる最終回答は生成できません。別Providerまたは人間へ判断材料を渡します。

### Webhook Gatewayが停止した場合
外部Eventの受信・配送に影響します。Asteraの手動利用や直接API利用とは分離します。

### KBが利用できない場合
KB依存のEvidence取得は制限されますが、入力Dataと基本処理だけで未確認事項を残して続行できる構造を維持します。

### TGserverが停止した場合
Log配送と外部保管に影響します。判断処理自体と分離し、Local Buffer、再配送、容量上限を設計します。

### Libral-Vaultが利用できない場合
暗号化Dataの解錠を必要とする処理を停止し、平文へ勝手にFallbackしません。

## 拡張しても変えない原則
- Asteraは主役AIを置き換えない
- 最終判断を自動で奪わない
- 判断材料生成と外部Systemの責務を混ぜない
- API接続を利用の必須条件にしない
- 秘密情報を不要に集中させない
- 実装済み、Test済み、計画を混同しない
- 障害時に影響範囲を限定する
- 各Componentを交換可能にする

## 公開範囲
本ページでは、利用者、開発者、投資家が、責務、依存関係、Data Flow、導入段階、障害境界を判断するための情報を公開します。
内部Endpoint、秘密鍵、Network詳細、認証情報、攻撃へ悪用できる具体的制御値、非公開の復旧手順は公開しません。
