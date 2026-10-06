# v2 changelog and limitations

## Corrected from the conversation's v1 plans
- Shared material is at each project's `shared/`; references use one consistent location.
- A2A work packages use MSH, never A2A.
- CI is a documentation-validation template, not a claimed working application pipeline.
- Activity delivery/retry guarantees are separated from safe, reconciled business effects.
- Network policy covers SSRF, redirects, address validation, and explicit HTTPS inspection limits.
- Streaming chunks are not equated with tokens; single-token TPOT is undefined.
- Standalone fixture paths and later cross-project integrations are both explicit.
- Delegation requires preflight, evidence, handoffs, and change control.
- Cloud spending, GitHub writes, deployment, publishing, and destructive actions require explicit approval.

## Added
Per-project execution masters, machine-readable package registries, per-package progress templates, traceability, feasibility gates, runbooks, release checks, draft contracts with examples, standard-library consistency validator, optional JSON Schema validation, and negative test checklists.

## Not provided or claimed
Application code; tested service configurations; a working distributed platform; pinned third-party dependencies; a definitive protocol version; installed provider access; a working GPU benchmark. Template and draft labels are deliberate.
