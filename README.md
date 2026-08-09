# Astera Official Website

Astera公式HPの現在公開中の直接Static実装です。

## Source of truth

仕様・本文・Route・Design・Asset採用・公開条件の正本はNotionの`Astera公式HP｜開発正本`です。GitHubは実装・検証・公開確認のための反映先であり、GitHub側の状態から仕様を逆決定しません。

## Current public source

現在のWeb公開はRoot直下の直接Static構成だけを使用します。

- `index.html` — 現在の公開TOP
- `style.css` / `styles/` — 現在のStyle
- `script.js` / `scripts/` — 現在のClient JavaScript
- `assets/` — 現在の公開Asset
- `CNAME` — `asterav8.jp`
- `.github/workflows/verify.yml` — 現在のStatic検証
- `.github/workflows/preview-pages.yml` — 現在のGitHub Pages公開

旧Build構成、Notion Build同期、旧Preview、旧Test、旧Evidence用構造は現在のHP Sourceとして使用しません。

## Current Hero assets

Heroの公開WebPは次の3Fileを`assets/images/hero/`から直接使用します。

- `astera-hero-desktop-1280x720.webp`
- `astera-hero-tablet-1024x576.webp`
- `astera-hero-mobile-720x405.webp`

一時受け渡し用Folderは使用しません。
