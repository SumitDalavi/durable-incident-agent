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

export async function verifyRemediation(serviceUrl: string, originalQuery: string): Promise<'success' | 'failed' | 'inconclusive'> {
  // Wait 10 seconds to let the metrics settle
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    const targetService = originalQuery.includes('payments') ? 'payments' : originalQuery.includes('inventory') ? 'inventory' : 'checkout';
    const trafficQuery = `rate(${targetService}_requests_total[1m])`;
    
    const [errRes, trafficRes] = await Promise.all([
      axios.get(PROMETHEUS_URL, { params: { query: originalQuery }, timeout: 5000 }),
      axios.get(PROMETHEUS_URL, { params: { query: trafficQuery }, timeout: 5000 }).catch(() => null)
    ]);
    
    const errResult = errRes.data?.data?.result;
    const trafficResult = trafficRes?.data?.data?.result;
    
    if (!trafficResult || trafficResult.length === 0) {
      console.warn("verifyRemediation: No traffic metrics found, marking as inconclusive.");
      return 'inconclusive';
    }
    const trafficRate = parseFloat(trafficResult[0].value[1]);
    if (trafficRate < 1.0) {
      console.warn(`verifyRemediation: Traffic rate too low (${trafficRate}), cannot prove recovery.`);
      return 'inconclusive';
    }
    
    if (!errResult || errResult.length === 0) {
      console.warn("verifyRemediation: Error metric series missing. Cannot validate telemetry coverage.");
      return 'inconclusive';
    }
    const errRate = parseFloat(errResult[0].value[1]);
    const errorRatio = errRate / trafficRate;
    
    if (errorRatio > 0.05) {
      console.warn(`verifyRemediation: Error ratio still high (${errorRatio.toFixed(2)}), failed.`);
      return 'failed';
    }
    
    return 'success';
  } catch (err: any) {
    console.error("verifyRemediation error:", err.message);
    return 'inconclusive';
  }
}

export async function remediateService(serviceUrl: string): Promise<string> {
  try {
    await axios.post(`${serviceUrl}/fault/reset`, {}, { timeout: 5000 });
    return `Service ${serviceUrl} remediated successfully.`;
  } catch (err: any) {
    throw new Error(`Failed to remediate ${serviceUrl}: ${err.message}`);
  }
}
