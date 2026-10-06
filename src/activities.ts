export async function gatherTelemetry(incidentId: string): Promise<any> {
  return { id: incidentId, cpu: 95, memory: 80 };
}

export async function remediateIncident(incidentId: string): Promise<string> {
  // Simulating an idempotent operation
  return Restarted service for ;
}
