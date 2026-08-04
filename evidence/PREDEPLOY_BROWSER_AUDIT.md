# Predeploy browser audit

This record is the reproducible browser validation completed before server deployment.

## Final result

- GitHub Actions run: `30888730553`
- Tested commit: `103979d1a6ed67410cfec9839a71db1cebadd206`
- Evidence commit: `8447585b38b86ff3cfc43268f9346866067f038b`
- Source tests: `19/19 PASS`
- Browser tests: `54/54 PASS`
- Route renders: `26 desktop + 26 mobile`
- Pricing redirect checks: `PASS`
- Browser runtime: `Playwright 1.62.0`
- Dependency security gate: `npm audit HIGH/CRITICAL = 0`
- Desktop viewport: `1440 x 1000`
- Mobile profile: `Pixel 7`
- Full-page screenshots generated: `52`
- Representative screenshots retained in the repository: `8`

## Browser checks

Each sitemap route was opened through a local HTTP preview of `site/dist`. The suite checked HTTP status, console errors, page errors, unresolved template placeholders, horizontal overflow, broken images, unknown internal links, desktop navigation, mobile menu open/close, Contact form, Chat form, Q&A search, Customer AI launcher and Cloudflare pricing redirect configuration.

The retained screenshots and machine-readable result are under `evidence/browser/`.

## Boundary

This is a pre-server repository/browser validation. Cloudflare Preview, real production credentials, live API behavior, real-device hardware, screen-reader operation and production deployment remain separate environment checks.
