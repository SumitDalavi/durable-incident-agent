# Durable Incident Agent

[![CI Pipeline](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SumitDalavi/durable-incident-agent?color=0969da&label=release&logo=github)](https://github.com/SumitDalavi/durable-incident-agent/releases)
[![Release Workflow](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/release.yml/badge.svg)](https://github.com/SumitDalavi/durable-incident-agent/actions/workflows/release.yml)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%202.3-blueviolet?logo=spdx)](https://github.com/SumitDalavi/durable-incident-agent/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Autonomous incident response agent built on durable execution primitives, executing multi-step remediation workflows with human-in-the-loop approval gates and sustained post-mitigation telemetry verification.

---

## Key Capabilities & Architectural Highlights
- **Durable**: state-machine workflow orchestrating fault triage, evidence collection, and approval-gated mitigation
- **Temporal**: worker crash resilience ensuring recovery without duplicate actions
- **Sustained**: 3-minute post-mitigation cooldown window tracking p95 latency and error rate stability
- **Full**: OCI container distribution via GitHub Container Registry (GHCR)

## Technology Stack
- **Languages & Frameworks:** TypeScript, Node.js 22, Temporal SDK, Prometheus, OpenTelemetry, Docker
- **Container Registry:** `ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0`
- **License:** MIT Open Source

---

## Documentation Index
- [Architecture Specification](docs/ARCHITECTURE.md) — Detailed system diagrams, state machines, and design contracts.
- [Production Runbook](docs/RUNBOOK.md) — Deployment instructions, configuration options, and operations.
- [Demo Script & Walkthrough](docs/DEMO_SCRIPT.md) — Step-by-step verification scenario.
- [Changelog](CHANGELOG.md) — Full release notes and version history.

---

## Quickstart & Installation

### Option 1: Run with Docker Container (GHCR)
```bash
docker pull ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0
docker compose up -d
npm run start --workspace=agent
```

### Option 3: Local Developer Setup
```bash
git clone https://github.com/SumitDalavi/durable-incident-agent.git
cd durable-incident-agent
make setup
make test
```

---

## Release & Security Verification

This repository adheres to the Portfolio Release Standard with verifiable supply-chain security attestations:

- **Distribution Archive:** `durable-incident-agent-v0.2.0.tar.gz`
- **SHA-256 Digest:** `f4d9bdc99444bee715c6f2192e8174f64c311b95a3025a439b777eb580ed00ac`
- **Software Bill of Materials (SBOM):** Anchore SPDX 2.3 JSON specification (`sbom.spdx.json`).

### Verification Commands
```bash
# 1. Download Release Bundle & Checksums
gh release download v0.2.0 --repo SumitDalavi/durable-incident-agent --pattern "*.tar.gz" --pattern "checksums.txt"

# 2. Verify Cryptographic Integrity
sha256sum -c checksums.txt

# 3. Inspect SPDX SBOM
gh release download v0.2.0 --repo SumitDalavi/durable-incident-agent --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .spdxVersion
```

---

## License
MIT License. Copyright (c) 2026 Sumit Dalavi.
