import { Worker } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'incident-tasks',
  });
  console.log('Worker started for incident-tasks');
  await worker.run();
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
