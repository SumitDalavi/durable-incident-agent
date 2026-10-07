const { spawn, execSync } = require('child_process');
const http = require('http');

async function runRealIntegration() {
  console.log("Starting Real Integration Test...");
  try {
    execSync('docker info', { stdio: 'ignore' });
  } catch (e) {
    console.log("⚠️ SKIPPED: Docker is unavailable. Integration suite aborted.");
    process.exit(0);
  }
  
  console.log("Bringing up docker containers...");
  execSync('docker compose up -d postgresql temporal prometheus', { stdio: 'inherit' });
  
  // Wait for temporal to be ready
  console.log("Waiting for Temporal to be ready (10s)...");
  await new Promise(r => setTimeout(r, 10000));

  console.log("Starting Microservices...");
  const checkout = spawn('node', ['index.js'], { cwd: 'services/checkout', stdio: 'inherit' });
  const payments = spawn('node', ['index.js'], { cwd: 'services/payments', stdio: 'inherit' });
  const inventory = spawn('node', ['index.js'], { cwd: 'services/inventory', stdio: 'inherit' });
  
  console.log("Starting API and Agent...");
  const api = spawn('node', ['index.js'], { cwd: 'api', stdio: 'inherit' });
  const agent = spawn('node', ['dist/worker.js'], { cwd: 'agent', stdio: 'inherit' });

  let cleanup = () => {
    console.log("Cleaning up processes...");
    checkout.kill();
    payments.kill();
    inventory.kill();
    api.kill();
    agent.kill();
    execSync('docker compose down', { stdio: 'inherit' });
  };

  try {
    console.log("Waiting for services and API to spin up...");
    for (let i = 0; i < 60; i++) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.request({ hostname: '127.0.0.1', port: 4000, path: '/health', method: 'GET' }, (res) => {
            if (res.statusCode === 200) resolve();
            else reject(new Error("Not 200"));
          });
          req.on('error', reject);
          req.end();
        });
        console.log("API is ready!");
        break;
      } catch (e) {
        if (i === 59) throw new Error("API failed to start in time");
        await new Promise(r => setTimeout(r, 2000));
      }
    }

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

    console.log("Starting background traffic generator...");
    const trafficInterval = setInterval(() => {
        const req = http.request({ hostname: '127.0.0.1', port: 5001, path: '/api/checkout', method: 'POST' });
        req.on('error', () => {});
        req.end();
    }, 200); // 5 requests per second
    
    // Make sure we stop the traffic generator in cleanup
    const originalCleanup = cleanup;
    cleanup = () => {
        clearInterval(trafficInterval);
        originalCleanup();
    };

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

    console.log("Fetching final result to verify sustained recovery...");
    const finalResult = await new Promise((resolve, reject) => {
       const req = http.request({ hostname: '127.0.0.1', port: 4000, path: `/api/incidents/${workflowId}/result`, method: 'GET', headers: { 'Authorization': 'Bearer valid-token' } }, (res) => {
         let data = '';
         res.on('data', chunk => data += chunk);
         res.on('end', () => resolve(JSON.parse(data)));
       });
       req.on('error', reject);
       req.end();
    });
    console.log("Final Result:", finalResult);
    
    if (finalResult.outcome !== 'recovered' || finalResult.verification !== 'success') {
      throw new Error(`Integration failed: final result was not successful recovery. Got ${JSON.stringify(finalResult)}`);
    }
    
    if (!finalResult.evidenceIds || finalResult.evidenceIds.length < 3) {
      throw new Error(`Integration failed: missing or insufficient metric snapshots (evidenceIds). Got ${JSON.stringify(finalResult.evidenceIds)}`);
    }

    console.log("✅ Real Integration Test Passed!");
    cleanup();
  } catch (err) {
    console.error("❌ Real Integration Test Failed:", err);
    try {
      console.log("----- TEMPORAL LOGS -----");
      execSync('docker compose logs temporal', { stdio: 'inherit' });
    } catch (e) {}
    cleanup();
    process.exit(1);
  }
}

runRealIntegration();
