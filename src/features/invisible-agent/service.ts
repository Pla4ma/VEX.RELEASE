import { getSupabaseClient } from '../../config/supabase';
import { createAITrace, recordAITrace } from '../../shared/ai/core-trace';
import {
  AgentContextSnapshotSchema,
  CoachAgentDecisionSchema,
  type AgentContextSnapshot,
  type CoachAgentDecision,
} from './schemas';
import { validateCoachAgentDecision } from './policy';

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
    const { data, error } = await getSupabaseClient().functions.invoke(
      'ai-coach',
      { body: { requestType: 'GENERATE_AGENT_DECISION', userId: context.userId, context } },
    );
    if (error) {throw new Error(error.message);}
    const raw = readStructuredDecision(data) ?? fallback;
    const decision = validateCoachAgentDecision(raw, context);
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
    return CoachAgentDecisionSchema.parse({ ...base, type: 'NO_ACTION', message: 'You already did enough today. Review progress only if useful.', reasonCode: 'ENOUGH_DONE_TODAY', confidence: 0.82 });
  }
  if (context.hoursUntilStreakDeadline !== null && context.hoursUntilStreakDeadline <= 4) {
    return CoachAgentDecisionSchema.parse({ ...base, type: 'RESCUE_STREAK', message: 'Your streak is close. Take the smallest clean rescue session.', reasonCode: 'STREAK_AT_RISK', confidence: 0.86 });
  }
  if (context.activeStudyPackId && context.isOnline) {
    return CoachAgentDecisionSchema.parse({ ...base, type: 'CONTINUE_STUDY_PLAN', message: 'Continue the study plan already in motion.', reasonCode: 'ACTIVE_STUDY_PLAN', confidence: 0.78, actionPayload: { studyPackId: context.activeStudyPackId }, evidence: { ...base.evidence, studyPackIds: [context.activeStudyPackId] } });
  }
  return CoachAgentDecisionSchema.parse({ ...base, type: 'START_SESSION', message: context.lowEnergyPattern ? 'Energy looks low. Start a short soft-focus session.' : 'Start one focused session and keep the system learning.', reasonCode: context.lowEnergyPattern ? 'LOW_ENERGY_PATTERN' : 'RECENT_MISSED_SESSION', confidence: 0.74 });
}

function readStructuredDecision(data: unknown): unknown {
  if (!data || typeof data !== 'object') {return null;}
  const record = data as Record<string, unknown>;
  return record.structuredData ?? record;
}

function trace(
  context: AgentContextSnapshot,
  policyBlocks: string[],
  fallbackUsed: boolean,
): void {
  recordAITrace(createAITrace({
    traceId: `agent-${context.userId}-${Date.now()}`,
    userId: context.userId,
    requestType: 'GENERATE_AGENT_DECISION',
    contextKeys: Object.keys(context),
    parsedSchema: 'CoachAgentDecisionSchema',
    policyBlocks,
    fallbackUsed,
  }));
}
