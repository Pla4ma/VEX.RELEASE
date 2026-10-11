import { extractJsonObject } from '../_shared/vex-ai-output.ts';
import {
  AgentDecisionProposalSchema,
  CoachAgentDecisionSchema,
  type AgentDecisionProposal,
  type AgentDecisionRequest,
  type CoachAgentDecision,
} from './schemas.ts';

const DECISION_TTL_MS = 30 * 60 * 1000;
const MAX_DECISION_JSON_LENGTH = 5000;

export interface AgentDecisionResult {
  decision: CoachAgentDecision;
  usedDeterministicFallback: boolean;
}

export function buildAgentDecision(
  rawText: string,
  request: AgentDecisionRequest,
): AgentDecisionResult {
  const proposal = parseProposal(rawText);
  if (!proposal || !isSupportedProposal(proposal, request)) {
    return {
      decision: buildDeterministicDecision(request),
      usedDeterministicFallback: true,
    };
  }

  return {
    decision: CoachAgentDecisionSchema.parse({
      decisionId: crypto.randomUUID(),
      userId: request.userId,
      ...proposal,
      ...(proposal.type === 'CONTINUE_STUDY_PLAN' && request.context.activeStudyPackId
        ? { actionPayload: { studyPackId: request.context.activeStudyPackId } }
        : {}),
      expiresAt: new Date(Date.now() + DECISION_TTL_MS).toISOString(),
      evidence: {
        sessionIds: request.context.recentSessionIds,
        ...(request.context.activeStudyPackId
          ? { studyPackIds: [request.context.activeStudyPackId] }
          : {}),
      },
      policy: { requiresUserConfirmation: true, canAutoExecute: false },
    }),
    usedDeterministicFallback: false,
  };
}

function parseProposal(rawText: string): AgentDecisionProposal | null {
  const json = extractJsonObject(rawText);
  if (!json || json.length > MAX_DECISION_JSON_LENGTH) return null;
  try {
    const decoded: unknown = JSON.parse(json);
    const parsed = AgentDecisionProposalSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function isSupportedProposal(
  proposal: AgentDecisionProposal,
  request: AgentDecisionRequest,
): boolean {
  const context = request.context;
  if (proposal.reasonCode === 'ENOUGH_DONE_TODAY') {
    return context.completedToday && proposal.type === 'NO_ACTION';
  }
  if (context.completedToday) return false;
  if (proposal.reasonCode === 'STREAK_AT_RISK') {
    return proposal.type === 'RESCUE_STREAK'
      && context.currentStreak > 0
      && context.hoursUntilStreakDeadline !== null
      && context.hoursUntilStreakDeadline <= 4;
  }
  if (proposal.reasonCode === 'ACTIVE_STUDY_PLAN') {
    return proposal.type === 'CONTINUE_STUDY_PLAN'
      && context.isOnline
      && context.activeStudyPackId !== null;
  }
  if (proposal.reasonCode === 'LOW_ENERGY_PATTERN') {
    return proposal.type === 'START_SESSION' && context.lowEnergyPattern;
  }
  return proposal.type === 'START_SESSION' || proposal.type === 'REVIEW_PROGRESS';
}

function buildDeterministicDecision(
  request: AgentDecisionRequest,
): CoachAgentDecision {
  const context = request.context;
  const decision = buildDeterministicProposal(context);

  return CoachAgentDecisionSchema.parse({
    decisionId: crypto.randomUUID(),
    userId: request.userId,
    ...decision,
    ...(decision.type === 'CONTINUE_STUDY_PLAN' && context.activeStudyPackId
      ? { actionPayload: { studyPackId: context.activeStudyPackId } }
      : {}),
    expiresAt: new Date(Date.now() + DECISION_TTL_MS).toISOString(),
    evidence: {
      sessionIds: context.recentSessionIds,
      ...(context.activeStudyPackId
        ? { studyPackIds: [context.activeStudyPackId] }
        : {}),
    },
    policy: { requiresUserConfirmation: true, canAutoExecute: false },
  });
}

function buildDeterministicProposal(
  context: AgentDecisionRequest['context'],
): AgentDecisionProposal {
  if (context.completedToday) {
    return {
      type: 'NO_ACTION',
      message: 'You already did enough today. Review progress only if useful.',
      reasonCode: 'ENOUGH_DONE_TODAY',
      confidence: 0.82,
    };
  }
  if (context.currentStreak > 0
    && context.hoursUntilStreakDeadline !== null
    && context.hoursUntilStreakDeadline <= 4) {
    return {
      type: 'RESCUE_STREAK',
      message: 'Your streak is close. Take the smallest clean rescue session.',
      reasonCode: 'STREAK_AT_RISK',
      confidence: 0.86,
    };
  }
  if (context.activeStudyPackId && context.isOnline) {
    return {
      type: 'CONTINUE_STUDY_PLAN',
      message: 'Continue the study plan already in motion.',
      reasonCode: 'ACTIVE_STUDY_PLAN',
      confidence: 0.78,
    };
  }
  return {
    type: 'START_SESSION',
    message: context.lowEnergyPattern
      ? 'Energy looks low. Start with a gentle focus block.'
      : 'Start a focused session while the window is clear.',
    reasonCode: context.lowEnergyPattern
      ? 'LOW_ENERGY_PATTERN'
      : 'RECENT_MISSED_SESSION',
    confidence: context.lowEnergyPattern ? 0.74 : 0.8,
  };
}
