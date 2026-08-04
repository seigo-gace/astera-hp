# Notion hierarchy audit — 2026-08-04

## Traversed hierarchy
- Root: Astera公式HP｜開発正本
- Direct management children: 9
- Sitemap children: 29
- Shared shell grandchildren: 9
- Management source inventory: 22
- Normal public routes: 26
- Required appendix/reference sources: 5
- External routes: 3

## Previous branch gap
The previous branch only contained 26 simplified pages with mostly one to three summary sections and six tests. It did not contain the Notion source inventory, route contracts, full section projections, 26 visual contracts, asset/motion manifests, or the source coverage validators required by the Notion source of truth.

## Applied correction
- Replaced split summary page data with a single traceable content bundle.
- Added `notion-source-inventory.json` (22 + 26 + 5).
- Added `route-contracts.json`, `page-visuals.json`, asset and motion manifests.
- Expanded all Main 8 pages to their required section structures.
- Added legal appendix anchors and public API contracts.
- Added dedicated validation scripts and 19 Node tests.
- Kept `/pricing` redirect-only.

## Production blockers not fabricated
- Approved binary visual pack is not retrievable from the current integration.
- Individual official brand asset bytes and favicon variants are not independently verified.
- Live Notion export credential is not available in this runtime.
- Cloudflare Preview, real-device, screen-reader, network CSP and production verification remain not run.

The source is complete enough for repository-level contract validation, but production remains NO-GO until the external binary and live-environment gates pass.
