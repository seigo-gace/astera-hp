# Astera HP implementation confirmation previews

This directory is the direct confirmation surface for step-by-step TOP reconstruction.

## Immutable rules

1. Work directly on the existing `main` branch. Do not create, switch, or replace branches.
2. Complete only one approved implementation item at a time.
3. At the end of that item, create or update `preview/<item>/index.html`.
4. The preview must distinguish completed scope from untouched or unfinished scope.
5. Report an immutable preview URL pinned to the resulting commit SHA.
6. Do not start the next implementation item before the confirmation URL has been issued.
7. GitHub Pages remains a full-site secondary preview. The direct HTML preview must not depend on a GitHub Actions run.
8. Official brand assets must be visibly rendered in the confirmation page; file references alone are not sufficient.

## Current preview

- `preview/header-upper/index.html` — Header upper row: extensible language dropdown on the left, verified Astera logo on the right, and verified symbol on mobile. The fixed preview resolves the commit SHA from its own URL and renders the verified SVG bytes from that same commit.

## URL format

```text
https://htmlpreview.github.io/?https://github.com/seigo-gace/astera-hp/blob/<COMMIT_SHA>/preview/<ITEM>/index.html
```

The commit-pinned URL ensures that the reviewed page cannot silently change after the report.
