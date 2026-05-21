import {
  PostSessionNextActionSchema,
  SessionCompletionHeroSchema,
  SessionCompletionNavigationParamsSchema,
  SessionCompletionReturnPlanSchema,
  type PostSessionNextAction,
  type SessionCompletionHero,
  type SessionCompletionNavigationParams,
  type SessionCompletionReturnPlan,
} from './schemas';
import { generateSessionRecommendation } from '../session-recommendation/service';
import type { SessionMode as RecommendationMode } from '../session-recommendation/types';
import type { SessionSummary } from '../../session/types';
import { z } from 'zod';

export { buildCompletionLedger, type BuildCompletionLedgerInput } from './ledger-service';
export { calculateSessionGrade } from './grading-service';
export {
  buildSessionSummaryFromCompletionLedger,
  recoverSessionCompletionParams,
} from './recovery-service';
export type { SessionGradingInput, SessionGradingResult } from './grading-schemas';

const RecoverableSessionRouteSchema = z
  .object({ sessionId: z.string().uuid() })
  .passthrough();

export function parseSessionCompletionParams(input: unknown): {
  params: SessionCompletionNavigationParams | null;
  recoverySessionId: string | null;
  warningMessage: string | null;
} {
  const result = SessionCompletionNavigationParamsSchema.safeParse(input);
  if (result.success) {
    return { params: result.data, recoverySessionId: null, warningMessage: null };
  }
  const recoverable = RecoverableSessionRouteSchema.safeParse(input);

  return {
    params: null,
    recoverySessionId: recoverable.success ? recoverable.data.sessionId : null,
    warningMessage:
      recoverable.success
        ? 'We could not read the finished session summary, so VEX is trying to rebuild it from your saved completion record.'
        : 'We could not restore the finished session summary, so we sent you back to a safe exit.',
  };
}

export function buildSessionCompletionHero(input: {
  focusedDurationLabel: string;
  interruptions: number;
  streakIncreased: boolean;
}): SessionCompletionHero {
  const { focusedDurationLabel, interruptions, streakIncreased } = input;
  const title =
    interruptions === 0
      ? 'Clean finish. Rewards are landing now.'
      : streakIncreased
        ? 'Streak protected. Rewards are landing now.'
        : 'Session complete. Rewards are landing now.';

  return SessionCompletionHeroSchema.parse({
    body: focusedDurationLabel,
    eyebrow: 'Session Complete',
    title,
  });
}

export function buildSessionCompletionReturnPlan(input: {
  completionPercentage: number;
  hasStudyFollowUp: boolean;
  streakDays: number;
  streakIncreased: boolean;
}): SessionCompletionReturnPlan {
  const { completionPercentage, hasStudyFollowUp, streakDays, streakIncreased } =
    input;

  if (streakIncreased) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        "Home is primed with tomorrow's anchor so this win turns into a return plan.",
      highlightTitle: `${streakDays}-day streak secured`,
      highlightTone: 'celebration',
      homeCtaLabel: 'See tomorrow plan',
      nextSessionLabel: 'Bank another block',
      returnReasonBody:
        'Go home to see what this session unlocked and the simplest reason to return tomorrow.',
      returnReasonTitle: 'Tomorrow already has a clear anchor',
    });
  }

  if (hasStudyFollowUp) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        'Home will bring your active study plan back to the front so this session keeps compounding.',
      highlightTitle: 'Study momentum saved',
      highlightTone: 'info',
      homeCtaLabel: 'Continue on home',
      nextSessionLabel: 'Start another session',
      returnReasonBody:
        'Return home and keep moving through the plan while the material is still fresh.',
      returnReasonTitle: 'Your study follow-up is already queued',
    });
  }

  if (completionPercentage >= 100) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        'Home will show how this win changed today and what the next useful move is.',
      highlightTitle: 'Session banked cleanly',
      highlightTone: 'celebration',
      homeCtaLabel: 'See next move',
      nextSessionLabel: 'Bank another block',
      returnReasonBody:
        'Return home for the next best action and the progress signal from this finish.',
      returnReasonTitle: 'This finish now points to the next one',
    });
  }

  return SessionCompletionReturnPlanSchema.parse({
    highlightMessage:
      'Home will help you turn this partial win into a cleaner follow-up session.',
    highlightTitle: 'Progress locked in',
    highlightTone: 'info',
    homeCtaLabel: 'Plan the next move',
    nextSessionLabel: 'Start a recovery session',
    returnReasonBody:
      'Go home and take the next easiest session while the context is still warm.',
    returnReasonTitle: 'The loop stays alive with one more clean rep',
  });
}

function mapRecommendationMode(mode: RecommendationMode): PostSessionNextAction['routeParams']['presetMode'] {
  if (mode === 'STUDY') {
    return 'STUDY';
  }
  if (mode === 'RECOVERY') {
    return 'SPRINT';
  }
  if (mode === 'BOSS_PREP') {
    return 'DEEP_WORK';
  }
  return 'LIGHT_FOCUS';
}

function mapRecommendationDifficulty(input: {
  completionPercentage: number;
  focusPurityScore: number;
  mode: RecommendationMode;
}): PostSessionNextAction['routeParams']['suggestedDifficulty'] {
  if (input.mode === 'RECOVERY' || input.completionPercentage < 100) {
    return 'EASY';
  }
  if (input.mode === 'BOSS_PREP') {
    return 'CHALLENGING';
  }
  if (input.focusPurityScore >= 95) {
    return 'PUSH';
  }
  return 'NORMAL';
}

export function buildPostSessionNextAction(input: {
  summary: SessionSummary;
}): PostSessionNextAction {
  const { summary } = input;
  const recommendation = generateSessionRecommendation({
    hasActiveSession: false,
    isFirstSession: false,
    recoveryStatus: summary.completionPercentage >= 100 ? 'none' : 'needed',
    recentGrade: String(summary.finalScore),
    recentSessionLength: Math.max(0, Math.round(summary.effectiveDuration / 60)),
    streakUrgency: summary.streakMaintained ? 'none' : 'medium',
    timeOfDay: new Date(summary.createdAt).getHours(),
    userId: summary.userId,
  });
  const routeParams = {
    presetMode: mapRecommendationMode(recommendation.mode),
    recommendationId: `${summary.sessionId}:next-focus`,
    suggestedDifficulty: mapRecommendationDifficulty({
      completionPercentage: summary.completionPercentage,
      focusPurityScore: summary.focusPurityScore ?? summary.focusQuality,
      mode: recommendation.mode,
    }),
    suggestedDurationSeconds: recommendation.duration * 60,
  };

  return PostSessionNextActionSchema.parse({
    ctaLabel: 'Start next focus',
    id: routeParams.recommendationId,
    reason: recommendation.reason,
    routeParams,
  });
}
