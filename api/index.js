const express = require('express');
const { Connection, Client } = require('@temporalio/client');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
  }
  const token = authHeader.split(' ')[1];
  const expectedToken = process.env.API_TOKEN || 'valid-token';
  if (token !== expectedToken) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
  req.user = 'authenticated-operator';
  next();
};

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

app.post('/api/incidents/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { approved, proposalHash } = req.body;
    if (proposalHash === undefined) {
      return res.status(400).json({ error: 'proposalHash is required' });
    }
    const handle = client.workflow.getHandle(req.params.id);
    await handle.signal('approveAction', { approved, proposalHash, approver: req.user });
    res.json({ status: 'signalled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/incidents/:id/proposal', async (req, res) => {
  try {
    const handle = client.workflow.getHandle(req.params.id);
    const proposal = await handle.query('getProposal');
    res.json(proposal || { status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/incidents/:id/status', async (req, res) => {
  try {
    const handle = client.workflow.getHandle(req.params.id);
    const desc = await handle.describe();
    res.json({ status: desc.status.name });
  } catch (err) {
    res.json({ status: 'UNKNOWN' });
  }
});

app.get('/api/incidents/:id/result', async (req, res) => {
  try {
    const handle = client.workflow.getHandle(req.params.id);
    const result = await handle.result();
    res.json(result || { status: 'UNKNOWN' });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(4000, () => console.log('API running on port 4000'));
