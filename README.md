# Durable Incident Agent

[![CI Pipeline](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SumitDalavi/durable-incident-agent?color=0969da&label=release&logo=github)](https://github.com/SumitDalavi/durable-incident-agent/releases)
[![Release Workflow](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/release.yml/badge.svg)](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/release.yml)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%202.3-blueviolet?logo=spdx)](https://github.com/SumitDalavi/durable-incident-agent/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Distributed via GitHub Container Registry (`ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0`) and tagged GitHub Releases with Anchore SPDX 2.3 SBOM and SHA-256 digest attestation.

---

## The Problem
Modern distributed systems and AI agents require robust operational scaffolding. Simple CRUD apps or mock loops fail when subjected to real-world edge cases, asynchronous boundaries, and security constraints.

## The Solution
Inject a fault into a demo microservice stack, let an agent investigate using real telemetry (metrics, logs, traces), kill the worker mid-investigation, watch it resume, and approve a scoped remediation that is verified against telemetry afterwards.

---

## Key Capabilities & Architectural Highlights
- **Durable Saga Orchestration**: Fault triage, evidence collection, and approval-gated mitigation via Temporal.
- **Crash-Proof Resilience**: Worker restart mid-investigation resumes deterministically without duplicate execution.
- **Sustained Cooldown Observation**: Multi-minute post-mitigation observation tracking p95 latency and error rate stability.
- **Full OCI Distribution**: Published to GitHub Container Registry (GHCR).

## 💻 Tech Stack
- **Container Registry:** `ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0`
- **Security & Attestation:** Anchore SPDX 2.3 SBOM, SHA-256 Checksums
- **License:** MIT Open Source

---

## 📚 Documentation Index
- [Architecture Specification](docs/ARCHITECTURE.md) — System diagram, component contracts, and container distribution architecture.
- [Production Runbook](docs/RUNBOOK.md) — Operational runbook, live execution commands, and verification recipes.
- [Demo Walkthrough](docs/DEMO_SCRIPT.md) — Step-by-step interactive demonstration scenario.
- [Changelog](CHANGELOG.md) — Full version history following Keep a Changelog and SemVer.

---

## 🚀 Quickstart & Installation

### Option 1: Run with Docker Container (GHCR)
```bash
docker pull ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0
docker run -d -p 4000:4000 -e TEMPORAL_ADDRESS=temporal:7233 ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0
```

### Option 2: Run with Docker Compose (Full Stack)
```bash
docker compose up -d
npm run start --workspace=agent
```

### Option 3: Local Developer Setup
```bash
# 1. Clone the repository
git clone https://github.com/SumitDalavi/durable-incident-agent.git
cd durable-incident-agent

# 2. Build and start
make setup
make dev
```

---

## 🎮 Usage & Demo
See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the interactive walkthrough and verification steps.

## Demo (3-4 minutes)

1. Inject "payments latency spike" fault.
2. Alert fires; workflow starts; agent queries metrics/logs/traces.
3. Kill the agent worker mid-run.
4. Restart the worker; the workflow resumes without repeating completed steps.
5. Agent proposes a scoped remediation; approval requested.
6. Approve; remediation executes; telemetry verifies recovery; postmortem draft generated.

---

## ✅ Verification

### Operational Verification
| Check | Command | Expected |
|---|---|---|
| Build | `make setup` | Dependencies install successfully |
| Run | `make dev` | Services start without crashing |
| Test | `make test` | Behavioral test suite passes |

### Cryptographic & Supply Chain Verification
To verify the authentic origin, integrity, and software composition of release artifacts:
```bash
# 1. Download Release Bundle & Checksums
gh release download v0.2.0 --repo SumitDalavi/durable-incident-agent --pattern "*.tar.gz" --pattern "checksums.txt"

# 2. Verify SHA-256 Digest
sha256sum -c checksums.txt

# 3. Inspect SPDX 2.3 Software Bill of Materials
gh release download v0.2.0 --repo SumitDalavi/durable-incident-agent --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .spdxVersion
```

---

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

---

## 🔌 Dual-Mode Execution: Live-First with Graceful Mock Fallback

This platform operates in **Dual-Mode**, dynamically selecting between live production infrastructure and self-contained mock fixtures based on environment variables:

| Component | Environment Variable | Live Mode Behavior | Fallback Mode (Unset / Empty) |
|---|---|---|---|
| **Temporal Engine** | `TEMPORAL_ADDRESS` | Connects to distributed Temporal cluster (e.g. `temporal.prod.internal:7233`) | Binds to local loopback `127.0.0.1:7233` |
| **Telemetry Provider** | `PROMETHEUS_URL` | Scrapes live production Prometheus metrics (`http://prometheus:9090`) | Simulates telemetry fixtures for checkout, payments, and inventory |
| **AI Investigation** | `OPENAI_API_KEY` / `GEMINI_API_KEY` | Calls live LLM API for dynamic root-cause hypothesis generation | Returns deterministic, rule-based hypothesis from incident telemetry |
| **Microservice Targets** | `CHECKOUT_URL`, `PAYMENTS_URL` | Dispatches remediation RPCs to live Kubernetes microservices | Dispatches to bundled Express simulation endpoints |

---

## 👨‍💻 Author
**Sumit Dalavi** — Senior DevSecOps / Platform Engineer  
[GitHub](https://github.com/SumitDalavi) | [LinkedIn](https://in.linkedin.com/in/sumit-dalavi-762838129)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE). Copyright (c) 2026 Sumit Dalavi.