# CI verification failure

- GitHub Actions run: 30982463520
- Tested commit: f6370ebe1ab247e9a77977dae996b4664ea0f547
- Source recheck exit status: 1
- Workflow: Verify and materialize website

source-test-tail.log contains the last 500 lines of a clean source-test rerun. playwright-results.json is included when browser execution reached Playwright. preview-server.log is included when the local preview server was started.
