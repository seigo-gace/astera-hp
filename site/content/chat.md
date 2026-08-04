# Astera総合案内AI
Astera総合案内AIは、Asteraの製品、使い方、技術、法人利用、投資家向け情報、操作方法について、公開Knowledge Baseを基に案内します。

## 回答タイプ
### 一般
Asteraとは何か、何ができるか、どのような場面に向くかを説明します。

### 技術
V8 Runtime、Lens、Overlay、API、Webhook、Vault、Storage等の公開可能な情報を説明します。

### 法人
導入形態、PoC、Data、Security、運用、契約、相談方法を案内します。

### 投資家
事業の必要性、製品、初期Evidence、Business Model、資金用途、資料確認先を案内します。

### 操作説明
入力、用途選択、結果、再指示、履歴、Account、料金Page等の利用方法を案内します。

## Source
回答には、可能な範囲で公開SourceのTitle、URL、更新日を表示します。内部Notion URL、Repository内部Path、Secret、非公開設定は表示しません。

## 入力しない情報
- Card番号
- Password
- API Key
- Secret
- 本人確認書類
- 医療等の機微情報
- 第三者の個人情報や秘密情報

## 回答できない場合
公開情報が不足している、個別契約・法務判断が必要、障害が発生している場合は、推測で回答を作らず、[Q&A](/qa/)または[お問い合わせ](/contact/)へ案内します。

## 通信と状態
回答は`POST /api/ai/chat`へ送信し、SSEの`meta`、`delta`、`source`、`done`、`error`を処理します。Messageは12,000文字、Historyは20 turn、Timeoutは30秒です。Welcome、Composing、Sending、Streaming、Completed、Rate Limited、Unavailable、Safety Stopを分けて表示します。

## Privacy
会話本文をAnalyticsやLocal Storageへ自動保存しません。保存・Logの範囲はPrivacy Policyに従います。公開案内に不要な機微情報を入力しないでください。

## 重要事項
Astera総合案内AIの回答は、製品案内と公開情報の確認を目的とします。法律、医療、投資、契約、組織決裁その他の最終判断を代行しません。現在のPlan、料金、Credit、利用条件は[Astera Appのプラン料金ページ](https://app.asterav8.jp/pricing)で確認します。
