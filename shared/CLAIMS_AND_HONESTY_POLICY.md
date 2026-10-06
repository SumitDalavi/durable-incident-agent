# Claims and Honesty Policy

This policy applies to every README, resume bullet, demo video, and portfolio page derived from these projects.

## Rules

1. **Label every capability** as one of: `Implemented`, `Simulated`, `Planned`.
2. **No unmeasured numbers.** Speedups, success rates, latency, and cost figures come only from `results/` artifacts produced by the evaluation harness, with commit SHA, date, hardware, and model/version.
3. **Isolation honesty.** A container is not a microVM. Name the backend actually used in each demo run.
4. **Live vs replay.** Any demo using recorded model output must display a visible "REPLAY" badge.
5. **Model output is untrusted.** Documentation must never imply that a model, including a decision model, guarantees safety.
6. **Vendor numbers are vendor numbers.** If you cite a third party's benchmark, name the source and say it is vendor-reported.
7. **Not production.** Each README states: personal portfolio project, not deployed in production, not security-audited.

## Resume wording template

> Built [project], a [one-line description] (TypeScript/Go/Python). Demonstrates [specific capability]. Evaluated on [N] scenarios; results and limitations documented in the repository. Personal project; not production-deployed.

Fill brackets only with facts verifiable in the repository.
