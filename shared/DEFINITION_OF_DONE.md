# Definition of Done (applies to every work package)

A work package is done only when all boxes are true.

- [ ] Code compiles/lints cleanly: `make lint` passes.
- [ ] Unit tests added for new logic; `make test` passes.
- [ ] Acceptance criteria in the work package are demonstrably met (command or test names listed in the PR).
- [ ] No secrets, tokens, or real credentials committed. `gitleaks` (or equivalent) passes in CI.
- [ ] Public interfaces documented (OpenAPI/proto/JSON Schema updated).
- [ ] Docs updated: any change to behavior updates `docs/ARCHITECTURE.md` or the relevant doc.
- [ ] Capability status table in README updated honestly (Implemented / Simulated / Planned).
- [ ] Observability: new components emit structured logs and OpenTelemetry spans where the plan says so.
- [ ] Failure paths tested (timeouts, denied actions, malformed input).
- [ ] PR description lists: what changed, how to verify, known limitations.

## Prohibited in any PR

- Weakening a security control to make a test pass.
- Hard-coding a model response to make a demo succeed without a REPLAY label.
- Adding dependencies without noting license and maintenance status in the PR.
- Committing generated benchmark numbers that were not produced by the harness.
