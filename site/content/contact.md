# お問い合わせ
Asteraへのお問い合わせは、公式HPの問い合わせフォームから受け付けます。

## 問い合わせ内容
- Asteraの機能・利用方法
- 料金・クレジット・決済
- アカウント・解約
- Dataの取扱い・削除
- 不具合・障害
- Securityに関する連絡
- 法人利用・API・PoC
- 個人支援・CAMPFIRE
- スポンサー・協賛
- 投資・事業提携
- 開発協力
- その他

## 入力項目
- 問い合わせ分類
- 返信先メールアドレス
- ニックネームまたは名称
- 件名
- 問い合わせ内容
- 必要な場合のみ添付File
- Privacy Policyへの同意
- Turnstileによる送信確認

送信後、内容に応じて案内または返信を行います。

## 添付File
添付は0〜5件、合計25MBまでです。画像、PDF、Text、Office、ZIPを対象とし、実行File、Script、Password付きArchiveは受け付けません。Serverが形式、容量、危険性を再検証し、保存後は公開されないOpaqueなAttachment IDへ変換します。

## 送信処理
Formは`POST /api/contact`へ`multipart/form-data`で送信します。Browserは`clientRequestId`を生成し、同じIDを重複受付しない冪等性を持たせます。公開HPからAdmin Consoleへ直接接続せず、Cloudflare Function、Validation、Turnstile、Webhook Gateway通知、非公開運営処理へ分離します。

## 状態とError
- Initial
- Validating
- Uploading
- Sending
- Accepted
- Validation Error
- Rate Limited
- Unavailable

`202`は受付完了とRequest IDを表示します。`400`は入力不備、`413`は容量超過、`429`は送信過多、`503`は一時停止です。失敗時に入力本文を消しません。

## Privacy
問い合わせの保存目的、保存期間、添付、返信、削除請求への案内をFormの近くに表示します。Password、API Key、Secret、Card情報、個人番号、不要な医療情報、第三者の秘密情報を入力しないでください。

## 関連ページ
- [Q&A](/qa/)
- [Astera総合案内AI](/chat/)
- [Privacy Policy](/legal/privacy/)
- [法人・協業相談](/corporate/)
- [開発支援・スポンサー](/support/)
