export interface EventEnvelope {
  eventId: string;
  timestamp: string;
  source: string;
  payload: any;
}

export interface ActionProposal {
  proposalId: string;
  incidentId: string;
  actionType: 'restart' | 'rollback' | 'scale';
  targetResource: string;
  reasoning: string;
}

export interface ApprovalDecision {
  proposalId: string;
  approved: boolean;
  approverId: string;
  timestamp: string;
  reason?: string;
}
