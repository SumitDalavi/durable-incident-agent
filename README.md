# durable-incident-agent

> An incident-response agent whose investigation survives crashes, resumes where it left off, and never takes a remediation action without an approval that is itself durable.

Inject a fault into a demo microservice stack, let an agent investigate using real telemetry (metrics, logs, traces), kill the worker mid-investigation, watch it resume, and approve a scoped remediation that is verified against telemetry afterwards.

**Status: personal portfolio project. Not production-deployed.**

## Capability status

| Capability | Status |
|---|---|
| Demo stack with fault injection (checkout, payments, inventory) | Planned |
| Telemetry (Prometheus, Loki or log files, Jaeger/Tempo) | Planned |
| Durable workflow orchestration | Planned |
| Agent investigation with telemetry tools | Planned |
| Worker-kill resume demo | Planned |
| Durable approval gate (survives restarts, with timeout/escalation) | Planned |
| Remediation executor + post-action verification | Planned |
| Incident timeline UI + postmortem draft | Planned |
| Optional decision layer (severity, retryability, routing) | Planned |

## Demo (3-4 minutes)

1. Inject "payments latency spike" fault.
2. Alert fires; workflow starts; agent queries metrics/logs/traces.
3. Kill the agent worker mid-run.
4. Restart the worker; the workflow resumes without repeating completed steps.
5. Agent proposes a scoped remediation; approval requested.
6. Approve; remediation executes; telemetry verifies recovery; postmortem draft generated.

## Docs
[Architecture](docs/ARCHITECTURE.md) | [Plan](docs/IMPLEMENTATION_PLAN.md) | [Work packages](docs/WORK_PACKAGES.md) | [Threat model](docs/THREAT_MODEL.md) | [Evaluation](docs/EVALUATION.md) | [Demo](docs/DEMO_SCRIPT.md) | [Decisions](docs/DECISIONS.md)

