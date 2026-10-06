# Shared Conventions

## Repository layout (default; each project overrides where noted)

```text
.
|- README.md
|- AGENTS.md
|- Makefile
|- .env.example
|- docs/
|- contracts/           # JSON Schema / OpenAPI / proto shared between services
|- services/<name>/     # one directory per deployable
|- apps/<name>/         # UIs
|- scenarios/           # fixtures and fault-injection scenarios
|- results/             # evaluation outputs (committed, with metadata)
|- deploy/              # compose files, k8s manifests, terraform
`- .github/workflows/
```

## Languages and tooling

| Concern | Default |
|---|---|
| API / UI | TypeScript (Node 22+), Fastify or Hono, React + Vite for UI |
| Systems / lifecycle services | Go 1.23+ |
| Eval / data scripts | Python 3.12+, `uv` for dependency management |
| Schemas | JSON Schema (draft 2020-12), validated in CI |
| Lint/format | `eslint` + `prettier`, `golangci-lint`, `ruff` |
| Tests | `vitest`, `go test`, `pytest` |
| Containers | Docker, `docker compose` for local dev |
| Observability | OpenTelemetry SDKs, OTLP to a local collector, Prometheus + Grafana, Jaeger or Tempo |
| Secrets | Environment variables locally; never committed |

Version numbers above are floors to verify at project start. Agents should check current stable releases and record the chosen versions in `docs/DECISIONS.md`.

## Makefile contract (every repo exposes these targets)

| Target | Behavior |
|---|---|
| `make setup` | Install toolchains/deps |
| `make dev` | Start local stack |
| `make test` | Unit tests |
| `make e2e` | End-to-end tests against the local stack |
| `make lint` | Linters and formatters (check mode) |
| `make eval` | Run evaluation harness, write to `results/` |
| `make demo` | Reset state and start the scripted demo |
| `make clean` | Tear down and remove local state |

## Logging and tracing

- Structured JSON logs with fields: `ts`, `level`, `service`, `trace_id`, `span_id`, `run_id`, `msg`.
- Propagate W3C `traceparent` across HTTP and message boundaries.
- Redact: API keys, bearer tokens, anything matching the secret patterns in `contracts/redaction.json`.

## Commit and PR conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- One work package per PR. PR title starts with the work package ID, e.g. `SBX-03: policy engine`.
- Squash merge. Keep `main` releasable.

## Model provider abstraction

All LLM/decision-model calls go through a provider interface so the demo can run in `live`, `replay`, or `mock` mode:

```ts
interface ModelProvider {
  name: string;
  mode: "live" | "replay" | "mock";
  complete(req: CompletionRequest): Promise<CompletionResponse>;
}
```

`replay` reads recorded cassettes from `scenarios/cassettes/`. UIs must render a REPLAY badge when `mode !== "live"`.
