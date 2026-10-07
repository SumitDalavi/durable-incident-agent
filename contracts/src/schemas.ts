import { z } from 'zod';

export const EventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  source: z.string(),
  type: z.string(),
  data: z.record(z.any())
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

export const ActionProposalSchema = z.object({
  proposalId: z.string().uuid(),
  actionType: z.enum(['restart', 'rollback', 'scale', 'drain']),
  target: z.string(),
  parameters: z.record(z.string()),
  evidenceIds: z.array(z.string())
});

export type ActionProposal = z.infer<typeof ActionProposalSchema>;

export const ApprovalDecisionSchema = z.object({
  proposalId: z.string().uuid(),
  approved: z.boolean(),
  reason: z.string().optional(),
  proposalHash: z.string()
});

export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

export const EvidenceReferenceSchema = z.object({
  evidenceId: z.string().uuid(),
  type: z.enum(['metric', 'log', 'trace']),
  query: z.string(),
  summary: z.string()
});

export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
