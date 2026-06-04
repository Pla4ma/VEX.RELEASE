import { v4 } from '../../utils/uuid';
import type { SessionSummary } from '../../session/types';
import type { CompletionLedger } from './schemas';

type LedgerInput = {
  completedAt: number;
  offlineSyncStatus: CompletionLedger['offlineSyncStatus'];
  sessionId: string;
  summary: SessionSummary;
  timezone: string;
  userId: string;
};

export function buildCompletionLedger(input: LedgerInput): CompletionLedger {
  const score = Math.max(0, Math.min(100, input.summary.finalScore));
  return {
    ledgerId: v4(),
    idempotencyKey: `${input.userId}:${input.sessionId}`,
    sessionId: input.sessionId,
    userId: input.userId,
    mode: input.summary.sessionMode,
    targetDurationSeconds: input.summary.plannedDuration,
    completedDurationSeconds: input.summary.actualDuration,
    effectiveFocusedSeconds: input.summary.effectiveDuration,
    pauseCount: input.summary.pauses,
    interruptionCount: input.summary.interruptions,
    strictMode: false,
    startedAt: input.summary.createdAt,
    completedAt: input.completedAt,
    timezone: input.timezone,
    grade: score >= 95 ? 'S' : score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D',
    gradeScore: score,
    qualityScore: score,
    focusScoreDelta: Math.round(score / 10),
    xpDelta: input.summary.xpEarned ?? Math.round(score),
    streakResult: {
      action: input.summary.streakIncreased ? 'extended' : 'maintained',
      newDays: input.summary.streakDays ?? 0,
      previousDays: Math.max(0, (input.summary.streakDays ?? 0) - 1),
    },
    companionReactionId: null,
    rewardIds: [],
    dailyMissionResult: {
      missionId: null,
      progressDelta: 0,
      status: 'unchanged',
    },
    offlineSyncStatus: input.offlineSyncStatus,
    degradedSystems: [],
    createdAt: Date.now(),
  };
}
