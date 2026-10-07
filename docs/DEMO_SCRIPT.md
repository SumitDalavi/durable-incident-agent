# Demo Script

1. **Start the Stack**: Run `make dev` in the root.
2. **Open UIs**: 
   - DIA Dashboard: Open `ui/public/index.html` in your browser.
   - Grafana: http://localhost:3000
3. **Inject Fault**: On the DIA Dashboard, click "Inject Error Spike".
4. **Verify Impact**: Check the Grafana dashboard to see error rates climb in the `checkout` service.
5. **Start Investigation**: Click "Investigate Incident". Note the Workflow ID.
6. **(Optional) Crash Worker**: If you want to demonstrate durability, kill the `make dev` terminal during the investigation phase, then restart it. The workflow will resume.
7. **Approve Action**: The UI will prompt with an Action Proposal hash. Click "Approve & Execute".
8. **Resolution**: Watch the telemetry in Grafana return to normal as the agent remediates the service.
