const assert = require('assert');
const fs = require('fs');

async function runTests() {
  console.log("Running Durable Incident Agent Tests...");
  
  // Test 1: Auth Middleware exists and protects approval
  const apiCode = fs.readFileSync(__dirname + '/api/index.js', 'utf8');
  assert(apiCode.includes('authMiddleware'), "Gate 1 Failed: Unauthenticated approvals not rejected.");
  assert(apiCode.includes("app.post('/api/incidents/:id/approve', authMiddleware"), "Gate 1 Failed: Approval route not protected.");
  
  // Test 2: Inconclusive telemetry
  const activitiesCode = fs.readFileSync(__dirname + '/agent/src/activities.ts', 'utf8');
  assert(activitiesCode.includes("return 'inconclusive'"), "Gate 4 Failed: Missing telemetry must produce inconclusive result.");
  assert(activitiesCode.includes("trafficRate < 0.1"), "Gate 4 Failed: Low traffic must fail recovery.");
  
  console.log("✅ Durable Incident Agent passed.");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
