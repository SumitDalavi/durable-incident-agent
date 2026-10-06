# AGENTS.md: instructions for coding agents

## Mission
Build `durable-incident-agent`: durable, approval-gated incident investigation and remediation over real telemetry from a demo stack.

## Read first
`docs/ARCHITECTURE.md`, `docs/THREAT_MODEL.md`, your work package, `shared/*`.

## Hard rules
1. **Determinism in workflows.** Workflow code must be deterministic: no wall-clock reads, randomness, network calls, or model calls inside workflow code. All side effects (model calls, telemetry queries, remediation) are activities.
2. **Idempotency.** Every activity must be safe to retry. Remediation actions carry an idempotency key and check current state before acting.
3. **Approvals are workflow signals persisted by the workflow engine**, not in-memory flags.
4. **Remediations come from an allowlisted action catalog** with typed parameters. The agent selects and parameterizes; it never emits arbitrary shell.
5. **Verify with telemetry** after any remediation; the verdict is based on metrics, not on the agent's words.
6. Label live/replay/mock model modes; never hard-code outputs without REPLAY labels.
7. No unmeasured numbers in docs.

## Layout
```text
contracts/             incident, evidence, action-catalog, approval schemas
services/workflows/    durable workflow definitions + activities (TypeScript)
services/agent/        model adapter + investigation reasoning (TypeScript)
services/remediator/   action catalog executor (TypeScript or Go)
services/api/          incident API + SSE (TypeScript)
apps/ui/               incident timeline + approvals
demo-stack/            checkout, payments, inventory services + fault injector
telemetry/             prometheus, loki/log shipper, tracing config, dashboards
scenarios/             fault scenarios + expected diagnoses
eval/                  evaluation harness
```

## Commands
`make setup | dev | test | e2e | lint | eval | demo | clean`

## When unsure
Write questions in `docs/progress/<WP-ID>.md` and stop.
