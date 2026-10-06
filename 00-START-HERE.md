# Portfolio AI Projects: Delegation Kit

Five projects, each in its own folder, each ready to hand to a coding agent (Claude Code, Codex, Antigravity, Copilot).

| # | Folder | One-line goal | Effort (MVP) | Needs GPU |
|---|---|---|---|---|
| 1 | `01-agent-sandbox-platform` | An agent fixes a broken service inside an isolated sandbox with policy, approval, and evidence | High | No |
| 2 | `02-durable-incident-agent` | An incident agent that survives a worker crash mid-run and resumes, with approval gates | Medium-high | No |
| 3 | `03-a2a-incident-mesh` | Independent SRE, security, and release agents collaborating over the A2A protocol | Medium-high | No |
| 4 | `04-voice-incident-commander` | Voice interface (interruptible) over an incident backend with explicit approval UI | Medium | No |
| 5 | `05-inference-performance-lab` | Reproducible vLLM serving benchmarks with Prometheus/Grafana and a findings report | High | Yes (or rented) |

## Recommended build order

1. `02-durable-incident-agent` first if you want the fastest credible win. Its incident scenario, telemetry fixtures, and approval flow are reused by projects 3 and 4.
2. `01-agent-sandbox-platform` as the flagship. Start in parallel once the shared `contracts/` package exists.
3. `03-a2a-incident-mesh` reuses the incident scenario and agents from project 2.
4. `04-voice-incident-commander` is a thin client over project 2's API (or project 3's gateway).
5. `05-inference-performance-lab` is independent; schedule it when GPU access is available.

See `PORTFOLIO_SEQUENCING.md` for the dependency graph and sharing strategy.

## How to use this kit

1. Create one GitHub repo per project folder (names match folder slugs without the number prefix).
2. Copy the folder contents to the repo root.
3. Copy `shared/` files you need into each repo's `docs/shared/`.
4. Give the agent the prompt in `shared/AGENT_PROMPT_TEMPLATES.md` plus one work package ID from `docs/WORK_PACKAGES.md`.
5. Review each work package's pull request against its acceptance criteria. Do not merge anything that fails the gates in `shared/DEFINITION_OF_DONE.md`.

## Files in every project

| File | Purpose |
|---|---|
| `README.md` | Public-facing README skeleton with truthful status table |
| `AGENTS.md` | Standing instructions for any coding agent |
| `docs/ARCHITECTURE.md` | Components, data flows, interfaces, schemas |
| `docs/IMPLEMENTATION_PLAN.md` | Phased plan with milestones and exit criteria |
| `docs/WORK_PACKAGES.md` | Delegatable tasks: dependencies, files, acceptance tests |
| `docs/THREAT_MODEL.md` (or `RISKS.md`) | Trust boundaries, threats, mitigations, residual risk |
| `docs/EVALUATION.md` | What to measure, how, and what not to claim |
| `docs/DEMO_SCRIPT.md` | Scripted walkthrough and recording checklist |
| `docs/DECISIONS.md` | Architecture decision records, with alternatives |
| `.env.example` | Environment variable contract (no secrets) |
| `.github/workflows/ci.yml` | CI skeleton |

## Status honesty rule

Everything in these plans is a proposed design. No performance number, security guarantee, or success rate appears in any plan because none has been measured. Agents must fill in measured results only after running the evaluation harness.
