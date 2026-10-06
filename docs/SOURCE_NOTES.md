# Source notes and implementation verification

This kit derives from the user's project-planning conversation. Links below are public technical references, not evidence that the implementation exists. Verify current content, versions, licenses, and feature availability at preflight. Record the date and chosen release in each project's decisions document.

- Temporal activity definition: https://docs.temporal.io/activity-definition — retries, idempotency, activities.
- OWASP SSRF prevention: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html — redirects, destination validation, DNS/address risks.
- Firecracker repository: https://github.com/firecracker-microvm/firecracker — host prerequisites, jailer, snapshots.
- A2A official specification: https://a2a-protocol.org/latest/specification/ — pin a real supported version; never implement from model memory.
- vLLM metrics: https://docs.vllm.ai/en/stable/design/metrics/ — names vary by release.
- vLLM benchmark tool: https://docs.vllm.ai/en/latest/api/vllm/benchmarks/serve/ — verify CLI and metric semantics.
- TypeSafe documentation: https://docs.typesafe.ai/introduction — optional decision-provider API and availability.

No exact performance number or provider benchmark is adopted as a project result.
