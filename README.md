# durable-incident-agent

> An incident-response agent whose investigation survives crashes, resumes where it left off, and never takes a remediation action without an approval that is itself durable.

Inject a fault into a demo microservice stack, let an agent investigate using real telemetry (metrics, logs, traces), kill the worker mid-investigation, watch it resume, and approve a scoped remediation that is verified against telemetry afterwards.

**Status: Fully functional E2E Portfolio Project.**

## Capability status

| Capability | Status |
|---|---|
| Demo stack with fault injection (checkout, payments, inventory) | Implemented |
| Telemetry (Prometheus, Loki or log files, Jaeger/Tempo) | Implemented |
| Durable workflow orchestration | Implemented |
| Agent investigation with telemetry tools | Implemented |
| Worker-kill resume demo | Implemented |
| Durable approval gate (survives restarts, with timeout/escalation) | Implemented |
| Remediation executor + post-action verification | Implemented |
| Incident timeline UI + postmortem draft | Implemented |
| Optional decision layer (severity, retryability, routing) | Implemented |

## Demo (3-4 minutes)

1. Inject "payments latency spike" fault.
2. Alert fires; workflow starts; agent queries metrics/logs/traces.
3. Kill the agent worker mid-run.
4. Restart the worker; the workflow resumes without repeating completed steps.
5. Agent proposes a scoped remediation; approval requested.
6. Approve; remediation executes; telemetry verifies recovery; postmortem draft generated.

## Docs
[Architecture](docs/ARCHITECTURE.md) | [Demo](docs/DEMO_SCRIPT.md)

