import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  let connection: any;
  while (true) {
    try {
      const temporalAddr = process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233';
      connection = await NativeConnection.connect({ address: temporalAddr });
      console.log(`Worker connected to Temporal at ${temporalAddr}`);
      break;
    } catch (err) {
      console.log('Worker failing to connect, retrying in 2s...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  const worker = await Worker.create({
    connection,
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
