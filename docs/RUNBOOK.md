# Runbook: durable-incident-agent

## Prerequisites
- Docker & Docker Compose
- Node.js (v22+) or Python (3.12+) depending on the project
- `make` utility

## Setup
1. **Install dependencies:**
   ```bash
   make setup
   ```
2. **Start the local environment:**
   ```bash
   make dev
   ```

## Common Commands
- `make dev`: Starts the application and observability stack.
- `make test`: Runs the test suite.
- `make clean`: Removes node_modules, builds, and resets Docker volumes.

## Troubleshooting
**Port Conflicts (9090, 3000):**
If `make dev` fails due to bound ports, verify that no local Prometheus or Grafana instance is running. The `docker-compose.yml` can be modified to map to alternate host ports if necessary.

**Build Errors:**
Run `make clean && make setup` to completely clear the cache and reinstall dependencies from scratch.


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

## Phase 6: E2E Assurance & Metric Snapshots (Final Validation)
- **Sustained Recovery Window**: The `verifyRemediation` activity has been upgraded from making single point-in-time checks to asserting sustained metric stability over multiple consecutive observation windows, fully defeating false positives during transient service jitter.
- **Latency Assertions**: Alongside error ratio and traffic, recovery metrics now successfully assert `p95` latency boundaries.
- **Metric Snapshot Auditing**: Evidence snapshots (`evidenceIds`) are now durably chained through the workflow result, delivering high-fidelity historical context (telemetry snapshots) back to the caller instead of just a basic boolean status.
- **Telemetry Cooldowns & Rolling Windows**: The agent explicitly waits 20 seconds post-remediation to allow Prometheus rate rolling window queries to completely flush out stale synthetic fault data before executing the verification loop.
- **Cross-environment Networking**: Node microservices explicitly bind to 0.0.0.0 rather than 127.0.0.1 to ensure they are accessible to Prometheus running in a Docker container, specifically using host.docker.internal:host-gateway for full Linux CI compatibility.


## Production Operations & Release Runbook (v0.2.0 Update)

### 1. Production Deployment & Container Invocation (GHCR)
```bash
# Pull production image:
docker pull ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0

# Run containerized agent and API gateway:
docker run -d \
  --name durable-incident-agent \
  -p 4000:4000 \
  -e TEMPORAL_ADDRESS="temporal:7233" \
  -e PROMETHEUS_URL="http://prometheus:9090" \
  ghcr.io/sumitdalavi/durable-incident-agent:v0.2.0

# Verify service health:
curl -f http://localhost:4000/health
```

### 2. Live Incident Remediation Execution
```bash
# Trigger an incident remediation workflow:
curl -X POST http://localhost:4000/api/incident/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "service": "checkout",
    "faultType": "latency_spike",
    "thresholdP95Ms": 850
  }'

# Query workflow execution status:
curl http://localhost:4000/api/incident/status/<WORKFLOW_ID>

# Approve human-in-the-loop mitigation step:
curl -X POST http://localhost:4000/api/incident/approve/<WORKFLOW_ID> \
  -H "Content-Type: application/json" \
  -d '{"action": "PROCEED_WITH_ROLLBACK"}'
```

### 3. Release Integrity & Verification Runbook
To verify the authentic origin and file integrity of release packages:
```bash
# Download distribution package and checksums:
gh release download v0.2.0 --repo SumitDalavi/durable-incident-agent --pattern "*.tar.gz" --pattern "checksums.txt"

# Assert cryptographic match:
sha256sum -c checksums.txt

# Inspect SPDX 2.3 Software Bill of Materials:
gh release download v0.2.0 --repo SumitDalavi/durable-incident-agent --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .packages[0].name
```

### 4. Operational Failure Modes & Troubleshooting
- **Port Collisions:** If the host port is in use, remap using `-p <ALTERNATIVE_PORT>:<CONTAINER_PORT>`.
- **Docker Daemon Permissions:** For tools requiring container orchestrator control (`agent-sandbox-platform`), ensure `/var/run/docker.sock` has read/write permissions for the runner user.
- **GHCR Pull Authentication:** If pulling from GHCR encounters rate limits or private scope:
  ```bash
  echo "$GITHUB_TOKEN" | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin
  ```
