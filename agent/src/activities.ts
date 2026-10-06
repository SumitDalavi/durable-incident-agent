import axios from 'axios';

export async function fetchTelemetry(serviceUrl: string): Promise<string> {
  try {
    const res = await axios.get(\/metrics);
    return res.data;
  } catch (err) {
    return Error fetching telemetry: \;
  }
}

export async function remediateService(serviceUrl: string): Promise<string> {
  // Idempotent reset
  try {
    await axios.post(\/fault/reset);
    return Service \ remediated successfully.;
  } catch (err) {
    throw new Error(Failed to remediate \: \);
  }
}
