# Astera Official Website

Astera公式HPのStatic Sourceです。最新のNotion開発正本を基準に、公開本文、26 Route、SEO Metadata、Cloudflare Pages Functions、Redirect、Security Header、検証を一つのRepositoryへ統合しています。

## Build

```bash
npm ci
npm test
```

Build Outputは`site/dist/`です。Cloudflare PagesではRoot Directoryを`site`、Build Commandを`npm --prefix .. run build`相当へ設定するか、Repository Rootで`npm run build`を実行し、Output Directoryを`site/dist`へ指定します。

## 公開境界

- HPは料金値を保持しません。
- `/pricing`と`/pricing/`は`https://app.asterav8.jp/pricing`へPermanent Redirectします。
- Q&Aと総合案内AIは別Routeです。
- Static本文は外部API障害時も閲覧できます。
- Secret、内部Runtime、Admin APIをClient Bundleへ含めません。

## Environment Variables

- `CUSTOMER_AI_URL`
- `CUSTOMER_AI_TOKEN`
- `CONTACT_INGEST_URL`
- `CONTACT_INGEST_TOKEN`
- `TURNSTILE_SECRET_KEY`
- `PUBLIC_SUPPORTERS_URL`
- `PUBLIC_SUPPORTERS_TOKEN`

正式Logo・OGP Binary AssetはNotion共通Asset正本から配置し、生成物や仮Logoへ置換しません。
