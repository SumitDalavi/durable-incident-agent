const express = require('express');
const { Connection, Client } = require('@temporalio/client');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let client;
async function setupTemporal() {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  client = new Client({ connection });
}
setupTemporal().catch(console.error);

app.post('/api/incidents', async (req, res) => {
  const { incidentId, serviceUrl } = req.body;
  try {
    const handle = await client.workflow.start('incidentResponseWorkflow', {
      args: [incidentId, serviceUrl],
      taskQueue: 'incident-tasks',
      workflowId: "incident-" + incidentId,
    });
    res.json({ workflowId: handle.workflowId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents/:id/approve', async (req, res) => {
  try {
    const { approved, proposalHash } = req.body;
    if (proposalHash === undefined) {
      return res.status(400).json({ error: 'proposalHash is required' });
    }
    const handle = client.workflow.getHandle(req.params.id);
    await handle.signal('approveAction', { approved, proposalHash });
    res.json({ status: 'signalled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log('API running on port 4000'));
