import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker, Runtime, DefaultLogger, LogLevel } from '@temporalio/worker';
import { incidentResponseWorkflow } from './workflows';
import { verifyRemediation } from './activities';
import axios from 'axios';

async function run() {
  Runtime.install({
    logger: new DefaultLogger('WARN' as LogLevel),
  });

  const testEnv = await TestWorkflowEnvironment.createLocal();
  const { client, nativeConnection } = testEnv;

  let queryCount = 0;
  const mockActivities = {
    queryTelemetry: async (q: string) => {
      return JSON.stringify({ status: 'SUCCESS', result: [{ value: [123, "500"] }] });
    },
    hypothesize: async (e: string) => {
      return "[MOCK] Hypothesis";
    },
    generateProposal: async (i: string, h: string, t: string) => {
      return { action: 'mock_action', proposalHash: 'mock_hash' };
    },
    remediateService: async (s: string) => {
      return "remediated";
    },
    verifyRemediation: async (s: string, q: string) => {
      return 'success' as const;
    }
  };

  const worker = await Worker.create({
    connection: nativeConnection,
    taskQueue: 'incident-agent-queue',
    workflowsPath: require.resolve('./workflows'),
    activities: mockActivities,
  });

  console.log("Running Workflow E2E...");
  
  await worker.runUntil(async () => {
    const handle = await client.workflow.start(incidentResponseWorkflow, {
      args: ['INC-TEST', 'rate(checkout_errors)'],
      taskQueue: 'incident-agent-queue',
      workflowId: 'INC-TEST',
    });

    await handle.signal('approveAction', { approved: true, proposalHash: 'mock_hash', approver: 'test_approver' });
    
    const result = await handle.result();
    console.log("Workflow completed:", result);
    if (result.verification !== 'success') {
       throw new Error(`Workflow did not complete with success status. Got: ${JSON.stringify(result)}`);
    }
  });

  await testEnv?.teardown();
  console.log("✅ Temporal E2E completed.");
}

run().catch(err => {
  console.error("Test failed", err);
  process.exit(1);
});
