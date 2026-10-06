# Feasibility and Preflight — Durable Incident Response Agent (DIA)

## Purpose
Before any implementation begins, verify that all prerequisites are met. Record a GO or HOLD decision.

## Hardware and environment
- [ ] Docker / container runtime installed and functional
- [ ] Node.js 22+ installed
- [ ] Python 3.12+ with `uv` available (for eval scripts)
- [ ] Sufficient disk for demo stack images (~8 GB)

## Workflow engine
- [ ] Temporal server can run locally (docker compose or Temporal CLI dev server)
- [ ] Temporal SDK version compatible with chosen TypeScript version
- [ ] Temporal determinism constraints understood (reference: https://docs.temporal.io/activity-definition)

## Telemetry stack
- [ ] Prometheus can run locally
- [ ] Loki or log file shipper available
- [ ] Jaeger or Tempo for traces available
- [ ] Grafana dashboards importable

## Provider access
- [ ] OpenAI-compatible API endpoint accessible (or mock mode for MVP)
- [ ] No paid services required for local demo
- [ ] Decision layer provider access confirmed OR marked optional

## Licenses
- [ ] Temporal SDK license reviewed
- [ ] All dependencies: license and maintenance status in `docs/DECISIONS.md`

## Budget
- [ ] No cloud spending required
- [ ] No GPU required

## Tools
- [ ] `make`, `docker compose`, `gitleaks`, linters available

## Decision
- [ ] **GO** — all prerequisites met, proceed to DIA-01
- [ ] **HOLD** — blocker identified: _________________
