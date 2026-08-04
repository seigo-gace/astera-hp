# 開発者向け
Asteraは、最終回答を生成するAIではなく、問い、資料、AI回答を判断材料へ変換するRuntimeです。開発者は、Asteraが生成した目的、前提、事実、Risk、反対視点、比較案、推奨判断、再指示を、自社App、AI Agent、業務Flowへ接続できます。

## Astera APIが返すもの
- Cognitive Map
- 8項目の判断材料
- Evidence情報
- Candidate Ranking
- 主役AIへ渡す再指示

最終回答の生成を必須にせず、利用側が選んだAIまたは人間へ判断材料を渡せることを重視します。

## 利用開始の流れ
1. Astera Accountと利用条件を確認する
2. Developer Modeで利用可能なAPIを確認する
3. API KeyとScopeを発行する
4. SandboxまたはTest環境でRequestを確認する
5. Error、Rate、Retry、Idempotencyを実装する
6. Production利用前にSecurityと利用量を確認する

現在利用できるAPI、提供条件、Rate、QuotaはAppのDeveloper Modeと[プラン・料金](https://app.asterav8.jp/pricing)で確認します。HPへ値を複製しません。

## Authentication
API Keyは利用者自身が管理し、Client側の公開Sourceへ埋め込みません。KeyにはTenant、Scope、環境、失効状態を関連付けます。
```javascript
Authorization: Bearer <API_KEY>
Content-Type: application/json
X-Request-Id: <UUID>
```

## 共通Response
成功Responseは、処理結果とRequest IDを返します。Error Responseは、公開可能なCode、Message、Request ID、再試行可否を返します。
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Request limit exceeded.",
    "requestId": "opaque-id",
    "retryable": true
  }
}
```
内部Stack Trace、Secret、Provider Credential、Network情報は返しません。

## Astera判断材料生成
利用側から問い、Context、資料等を渡し、8項目と再指示を受け取ります。入力上限、File、Option、消費予定は実行前に確認します。

## Webhook Gateway
Webhook Gatewayは、外部ServiceのEventを受信し、署名検証、正規化、保存、Queue配送、Retry、Replay、Auditを行う独立Systemです。一般Appの通常実行APIを無条件にWebhook Gatewayへ通すものではありません。

## Vault
Vaultは、API Key、認証情報、機密Dataを通常処理から分離し、目的、権限、期限を確認した一時利用へ制限します。暗号化だけで完全安全になるとは表示しません。

## Log & Storage
Log、Audit、Storage連携では、本文Data、個人情報、Secretを不要に記録せず、Correlation IDで処理を追跡します。利用者Dataの保存先、保存期間、削除、Exportを明確にします。

## Skill Runtime
Skill Runtimeは、Skillの検索、選択、権限、License、Sandbox、実行結果を管理するための公開API候補です。提供状態が`available`になるまでは利用可能と表示しません。

## 提供状態
- `available`：一般利用可能
- `beta`：制限付き利用
- `preparing`：公開準備中
- `internal-only`：Astera内部専用

各APIの状態は、DocumentationとDeveloper Modeで確認します。

## Security
- KeyをBrowserへ埋め込まない
- 最小Scope
- Request検証
- Rate Limit
- Timeout・Retry
- Idempotency
- Secret Masking
- Audit
- Key失効・再発行

## Documentation
- [技術基盤](/product/technology/)
- [連携・拡張性](/product/integration/)
- [ドキュメント](/docs/)
- [法人・協業相談](/corporate/)
