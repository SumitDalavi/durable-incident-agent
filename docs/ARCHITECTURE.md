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
