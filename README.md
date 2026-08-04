# Astera Official Website

Astera公式HPのNotion正本を、公開用Sourceと生成済みStatic Websiteへ反映したRepositoryです。

## Repository contents

- `site/data/` — Notion Source Inventory、26 Route Content、Route Contract、Visual Contract
- `site/templates/` — 共通ShellとRoute Template
- `site/assets/` — CSS、JavaScript、Customer AI／Contact Transport
- `site/functions/` — Cloudflare Pages Functions
- `site/scripts/` — Build、Notion Export、Validation
- `test/` — Source／Route／Content／Pricing／Redirect検査
- `site/dist/` — Build済みの26公開Route、404、Sitemap、Headers、Redirects、SHA256台帳

## Commands

```bash
npm ci
npm test
npm run build
```

## Source coverage

- Management sources: 22
- Public routes: 26
- Required appendix sources: 5
- Visual contracts: 26
- Pricing: `https://app.asterav8.jp/pricing`への308 Redirectのみ

## Current main

`main`にはSourceとBuild済みStatic Websiteの両方をCommitしています。GitHub側の後続作業は、このBranchを起点に継続できます。

## Production boundary

正式Logo／Favicon／採用Visual Binary、Live Notion Export、Cloudflare Preview、実機、Screen Reader、E2E、法務確認、Production Deployは未完了です。代替Logoや生成Logoは含めません。
