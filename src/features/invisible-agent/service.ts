import { createAITrace, recordAITrace } from '../../shared/ai/core-trace';
import { validateCoachAgentDecision } from './policy';
import { invokeCoachAgentDecision } from './repository';
import {
  AgentContextSnapshotSchema,
  CoachAgentDecisionSchema,
  type AgentContextSnapshot,
  type CoachAgentDecision,
} from './schemas';

export async function generateInvisibleAgentDecision(
  rawContext: AgentContextSnapshot,
): Promise<CoachAgentDecision> {
  const context = AgentContextSnapshotSchema.parse(rawContext);
  const fallback = buildDeterministicDecision(context);

  if (!context.isOnline) {
    trace(context, [], true);
    return fallback;
  }

  try {
    const raw = await invokeCoachAgentDecision(context);
    const decision = validateCoachAgentDecision(raw ?? fallback, context);
    const policyBlocks = decision.type === 'NO_ACTION' ? [decision.message] : [];
    trace(context, policyBlocks, false);
    return decision;
  } catch {
    trace(context, ['Edge unavailable; deterministic fallback used.'], true);
    return fallback;
  }
}

export function buildDeterministicDecision(
  context: AgentContextSnapshot,
): CoachAgentDecision {
  const base = {
    decisionId: `local-${context.userId}-${Date.now()}`,
    userId: context.userId,
    expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
    evidence: { sessionIds: context.recentSessionIds },
    policy: { requiresUserConfirmation: true, canAutoExecute: false },
  } as const;

  if (context.completedToday) {
    return CoachAgentDecisionSchema.parse({
      ...base,
      type: 'NO_ACTION',
      message: 'You already did enough today. Review progress only if useful.',
      reasonCode: 'ENOUGH_DONE_TODAY',
      confidence: 0.82,
    });
  }

  if (
    context.hoursUntilStreakDeadline !== null &&
    context.hoursUntilStreakDeadline <= 4
  ) {
    return CoachAgentDecisionSchema.parse({
      ...base,
      type: 'RESCUE_STREAK',
      message: 'Your streak is close. Take the smallest clean rescue session.',
      reasonCode: 'STREAK_AT_RISK',
      confidence: 0.86,
    });
  }

  if (context.activeStudyPackId && context.isOnline) {
    return CoachAgentDecisionSchema.parse({
      ...base,
      type: 'CONTINUE_STUDY_PLAN',
      message: 'Continue the study plan already in motion.',
      reasonCode: 'ACTIVE_STUDY_PLAN',
      confidence: 0.78,
      actionPayload: { studyPackId: context.activeStudyPackId },
      evidence: {
        ...base.evidence,
        studyPackIds: [context.activeStudyPackId],
      },
    });
  }

  return CoachAgentDecisionSchema.parse({
    ...base,
    type: 'START_SESSION',
    message: context.lowEnergyPattern
      ? 'Energy looks low. Start with a gentle focus block.'
      : 'Start a focused session while the window is clear.',
    reasonCode: context.lowEnergyPattern
      ? 'LOW_ENERGY_PATTERN'
      : 'RECENT_MISSED_SESSION',
    confidence: context.lowEnergyPattern ? 0.74 : 0.8,
  });
}

function trace(
  context: AgentContextSnapshot,
  policyBlocks: string[],
  fallbackUsed: boolean,
): void {
  recordAITrace(
    createAITrace({
      traceId: `agent-${context.userId}-${Date.now()}`,
      userId: context.userId,
      requestType: 'GENERATE_AGENT_DECISION',
      contextKeys: Object.keys(context),
      parsedSchema: 'CoachAgentDecisionSchema',
      policyBlocks,
      fallbackUsed,
    }),
  );
}
