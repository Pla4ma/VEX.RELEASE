import { CoachAgentDecisionSchema, type AgentContextSnapshot } from './schemas';

export function validateCoachAgentDecision(
  raw: unknown,
  context: AgentContextSnapshot,
) {
  const parsed = CoachAgentDecisionSchema.safeParse(raw);
  if (!parsed.success) {
    return blocked(context.userId, 'RECENT_MISSED_SESSION', 'Decision failed validation.');
  }
  const decision = parsed.data;
  if (decision.userId !== context.userId) {
    return blocked(context.userId, 'RECENT_MISSED_SESSION', 'Decision user mismatch.');
  }
  if (!context.isOnline && decision.type === 'CONTINUE_STUDY_PLAN') {
    return blocked(context.userId, 'RECENT_MISSED_SESSION', 'Offline mode blocks cloud study actions.');
  }
  if (context.completedToday && decision.type !== 'NO_ACTION') {
    return blocked(context.userId, 'ENOUGH_DONE_TODAY', 'Enough done today. No guilt loop.');
  }
  if (context.trustLevel === 'low' && decision.confidence > 0.72) {
    return { ...decision, confidence: 0.72 };
  }
  return decision;
}

function blocked(userId: string, reasonCode: 'RECENT_MISSED_SESSION' | 'ENOUGH_DONE_TODAY', message: string) {
  return CoachAgentDecisionSchema.parse({
    decisionId: `blocked-${Date.now()}`,
    userId,
    type: 'NO_ACTION',
    message,
    reasonCode,
    confidence: 0,
    evidence: {},
    expiresAt: new Date(Date.now() + 300000).toISOString(),
    policy: { requiresUserConfirmation: true, canAutoExecute: false },
  });
}
