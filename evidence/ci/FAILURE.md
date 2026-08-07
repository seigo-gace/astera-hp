# CI verification failure

- GitHub Actions run: 31138295061
- Tested commit: 27f42d3b26a14f56ef91dec76f30315997b7850c
- Source recheck exit status: 1
- Workflow: Verify and materialize website

source-test-tail.log contains the last 500 lines of a clean source-test rerun. playwright-results.json is included when browser execution reached Playwright. preview-server.log is included when the local preview server was started.
