# Changelog

All notable changes to this project are documented in this file, adhering to the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) specification and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-22

### Added
- **Release Catalog & Multi-Registry Distribution:** Configured automated GitHub Actions release packaging generating distribution bundles (`durable-incident-agent-v0.2.0.tar.gz`).
- **Container Registry Packaging (GHCR):** Added production multi-stage `Dockerfile` and automated publication to GitHub Container Registry (`ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0`).
- **Software Bill of Materials (SBOM):** Generated Anchore SPDX 2.3 JSON specification (`sbom.spdx.json`) for software supply chain transparency.
- **Cryptographic Verification:** Published SHA-256 integrity hash digests (`checksums.txt`) for all release artifacts.
- **GitHub Linguist Override:** Added `.gitattributes` to exclude helper mock services and classify TypeScript as primary.
- **Sustained Cooldown Observation:** Enforced multi-minute p95 latency and error-rate verification before incident resolution.

### Changed
- Standardized package versions to `0.2.0`.
- Hardened CI/CD workflows and container build boundaries.

## [0.1.0] - 2026-10-21

### Added
- Initial baseline service implementation, unit test suites, and Makefile build targets (`make setup`, `make test`).
- Core architectural documentation (`docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `docs/DEMO_SCRIPT.md`).
- GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
