/**
 * Session Summary Builder
 *
 * Builds a SessionSummary from a CompletionLedger for display and analytics.
 */

import { CompletionLedgerSchema, type CompletionLedger } from './schemas';
import { SessionMode } from '../../session/modes';
import { SessionSummarySchema, type SessionSummary } from '../../session/types';

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
    streakBonus: Math.max(
      parsed.streakResult.newDays - parsed.streakResult.previousDays,
      0,
    ),
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