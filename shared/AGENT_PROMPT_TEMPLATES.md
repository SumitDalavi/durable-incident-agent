# Agent Prompt Templates

Paste one of these into Claude Code / Codex / Antigravity / Copilot agent mode, replacing bracketed values.

## 1. Implement one work package

```text
You are working in the repository [REPO]. Read, in this order:
1. AGENTS.md
2. docs/ARCHITECTURE.md
3. docs/IMPLEMENTATION_PLAN.md (the phase containing [WP-ID])
4. docs/WORK_PACKAGES.md entry [WP-ID]
5. shared/DEFINITION_OF_DONE.md and shared/CLAIMS_AND_HONESTY_POLICY.md

Task: implement work package [WP-ID] only. Do not start other work packages.
Before coding: write a short plan listing files you will create or change and any assumption.
If something in the docs is ambiguous or contradictory, stop and list questions rather than guessing.
While coding: add tests first or alongside; keep commits small and conventional.
When finished: run `make lint test` (and `make e2e` if the work package says so), then produce a PR description with: summary, how to verify, acceptance criteria checklist, known limitations.
Never weaken a security control, hard-code model output, or add unmeasured performance claims.
```

## 2. Review a pull request against the plan

```text
Review the diff for [WP-ID] against docs/WORK_PACKAGES.md acceptance criteria, docs/ARCHITECTURE.md interfaces, and docs/THREAT_MODEL.md.
Report: (a) criteria met / not met with evidence, (b) interface drift, (c) security regressions, (d) untested failure paths, (e) honesty-policy violations.
Do not rewrite code; list required changes ordered by severity.
```

## 3. Verify a version choice

```text
For each dependency listed in docs/DECISIONS.md under "Versions to confirm", look up the current stable release and license from official sources, record the chosen version, date checked, and any breaking-change notes, and update docs/DECISIONS.md. Do not change code.
```

## 4. Write the demo assets

```text
Follow docs/DEMO_SCRIPT.md. Produce: a reset script, seed data, a 3-minute scripted walkthrough that runs against the real stack, screenshots listed in the script, and a README "Demo" section. Label any replayed model output as REPLAY.
```

## 5. Evaluation run

```text
Run `make eval` per docs/EVALUATION.md. Save raw outputs to results/ with metadata (commit SHA, date, hardware, versions, model identifiers, mode). Generate the Markdown summary. Report failures honestly, including runs that failed or timed out. Do not edit numbers by hand.
```

## Tips for the human delegating

- One work package per agent session; start a fresh session per package.
- Keep agent-written Markdown walkthroughs (`docs/progress/<WP-ID>.md`) so another agent can continue if one hits quota.
- Merge in dependency order shown in each `WORK_PACKAGES.md`.
