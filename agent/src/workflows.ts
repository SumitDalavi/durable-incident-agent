import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from './activities';

const { fetchTelemetry, remediateService } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const approveActionSignal = defineSignal<[boolean]>('approveAction');

export async function incidentResponseWorkflow(incidentId: string, serviceUrl: string): Promise<string> {
  const telemetry = await fetchTelemetry(serviceUrl);
  
  let isApproved: boolean | null = null;
  setHandler(approveActionSignal, (approval: boolean) => {
    isApproved = approval;
  });

  // Wait for human approval
  await condition(() => isApproved !== null);

  if (isApproved) {
    const result = await remediateService(serviceUrl);
    return Incident \ resolved: \;
  } else {
    return Incident \ resolution was rejected.;
  }
}
