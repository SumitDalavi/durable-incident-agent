import axios from 'axios';
import * as crypto from 'crypto';

const PROMETHEUS_URL = 'http://localhost:9090/api/v1/query';

// DIA-05: Read-only evidence tools
export async function queryTelemetry(query: string): Promise<string> {
  if (query.toUpperCase().includes('DROP') || query.toUpperCase().includes('DELETE')) {
    throw new Error('Invalid query: Modifications are not allowed in telemetry queries.');
  }
  
  console.log(`Executing Prometheus query: ${query}`);
  try {
    const res = await axios.get(PROMETHEUS_URL, { params: { query }, timeout: 5000 });
    if (!res.data || !res.data.data || res.data.data.result.length === 0) {
      return JSON.stringify({ status: 'NO_DATA', query, message: 'No telemetry data found for the given query.' });
    }
    return JSON.stringify({ status: 'SUCCESS', result: res.data.data.result });
  } catch (err: any) {
    return JSON.stringify({ status: 'ERROR', message: err.message });
  }
}

// DIA-07: Model investigation
export async function hypothesize(evidence: string): Promise<string> {
  if (!evidence || evidence.trim() === '') throw new Error('Missing evidence');
  
  const mode = process.env.MODEL_MODE || 'mock';
  
  if (mode === 'live') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("MODEL_MODE is live but OPENAI_API_KEY is missing. Cannot fulfill live request.");
    }
    console.log("Calling LIVE model with evidence...");
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SRE AI assistant. Analyze the telemetry evidence and propose a hypothesis.' },
          { role: 'user', content: `Telemetry evidence:\n${evidence}` }
        ],
        max_tokens: 150
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return `[LIVE] Hypothesis: ${response.data.choices[0].message.content.trim()}`;
    } catch (err: any) {
       throw new Error(`Model provider error: ${err.message}`);
    }
  }

  // Deterministic mock based on evidence
  console.log("Calling MOCK model with evidence...");
  if (evidence.includes('spike')) {
    return `[MOCK] Hypothesis: The service is experiencing a high error rate due to an injected spike-errors fault.`;
  }
  if (evidence.includes('latency')) {
    return `[MOCK] Hypothesis: The service is experiencing high latency (likely high-latency fault).`;
  }
  return `[MOCK] Hypothesis: The service is experiencing an anomaly. Recommend a reset.`;
}

export async function generateProposal(incidentId: string, hypothesis: string, targetService: string): Promise<{ action: string, proposalHash: string }> {
  const action = `reset_faults_on_${targetService}`;
  const rawPayload = `${incidentId}::${action}::${hypothesis}`;
  const proposalHash = crypto.createHash('sha256').update(rawPayload).digest('hex');
  return { action, proposalHash };
}

export async function verifyRemediation(serviceUrl: string, originalQuery: string): Promise<{ status: 'success' | 'failed' | 'inconclusive', metrics: any[] }> {
  const targetService = originalQuery.includes('payments') ? 'payments' : originalQuery.includes('inventory') ? 'inventory' : 'checkout';
  const trafficQuery = `rate(${targetService}_requests_total[1m])`;
  const latencyQuery = `histogram_quantile(0.95, rate(${targetService}_request_duration_seconds_bucket[1m]))`;

  let successfulObservations = 0;
  const maxObservations = 3;
  const collectedMetrics: any[] = [];

  for (let i = 0; i < maxObservations; i++) {
    // Wait 5 seconds between observations to prove sustained recovery
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      const [errRes, trafficRes, latRes] = await Promise.all([
        axios.get(PROMETHEUS_URL, { params: { query: originalQuery }, timeout: 5000 }),
        axios.get(PROMETHEUS_URL, { params: { query: trafficQuery }, timeout: 5000 }).catch(() => null),
        axios.get(PROMETHEUS_URL, { params: { query: latencyQuery }, timeout: 5000 }).catch(() => null)
      ]);
      
      const errResult = errRes.data?.data?.result;
      const trafficResult = trafficRes?.data?.data?.result;
      const latResult = latRes?.data?.data?.result;
      
      let trafficRate = -1;
      let errRate = -1;
      let errorRatio = -1;
      let latency = -1;
      
      if (trafficResult && trafficResult.length > 0) {
          trafficRate = parseFloat(trafficResult[0].value[1]);
      }
      if (errResult && errResult.length > 0) {
          errRate = parseFloat(errResult[0].value[1]);
      }
      if (latResult && latResult.length > 0) {
          latency = parseFloat(latResult[0].value[1]);
      }
      
      if (trafficRate > 0 && errRate >= 0) {
          errorRatio = errRate / trafficRate;
      }
      
      collectedMetrics.push({ timestamp: Date.now(), trafficRate, errRate, errorRatio, latency });

      if (trafficRate < 1.0) {
        console.warn(`verifyRemediation: Traffic rate too low (${trafficRate}), cannot prove recovery.`);
        return { status: 'inconclusive', metrics: collectedMetrics };
      }
      if (errorRatio < 0) {
        console.warn("verifyRemediation: Invalid error ratio, missing telemetry.");
        return { status: 'inconclusive', metrics: collectedMetrics };
      }
      if (errorRatio > 0.05) {
        console.warn(`verifyRemediation: Error ratio still high (${errorRatio.toFixed(2)}), failed.`);
        return { status: 'failed', metrics: collectedMetrics };
      }
      if (latency > 2.0) {
        console.warn(`verifyRemediation: Latency still high (${latency.toFixed(2)}s), failed.`);
        return { status: 'failed', metrics: collectedMetrics };
      }
      
      successfulObservations++;
    } catch (err: any) {
      console.error("verifyRemediation error:", err.message);
      return { status: 'inconclusive', metrics: collectedMetrics };
    }
  }

  if (successfulObservations === maxObservations) {
     return { status: 'success', metrics: collectedMetrics };
  }
  return { status: 'inconclusive', metrics: collectedMetrics };
}

export async function remediateService(serviceUrl: string): Promise<string> {
  try {
    await axios.post(`${serviceUrl}/fault/reset`, {}, { timeout: 5000 });
    return `Service ${serviceUrl} remediated successfully.`;
  } catch (err: any) {
    throw new Error(`Failed to remediate ${serviceUrl}: ${err.message}`);
  }
}
