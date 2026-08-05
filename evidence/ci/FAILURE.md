# CI verification failure

- GitHub Actions run: 30988610292
- Tested commit: 1b8f79185d44f7a011357cf86397544b52556d14
- Source recheck exit status: 1
- Workflow: Verify and materialize website

source-test-tail.log contains the last 500 lines of a clean source-test rerun. playwright-results.json is included when browser execution reached Playwright. preview-server.log is included when the local preview server was started.
