# Release Checklist

Complete before any public release. Each item must be verified, not assumed.

## Fresh-clone verification
- [ ] Clone the repository to a new directory
- [ ] Run `make setup && make dev && make test && make e2e`
- [ ] All commands succeed without manual intervention
- [ ] Demo scenario runs end-to-end: `make demo`

## Demo verification
- [ ] Demo script in `docs/DEMO_SCRIPT.md` matches actual behavior
- [ ] All REPLAY-labelled outputs are clearly marked in the UI
- [ ] Backend labels (container/microvm, live/mock) are visible
- [ ] Screenshots/recordings match the current UI

## Documentation
- [ ] README capability table updated honestly (Implemented / Simulated / Planned)
- [ ] All `docs/*.md` files reflect current implementation
- [ ] No unmeasured performance numbers anywhere
- [ ] Limitations section is complete and honest

## Licensing
- [ ] Project license chosen and documented in `LICENSE_DECISION.md`
- [ ] All dependency licenses reviewed and compatible
- [ ] Model weights / datasets / voice assets: redistribution constraints documented
- [ ] Attribution obligations listed

## Evidence review
- [ ] Every claim in README traces to a test or evidence artifact
- [ ] `results/` directory contains actual evaluation outputs (not hand-edited)
- [ ] Evaluation metadata includes: commit SHA, date, hardware, model versions

## Security
- [ ] No secrets committed (gitleaks passes)
- [ ] No public unauthenticated endpoints exposing sensitive data
- [ ] Threat model reviewed against current implementation

## Final sign-off
- [ ] Owner has reviewed all of the above
- [ ] Publication requires separate consent (this checklist alone does not authorize it)
