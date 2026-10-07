const { spawn, execSync } = require('child_process');
const http = require('http');

async function runRealIntegration() {
  console.log("Starting Real Integration Test...");
  try {
    execSync('docker info', { stdio: 'ignore' });
  } catch (e) {
    console.log("Docker is not available or not running. Skipping real integration test. CI will run this.");
    process.exit(0);
  }
  
  console.log("Bringing up docker containers...");
  execSync('docker compose up -d temporal prometheus', { stdio: 'inherit' });
  
  // Wait for temporal to be ready
  console.log("Waiting for Temporal to be ready (10s)...");
  await new Promise(r => setTimeout(r, 10000));

  console.log("Starting Microservices...");
  const checkout = spawn('npm', ['run', 'start', '--workspace=services/checkout'], { shell: true });
  const payments = spawn('npm', ['run', 'start', '--workspace=services/payments'], { shell: true });
  const inventory = spawn('npm', ['run', 'start', '--workspace=services/inventory'], { shell: true });
  
  console.log("Starting API and Agent...");
  const api = spawn('npm', ['run', 'start', '--workspace=api'], { shell: true });
  const agent = spawn('npm', ['run', 'start', '--workspace=agent'], { shell: true });

  const cleanup = () => {
    console.log("Cleaning up processes...");
    checkout.kill();
    payments.kill();
    inventory.kill();
    api.kill();
    agent.kill();
    execSync('docker compose down', { stdio: 'inherit' });
  };

  try {
    console.log("Waiting for services to spin up (10s)...");
    await new Promise(r => setTimeout(r, 10000));

    // Inject fault into checkout
    console.log("Injecting fault into Checkout service...");
    await new Promise((resolve, reject) => {
       const req = http.request({ hostname: '127.0.0.1', port: 5001, path: '/fault/spike-errors', method: 'POST' }, (res) => {
         if (res.statusCode === 200) resolve();
         else reject(new Error("Failed to inject fault"));
       });
       req.on('error', reject);
       req.end();
    });

    console.log("Triggering Incident via API...");
    const incidentRes = await new Promise((resolve, reject) => {
       const req = http.request({ hostname: '127.0.0.1', port: 4000, path: '/api/incidents', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer valid-token' } }, (res) => {
         let data = '';
         res.on('data', chunk => data += chunk);
         res.on('end', () => resolve(JSON.parse(data)));
       });
       req.on('error', reject);
       req.write(JSON.stringify({ incidentId: 'INC-REAL-1', serviceUrl: 'http://127.0.0.1:5001' }));
       req.end();
    });

    console.log("Incident triggered:", incidentRes);
    const incidentId = 'INC-REAL-1';
    const workflowId = incidentRes.workflowId;

    if (!workflowId) throw new Error("No workflowId returned from API");

    // Wait for agent to generate proposal
    console.log("Waiting for proposal (15s)...");
    await new Promise(r => setTimeout(r, 15000));

    // Fetch proposal
    console.log("Fetching proposal...");
    const proposalRes = await new Promise((resolve, reject) => {
       const req = http.request({ hostname: '127.0.0.1', port: 4000, path: `/api/incidents/${workflowId}/proposal`, method: 'GET', headers: { 'Authorization': 'Bearer valid-token' } }, (res) => {
         let data = '';
         res.on('data', chunk => data += chunk);
         res.on('end', () => resolve(JSON.parse(data)));
       });
       req.on('error', reject);
       req.end();
    });
    console.log("Proposal:", proposalRes);
    const hash = proposalRes.proposalHash;
    if (!hash) throw new Error("Failed to get proposalHash");

    console.log("Approving incident action...");
    await new Promise((resolve, reject) => {
       const req = http.request({ hostname: '127.0.0.1', port: 4000, path: `/api/incidents/${workflowId}/approve`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer valid-token' } }, (res) => {
         if (res.statusCode === 200) resolve();
         else reject(new Error(`Failed to approve: ${res.statusCode}`));
       });
       req.on('error', reject);
       req.write(JSON.stringify({ approved: true, proposalHash: hash }));
       req.end();
    });

    console.log("Waiting for remediation to complete (20s)...");
    await new Promise(r => setTimeout(r, 20000));

    console.log("✅ Real Integration Test Passed!");
    cleanup();
  } catch(err) {
    console.error("❌ Real Integration Test Failed:", err);
    cleanup();
    process.exit(1);
  }
}

runRealIntegration();
