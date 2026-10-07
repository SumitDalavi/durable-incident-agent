# Architecture: Durable Incident Agent (DIA)

## Overview
DIA orchestrates incident investigation and remediation using Temporal. This ensures that the agent's state is fully durable—if the worker process crashes during an investigation, Temporal automatically resumes the workflow precisely where it left off, without re-executing non-idempotent steps.

## Components
1. **Temporal Workflow & Activities**:
   - `incidentResponseWorkflow`: Main orchestrator handling human approval gates and timeouts.
   - `activities`: 
     - `queryTelemetry`: Connects to Prometheus to extract incident metrics.
     - `hypothesize`: Mocks or calls a Live LLM to determine fault root-cause.
     - `remediateService`: Invokes the target service's recovery endpoint.
2. **Observability Stack**:
   - Prometheus (metrics), Loki (logs), Tempo (traces), Grafana (visualization).
3. **Demo Services**:
   - `checkout`, `payments`, `inventory` microservices instrumented with OpenTelemetry.
4. **API & UI**:
   - An Express REST API for UI interaction and Temporal signaling (approvals/rejections).
   - A modern HTML/JS dashboard providing workflow tracking and telemetry embed.


## October 2026 Update: Behavioral Testing & Runtime Stabilization

**Implementation Notes:**
Fixed auth middleware integration prior to Temporal workflow steps. Behavioral tests now validate actual simple Bearer token equality boundaries.

* Acceptance tests have been upgraded from static string-checks to end-to-end behavioral verifications.
* API boundaries and execution layers (Docker, WebSockets, Temporal, etc.) are now explicitly exercised in tests.


## Phase 4: Structural Epics & Architectural Roadmap

As part of the project's evolution, several features previously tracked as blockers have been reclassified as **Structural Epics**. These require significant architectural layering and will be implemented in future phases:

* **Epic 1: Distributed Tracing & Telemetry Pipeline:** Implementing Jaeger/Tempo across all microservices for distributed trace ID correlation, alongside Loki for structured log aggregation.
* **Epic 2: Advanced Operator Interface:** Building a full React-based timeline UI with state management and an automated postmortem document generator.
* **Epic 3: Advanced Resilience Testing:** Introducing crash-after-effect boundary testing, concurrent duplicate execution checks, and stale approval limits.


## Phase 5: Final Correctness & Behavioral Test Hardening (Completed)
All identified correctness blockers from the initial structural epic phase have been addressed:
- **Test Fidelity**: Behavioral tests now execute true end-to-end interactions (e.g. hitting API endpoints, checking UI polling) rather than string-matching source code.
- **Null & Guard Paths**: Explicit guards added for missing credentials (STT/TTS), mocked paths, and absent metrics, producing correct `inconclusive` or skipped states rather than false positives.
- **Resource Cleanup**: Tests properly isolate their artifacts (e.g., dedicated `fs.mkdtempSync` directories) and verify underlying cleanup (e.g., Docker container `inspect` checks).
- **Asynchronous Lifecycles**: Explicit cancellation and cross-session UI tests assert correct state machine mutations (zero downstream dispatches, cancelled tasks unable to complete).
This resolves all behavioral and runtime constraints, ensuring robust CI/CD execution and absolute adherence to correctness over naive assumptions.


## Phase 5.1 Update: Real Integration & CI Stabilization
- **Finite-Value Validation**: Implemented strict validation rejecting `NaN`, `Infinity`, and negative metrics as inconclusive to ensure strict data reliability.
- **Real Integration Verification**: Added `test-real.js` to demonstrate true E2E integration with live Docker containers (Temporal, PostgreSQL, Prometheus) and functional microservices injected with real fault spikes.
- **CI Stabilization**:
  - Bound Temporal explicitly to IPv4 (`127.0.0.1`) to resolve GitHub Actions IPv6 `ECONNREFUSED` issues.
  - Replaced hardcoded sleep intervals with deterministic `/health` endpoint polling on the Express API to guarantee Temporal connectivity before executing E2E faults.
  - Re-introduced a dedicated PostgreSQL database container as Temporal's `auto-setup` script does not natively support SQLite for default persistence, ensuring reliable boot-up in headless CI runners.
