# Traceability Matrix

Track the chain: **Requirement → Work Package → Acceptance Test → Evidence Artifact**.

Fill rows as packages are implemented. Test identifiers and evidence paths remain empty until tests exist; do not fabricate entries.

| Requirement | Work Package | Acceptance Test | Evidence Artifact | Status |
|---|---|---|---|---|
| _Example: Sandbox isolates agent execution_ | _SBX-03_ | _e2e/sandbox-isolation.test.ts_ | _results/sbx-03/isolation-report.json_ | _PLANNED_ |
| | | | | |
| | | | | |
| | | | | |

## Rules

1. Every row must trace to a real test file once implemented. Placeholder test names are allowed during PLANNED status.
2. Evidence artifacts are files in `results/` or `docs/progress/` with exact paths.
3. Interface drift (schema changes that affect consumers) must be recorded here with the affected packages listed.
4. A row with no evidence artifact is UNVERIFIED, regardless of what any agent claims.
