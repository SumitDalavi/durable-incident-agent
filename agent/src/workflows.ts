import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from './activities';

const { remediateService, queryTelemetry, hypothesize, verifyRemediation } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// We'll pass the approval object, including the hash, to verify it hasn't mutated
export const approveActionSignal = defineSignal<[{ approved: boolean, proposalHash: string }]>('approveAction');

export async function incidentResponseWorkflow(incidentId: string, serviceUrl: string): Promise<string> {
  // Investigation
  // In a real scenario, this query would be dynamic based on the incident.
  const queryResult = await queryTelemetry(`rate(checkout_errors_total[1m])`);
  const hypothesis = await hypothesize(queryResult);
  
  // Create a proposal (mocking a hash for demo)
  const proposalHash = "hash-12345";
  console.log(`Action Proposed. Hash: ${proposalHash}. Hypothesis: ${hypothesis}`);

  let approvalData: { approved: boolean, proposalHash: string } | null = null;
  setHandler(approveActionSignal, (data) => {
    approvalData = data;
  });

  // Wait for human approval, or timeout after 10 minutes (using Temporal's condition timeout)
  const isApproved = await condition(() => approvalData !== null, '10m');

  if (!isApproved) {
    return `Incident ${incidentId} escalated: Approval timed out after 10 minutes.`;
  }

  if (approvalData?.proposalHash !== proposalHash) {
    return `Incident ${incidentId} rejected: Stale or invalid proposal hash.`;
  }

  if (approvalData?.approved) {
    const result = await remediateService(serviceUrl);
    const verified = await verifyRemediation(serviceUrl);
    return `Incident ${incidentId} resolved: ${result}. Verified: ${verified}. Hypothesis was: ${hypothesis}`;
  } else {
    return `Incident ${incidentId} resolution was rejected by operator.`;
  }
}
