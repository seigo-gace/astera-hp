# Astera Official Website

Astera公式HPのNotion正本を、公開用Sourceと生成済みStatic Websiteへ反映したRepositoryです。

## Repository contents

- `site/data/` — Notion Source Inventory、26 Route Content、Route Contract、Visual Contract
- `site/templates/` — 共通ShellとRoute Template
- `site/assets/` — CSS、JavaScript、Customer AI／Contact Transport
- `site/functions/` — Cloudflare Pages Functions
- `site/scripts/` — Build、Notion Export、Validation、GitHub Pages Preview Materialization
- `test/` — Source／Route／Content／Pricing／Redirect検査
- `site/dist/` — Build済みの26公開Route、404、Sitemap、Headers、Redirects、SHA256台帳
- `site/preview-dist/` — GitHub Pages用にProject Pathを付与して生成する一時確認Build（Repositoryへ常設Commitしない）

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
- Pricing: `https://app.asterav8.jp/pricing`への308 Redirectのみ

## Current main

`main`にはSourceとBuild済みStatic Websiteの両方をCommitしています。GitHub側の後続作業は、このBranchを起点に継続できます。

## Online preview policy

`.github/workflows/preview-pages.yml`は、`main`更新時に次を自動実行します。

1. `npm ci`
2. `npm test`
3. `site/dist`をGitHub PagesのProject Path `/astera-hp/`向けに変換
4. `site/preview-dist`をGitHub PagesへDeploy

確認URLは `https://seigo-gace.github.io/astera-hp/` です。これは公開前の画面・Responsive・Animation・導線確認用であり、Production Domain、決済、Account、Customer AI Backendの稼働判定には使用しません。今後のHP変更は、GitHub実装、Test、Online Preview確認、Evidence確定の順で扱います。

## Production boundary

正式Logo／Favicon／採用Visual Binary、Live Notion Export、Cloudflare Preview、実機、Screen Reader、E2E、法務確認、Production Deployは未完了です。代替Logoや生成Logoは含めません。
