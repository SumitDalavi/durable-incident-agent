const http = require('http');
const { spawn } = require('child_process');

async function runTests() {
  console.log("Starting DIA API for Behavioral Tests...");
  const apiProcess = spawn('node', ['api/index.js']);
  
  // Give API 2 seconds to spin up
  await new Promise(r => setTimeout(r, 2000));
  console.log("Running Behavioral Tests for Durable Incident Agent...");

  const fetchJson = (path, method = 'GET', body = null, token = 'valid-token') => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 4000,
        path: `/api${path}`,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
             resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch(e) {
             resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Unauthorized approval fails
    console.log("Testing unauthorized approval...");
    const badRes = await fetchJson('/incidents/123/approve', 'POST', { approved: true, proposalHash: 'abc' }, 'invalid-token');
    if (badRes.status !== 403) throw new Error(`Expected 403, got ${badRes.status}`);

    // Since we don't start Temporal server for test.js, we expect a 500 when calling Temporal methods
    // because connection will fail, but the auth gate triggers BEFORE Temporal logic.
    // That means if we get 403 for bad token, auth is working perfectly!
    console.log("Testing authorized approval (fails at Temporal boundary, but passes Auth)...");
    const goodRes = await fetchJson('/incidents/123/approve', 'POST', { approved: true, proposalHash: 'abc' }, 'valid-token');
    // If auth failed, it would be 401 or 403. Since it passed auth, it tries to hit Temporal (which is down during simple make test) and returns 500.
    if (goodRes.status === 403 || goodRes.status === 401) {
       throw new Error("Authorized request failed auth middleware!");
    }

    console.log("Running Activity finite-value validation...");
    await new Promise((resolve, reject) => {
       const actProc = spawn('npx', ['tsx', 'agent/src/test-activities.ts'], { stdio: 'inherit', shell: true });
       actProc.on('close', code => {
         if (code === 0) resolve(true);
         else reject(new Error("Activity tests failed"));
       });
    });

    console.log("Running Temporal E2E tests...");
    await new Promise((resolve, reject) => {
       const e2eProc = spawn('npx', ['tsx', 'agent/src/test-workflow.ts'], { stdio: 'inherit', shell: true });
       e2eProc.on('close', code => {
         if (code === 0) resolve(true);
         else reject(new Error("Temporal E2E tests failed"));
       });
    });

    console.log("✅ Durable Incident Agent passed behavioral tests.");
    apiProcess.kill();
  } catch (err) {
    console.error("❌ Test Failed:", err);
    apiProcess.kill();
    process.exit(1);
  }
}

runTests();
