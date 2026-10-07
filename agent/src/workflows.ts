import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from './activities';

const { fetchTelemetry, remediateService, queryTelemetry, hypothesize, verifyRemediation } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const approveActionSignal = defineSignal<[boolean]>('approveAction');

export async function incidentResponseWorkflow(incidentId: string, serviceUrl: string): Promise<string> {
  const telemetry = await fetchTelemetry(serviceUrl);
  
  // Investigation
  const queryResult = await queryTelemetry('checkout_error_rate');
  const hypothesis = await hypothesize(queryResult);
  
  let isApproved: boolean | null = null;
  setHandler(approveActionSignal, (approval: boolean) => {
    isApproved = approval;
  });

  // Wait for human approval
  await condition(() => isApproved !== null);

  if (isApproved) {
    const result = await remediateService(serviceUrl);
    const verified = await verifyRemediation(serviceUrl);
    return Incident \ resolved: \. Verified: \. Hypothesis was: \;
  } else {
    return Incident \ resolution was rejected.;
  }
}
