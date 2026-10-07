# durable-incident-agent

> **Maturity:** Fully functional E2E Portfolio Project
> An incident-response agent whose investigation survives crashes, resumes where it left off, and never takes a remediation action without an approval that is itself durable.

## The Problem
Modern distributed systems and AI agents require robust operational scaffolding. Simple CRUD apps or mock loops fail when subjected to real-world edge cases, asynchronous boundaries, and security constraints.

## The Solution
Inject a fault into a demo microservice stack, let an agent investigate using real telemetry (metrics, logs, traces), kill the worker mid-investigation, watch it resume, and approve a scoped remediation that is verified against telemetry afterwards.

## 💻 Tech Stack
- **Core Technology**: TypeScript, Node.js, Docker
- **Architecture**: Microservices, Event-Driven

## 📚 Documentation
- [Architecture](docs/ARCHITECTURE.md) — System diagram and component details
- [Runbook](docs/RUNBOOK.md) — Setup, commands, and expected outputs
- [Demo](docs/DEMO_SCRIPT.md) — Walkthrough scenario

## 🚀 Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/SumitDalavi/durable-incident-agent.git
cd durable-incident-agent

# 2. Build and start
make setup
make dev
```

## 💻 Usage & Demo
See the [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the interactive walkthrough and verification steps.

## ✅ Verification

| Check | Command | Expected |
|-------|---------|----------|
| Build | `make setup` | Dependencies install successfully |
| Run | `make dev` | Services start without crashing |

## Capability Status
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

## 👨‍💻 Author
**Sumit Dalavi** — Senior DevSecOps / Platform Engineer
[GitHub](https://github.com/SumitDalavi) | [LinkedIn](https://in.linkedin.com/in/sumit-dalavi-762838129)

---
*Built with a focus on robust patterns, not toy demos.*


## October 2026 Update: Behavioral Testing & Runtime Stabilization

**Implementation Notes:**
Fixed auth middleware integration prior to Temporal workflow steps. Behavioral tests now validate actual simple Bearer token equality boundaries.

* Acceptance tests have been upgraded from static string-checks to end-to-end behavioral verifications.
* API boundaries and execution layers (Docker, WebSockets, Temporal, etc.) are now explicitly exercised in tests.

## Phase 5.1 Update: Real Integration & CI Stabilization
- **Finite-Value Validation**: Implemented strict validation rejecting `NaN`, `Infinity`, and negative metrics as inconclusive to ensure strict data reliability.
- **Real Integration Verification**: Added `test-real.js` to demonstrate true E2E integration with live Docker containers (Temporal, PostgreSQL, Prometheus) and functional microservices injected with real fault spikes.
- **CI Stabilization**:
  - Bound Temporal explicitly to IPv4 (`127.0.0.1`) to resolve GitHub Actions IPv6 `ECONNREFUSED` issues.
  - Replaced hardcoded sleep intervals with deterministic `/health` endpoint polling on the Express API to guarantee Temporal connectivity before executing E2E faults.
  - Re-introduced a dedicated PostgreSQL database container as Temporal's `auto-setup` script does not natively support SQLite for default persistence, ensuring reliable boot-up in headless CI runners.
