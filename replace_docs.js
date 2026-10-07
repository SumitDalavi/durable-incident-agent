const fs = require('fs');

const replacement = `## Phase 5.1 Update: Real Integration & CI Stabilization
- **Finite-Value Validation**: Implemented strict validation rejecting \`NaN\`, \`Infinity\`, and negative metrics as inconclusive to ensure strict data reliability.
- **Real Integration Verification**: Added \`test-real.js\` to demonstrate true E2E integration with live Docker containers (Temporal, PostgreSQL, Prometheus) and functional microservices injected with real fault spikes.
- **CI Stabilization**:
  - Bound Temporal explicitly to IPv4 (\`127.0.0.1\`) to resolve GitHub Actions IPv6 \`ECONNREFUSED\` issues.
  - Replaced hardcoded sleep intervals with deterministic \`/health\` endpoint polling on the Express API to guarantee Temporal connectivity before executing E2E faults.
  - Re-introduced a dedicated PostgreSQL database container as Temporal's \`auto-setup\` script does not natively support SQLite for default persistence, ensuring reliable boot-up in headless CI runners.
`;

const targetPattern = /## Phase 5\.1 Update: Real Integration & Finite-Value Validation[\s\S]*?microservices injected with real fault spikes\./;

['docs/ARCHITECTURE.md', 'docs/RUNBOOK.md'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(targetPattern, replacement.trim());
  fs.writeFileSync(file, content);
});

console.log("Replaced successfully!");
