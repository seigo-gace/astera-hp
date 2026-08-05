# Astera Official Website

Astera公式HPの公開実装Repositoryです。

## Source-of-truth boundary

**このRepositoryは正本ではありません。**

Astera公式HPの仕様、本文、Route、Design、Asset採用、料金境界、公開条件は、Notionの`Astera公式HP｜開発正本`以下だけを正本として扱います。GitHubは、Notion正本を実装、検証、仮表示、Evidence保存するための出力先です。

NotionとGitHubが食い違う場合はNotionを優先し、GitHub側を修正します。GitHub上のREADME、既存Code、Commit、生成物を根拠に仕様を変更しません。

## Repository contents

- `site/data/` — 公開Build用のSource Inventory、26 Route Content、Route Contract、Visual Contract
- `site/templates/` — 共通ShellとRoute Template
- `site/assets/` — CSS、JavaScript、公開Asset
- `site/functions/` — Cloudflare Pages Functions
- `site/scripts/` — Build、Export、Validation、GitHub Pages Preview Materialization
- `test/` — Source／Route／Content／Pricing／Redirect／Public Repository Safety検査
- `site/dist/` — Build済みの26公開Route、404、Sitemap、Headers、Redirects、SHA256台帳
- `site/preview-dist/` — GitHub Pages用にProject Pathを付与して生成する一時確認Build。Repositoryへ正本として常設しません

## Commands

```bash
npm ci
npm test
npm run build
node site/scripts/build-preview.mjs
```

## Source coverage

- Management sources: 22
- Public routes: 26
- Required appendix sources: 5
- Visual contracts: 26
- Pricing: `https://app.asterav8.jp/pricing`へのPermanent Redirectと直接Linkだけ

## Public repository boundary

このRepositoryはPublicです。公開HPに必要なSource、公開本文、公開Asset、Test、Build Script、Workflowだけを置きます。

Secret、Token、Password、Private Key、Credential、`.env`、内部Endpoint、非公開Notion URL、Account、Billing、Credit、管理Consoleの内部情報を置きません。Public Repository Safety Validatorを必須Testへ含めています。

## Temporary online preview

`.github/workflows/preview-pages.yml`は、`main`更新時に次を自動実行します。

1. `npm ci`
2. `npm test`
3. `site/dist`をGitHub PagesのProject Path `/astera-hp/`向けに変換
4. `site/preview-dist`をGitHub PagesへDeploy

仮確認URL：`https://seigo-gace.github.io/astera-hp/`

GitHub Pagesは、完成前の画面、Responsive、Animation、内部導線、Asset読込をネット上で確認するためだけに使用します。正式公開、決済、Account、Customer AI Backend、Contact Backend、Cloudflare Functions、Production Securityの合格判定には使用しません。

## Final deployment

最終配備先はCloudflare Pagesです。

- Production Domain: `https://asterav8.jp`
- GitHub Pages: 開発途中の仮確認
- Cloudflare Preview: 完成候補の実環境検証
- Cloudflare Production: 全Gate合格後の正式公開

正式Logo／Favicon、Live Notion Export、Cloudflare Preview、実機、Screen Reader、Functions E2E、法務確認、Rollback、Production Deployは未完了です。ProductionはNO-GOです。
