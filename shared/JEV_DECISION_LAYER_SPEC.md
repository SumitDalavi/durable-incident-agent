# Optional Decision Layer: Jev Adapter Spec

Applies to projects 1, 2, and (optionally) 3 and 4. **Optional and swappable.** Never a hard dependency.

## Purpose

Provide fast, typed, probabilistic judgments (risk, severity, routing, retryability) as one signal feeding the application's policy. A decision model adds a signal; it does not hold authority.

## Interface

```ts
type Noul   = { kind: "noul";   question: string };
type Choice = { kind: "choice"; question: string; options: string[] };
type Score  = { kind: "score";  question: string; levels: string[] };   // ordered low -> high

interface DecisionRequest {
  state: string | object;                    // context to assess
  questions: Record<string, Noul | Choice | Score>;
}
interface DecisionAnswer {
  kind: "noul" | "choice" | "score";
  probability?: number;                      // noul
  selected?: string;                         // choice
  distribution?: Record<string, number>;    // choice / score
  score?: number;                           // score
  confidence?: number;
}
interface DecisionProvider {
  name: string;
  evaluate(req: DecisionRequest, ctx: { runId: string }): Promise<Record<string, DecisionAnswer>>;
}
```

Verify the exact request/response field names against the provider's current API reference at implementation time; the shapes above are a neutral internal contract, and an adapter translates to the provider's wire format.

## Providers to implement

| Provider | Purpose |
|---|---|
| `JevProvider` | Calls the TypeSafe API. Endpoint, model identifier, and auth come from env vars. |
| `LlmStructuredProvider` | Same interface using an LLM with schema-constrained output (baseline for comparison) |
| `RulesProvider` | Deterministic heuristics (keyword/regex/threshold) baseline |
| `ReplayProvider` | Reads recorded answers for deterministic tests |

## Rules

1. Hard controls (allowlists, permissions, resource limits, mandatory approvals) are enforced by code and never overridden by a decision answer.
2. Decision answers can only **tighten** control by default (e.g., escalate to human review). Any path where a decision answer relaxes a control requires an ADR and a test proving the hard control still holds.
3. Thresholds live in config, versioned, and are logged with every decision.
4. A schema-valid, confident answer is not necessarily correct. Track false negatives for risky cases in evaluation.
5. Log every decision call: `run_id`, provider, questions, answers, latency, cost estimate. Redact sensitive state.
6. Provider failure must degrade to the stricter path (escalate to human or deny), never to allow.
7. Respect documented input limits (text/JSON only; check current context limits) by truncating state deterministically and recording that truncation occurred.

## Env vars

```text
DECISION_PROVIDER=rules|llm|jev|replay
JEV_API_BASE=...            # from provider docs
JEV_API_KEY=...             # never committed
JEV_MODEL=...               # from provider docs
DECISION_ESCALATE_ABOVE=0.5 # example threshold, tune via evaluation
```

## Decision Layer Benchmark (shared eval)

Build once in project 1, reuse in 2.

- Dataset: 50-100 labeled cases in `scenarios/decision-cases/*.json`, with `expected` labels and `severity_of_error` weights.
- Include ambiguous, contradictory, and adversarial (prompt-injection-in-state) cases.
- Compare providers: rules, LLM-structured, Jev.
- Metrics: accuracy, false-negative rate on risky cases, escalation rate, abstention rate, latency p50/p95, cost per 1k decisions.
- Output: `results/decision-benchmark/<date>-<sha>.json` plus a rendered Markdown table.
