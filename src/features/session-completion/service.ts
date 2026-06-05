export { orchestrateSessionCompletion } from './completion-orchestrator';
export { buildCompletionLedger } from './ledger-service';
export { applyCompletionSubsystems } from './completion-subsystems';
export {
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
} from './completion-personalization';
import { SessionMode } from '../../session/modes';
import { SessionSummarySchema, type SessionSummary } from '../../session/types';
import {
  CompletionLedgerSchema,
  SessionCompletionHeroSchema,
  SessionCompletionNavigationParamsSchema,
  SessionCompletionRecoveryParamsSchema,
  SessionCompletionReturnPlanSchema,
  type CompletionLedger,
  type SessionCompletionHero,
  type SessionCompletionNavigationParams,
  type SessionCompletionReturnPlan,
} from './schemas';

export type PostSessionStoryViewModel = {
  degradedWarnings: string[];
  grade: CompletionLedger['grade'];
  ledgerId: string;
  sessionId: string;
  summary: SessionSummary;
  xpDelta: number;
};

export function buildPostSessionStoryViewModel(input: {
  degradedWarnings?: string[];
  degradedSystems?: string[];
  ledger: CompletionLedger;
  summary: SessionSummary;
}): PostSessionStoryViewModel {
  return {
    degradedWarnings: input.degradedWarnings ?? input.degradedSystems ?? [],
    grade: input.ledger.grade,
    ledgerId: input.ledger.ledgerId,
    sessionId: input.ledger.sessionId,
    summary: input.summary,
    xpDelta: input.ledger.xpDelta,
  };
}

type ParsedSessionCompletionParams = {
  params: SessionCompletionNavigationParams | null;
  recoverySessionId: string | null;
  warningMessage: string | null;
};

export function parseSessionCompletionParams(
  params: unknown,
): ParsedSessionCompletionParams {
  const parsed = SessionCompletionNavigationParamsSchema.safeParse(params);
  if (parsed.success) {
    return { params: parsed.data, recoverySessionId: null, warningMessage: null };
  }

  const recovery = SessionCompletionRecoveryParamsSchema.safeParse(params);
  if (recovery.success) {
    return {
      params: null,
      recoverySessionId: recovery.data.sessionId,
      warningMessage: 'VEX needs to rebuild this session summary.',
    };
  }

  return {
    params: null,
    recoverySessionId: null,
    warningMessage: 'Session summary is unavailable. Use this safe exit.',
  };
}

export function buildSessionSummaryFromCompletionLedger(
  ledger: CompletionLedger,
): SessionSummary {
  const parsed = CompletionLedgerSchema.parse(ledger);
  const completionPercentage =
    parsed.targetDurationSeconds === 0
      ? 0
      : Math.round(
          (parsed.completedDurationSeconds / parsed.targetDurationSeconds) * 100,
        );

  return SessionSummarySchema.parse({
    actualDuration: parsed.completedDurationSeconds,
    baseScore: parsed.gradeScore,
    bonuses: [],
    coinsEarned: 0,
    completedAt: parsed.completedAt,
    completionPercentage,
    createdAt: parsed.createdAt,
    damageTaken: 0,
    effectiveDuration: parsed.effectiveFocusedSeconds,
    finalScore: parsed.gradeScore,
    focusPurityScore: parsed.qualityScore,
    focusQuality: parsed.qualityScore,
    gemsEarned: 0,
    interruptions: parsed.interruptionCount,
    modeBonus: 0,
    pausedDuration: 0,
    pausedTime: 0,
    pauses: parsed.pauseCount,
    penaltiesApplied: parsed.degradedSystems,
    plannedDuration: parsed.targetDurationSeconds,
    sessionId: parsed.sessionId,
    sessionMode: parsed.mode === 'UNKNOWN' ? SessionMode.FLOW : parsed.mode,
    status: 'COMPLETED',
    streakBonus: Math.max(parsed.streakResult.newDays - parsed.streakResult.previousDays, 0),
    streakDays: parsed.streakResult.newDays,
    streakIncreased: parsed.streakResult.newDays > parsed.streakResult.previousDays,
    streakMaintained: parsed.streakResult.newDays >= parsed.streakResult.previousDays,
    timeBonus: 0,
    userId: parsed.userId,
    userLevel: 1,
    vsAverage: 0,
    vsBest: 0,
    xpEarned: parsed.xpDelta,
  });
}

export function buildSessionCompletionHero(input: {
  focusedDurationLabel: string;
  interruptions: number;
  streakIncreased: boolean;
}): SessionCompletionHero {
  const clean = input.interruptions === 0;
  return SessionCompletionHeroSchema.parse({
    body: input.focusedDurationLabel,
    eyebrow: input.streakIncreased ? 'Streak protected' : 'Session complete',
    title: clean ? 'Clean finish.' : 'Work locked in.',
  });
}

export function buildSessionCompletionReturnPlan(input: {
  completionPercentage: number;
  hasStudyFollowUp: boolean;
  streakDays: number;
  streakIncreased: boolean;
}): SessionCompletionReturnPlan {
  const protectedStreak = input.streakIncreased && input.streakDays > 0;
  return SessionCompletionReturnPlanSchema.parse({
    highlightMessage: protectedStreak
      ? 'You protected momentum today.'
      : 'VEX saved this as a progress signal.',
    highlightTitle: protectedStreak
      ? `${input.streakDays}-day streak protected`
      : 'Session banked cleanly',
    highlightTone: input.completionPercentage >= 80 ? 'celebration' : 'info',
    homeCtaLabel: protectedStreak || input.hasStudyFollowUp
      ? 'See tomorrow plan'
      : 'Back home',
    nextSessionLabel: 'Bank another block',
    returnReasonBody: input.hasStudyFollowUp
      ? 'Your next study step is ready from this progress signal.'
      : 'This progress signal helps VEX tune your next focus block.',
    returnReasonTitle: protectedStreak ? 'Tomorrow is queued' : 'Next useful action',
  });
}
