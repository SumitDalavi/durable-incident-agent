# Portfolio Sequencing and Reuse

## Dependency graph

```text
shared/contracts (incident schema, event schema, approval schema)
   |
   +--> 02 durable-incident-agent ----+--> 03 a2a-incident-mesh
   |            |                      |
   |            +----------------------+--> 04 voice-incident-commander
   |
   +--> 01 agent-sandbox-platform  (independent core; optional integration with 02: run remediation inside the sandbox)

05 inference-performance-lab (independent; optional: serve the model used by 02/03/04)
```

## Reusable assets across projects

| Asset | Produced in | Reused in |
|---|---|---|
| Broken-service scenarios (`scenarios/checkout-*`) | 01 | 02, 03, 04 |
| Incident schema + approval schema | 02 | 03, 04 |
| Decision provider interface + benchmark | 01 | 02 (3 optional) |
| Telemetry fixtures (logs/metrics/traces) | 02 | 03, 04 |
| Model provider with live/replay/mock | 01 | all |
| Evaluation result format | 01 | all |

## Suggested schedule (effort units, not calendar promises)

| Order | Project | Rough MVP size |
|---|---|---|
| 1 | 02 durable incident agent | M |
| 2 | 01 agent sandbox platform | L |
| 3 | 03 A2A mesh | M |
| 4 | 04 voice commander | S-M |
| 5 | 05 inference lab | L (gated by GPU access) |

Run 01 and 02 in parallel with separate agents once `contracts/` exists. Resist starting 03 and 04 before 02 has a stable API.

## Portfolio presentation

- One landing page section "AI Platform Engineering" with five cards, each linking to repo, demo video, and "What is real vs simulated".
- A short "Lessons and limitations" post per project (what failed, what you would change).
- Pin 01 and 02 on your GitHub profile first.

## Overlap check against existing repos

Before starting, confirm the new repos add something beyond your existing `ai-devsecops-agent-mcp`, `ai-control-plane-demo`, `llm-gateway-observability`, `agent-orchestration-system`, and `secret-sprawl-remediation-bot`. The new projects should center on **execution isolation, durability, interoperability, real-time interaction, and measured inference performance**. Reuse your gateway/observability components by dependency or documented integration; do not duplicate them.
