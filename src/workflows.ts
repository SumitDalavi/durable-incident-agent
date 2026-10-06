import { proxyActivities, setHandler, defineSignal, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

const { gatherTelemetry, remediateIncident } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const approvalSignal = defineSignal<[boolean]>('approval');

export async function incidentWorkflow(incidentId: string): Promise<string> {
  let approved = false;
  let signalReceived = false;

  setHandler(approvalSignal, (isApproved: boolean) => {
    approved = isApproved;
    signalReceived = true;
  });

  const telemetry = await gatherTelemetry(incidentId);
  console.log(Telemetry gathered:, telemetry);

  // Wait for approval signal
  await sleep('5s'); // Simulate waiting or loop until signalReceived

  if (approved) {
    const result = await remediateIncident(incidentId);
    return Incident remediated: ;
  }
  return 'Incident resolution rejected.';
}
