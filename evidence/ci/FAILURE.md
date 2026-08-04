# CI verification failure

- GitHub Actions run: 30926046467
- Tested commit: f617b070d24407aa01a56f36575f3ef931a0f32d
- Source recheck exit status: 1
- Workflow: Verify and materialize website

source-test-tail.log contains the last 500 lines of a clean source-test rerun. playwright-results.json is included when browser execution reached Playwright. preview-server.log is included when the local preview server was started.
