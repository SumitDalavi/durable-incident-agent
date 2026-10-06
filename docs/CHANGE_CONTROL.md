# Change Control

## Purpose
Define how agents handle contradictions, proposed scope changes, interface changes, and security exceptions.

## Contradiction resolution
1. If two documents disagree, the **higher-authority document** wins:
   - `AGENTS.md` > `docs/ARCHITECTURE.md` > `docs/WORK_PACKAGES.md` for behavioral rules.
   - Official external specs (A2A, Temporal, vLLM docs) > this repository's docs for API shapes.
2. Record the contradiction and resolution in `docs/progress/<WP-ID>/PLAN.md`.
3. If the contradiction involves a security control, HOLD and escalate to the owner.

## Scope changes
1. An agent may NOT expand the scope of a work package beyond its documented acceptance criteria.
2. If a package cannot be completed without scope expansion, the agent must:
   - Document the proposed change in the handoff.
   - Set the package status to HOLD.
   - Wait for owner approval before proceeding.

## Interface changes
1. Shared contracts (`contracts/` schemas) require coordinated updates.
2. When a contract changes, the agent must update ALL of:
   - JSON Schema / OpenAPI / proto files
   - Tests that validate the contract
   - Example payloads
   - Architecture docs referencing the contract
   - Traceability matrix
   - All consuming packages' docs
3. A consumer must not unilaterally change a shared interface.

## Security exceptions
1. No agent may self-approve a security exception.
2. Security exceptions require:
   - Written justification in `docs/progress/<WP-ID>/PLAN.md`.
   - Explicit owner approval recorded in the handoff.
   - A compensating control or acceptance of residual risk documented.
3. Weakening a test to make it pass is NEVER acceptable.

## Cost and external action approval
Creating repositories, opening PRs, deploying cloud resources, publishing releases, purchasing GPU time, or spending money requires separate, explicit authorization. A work-package assignment does not silently authorize these.
