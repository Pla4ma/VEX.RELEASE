/**
 * Session Completion Ledger Service
 *
 * Builds completion ledgers from session summary data.
 * Ledger IDs and idempotency keys are cryptographically
 * random — see src/utils/uuid.ts (expo-crypto backed).
 */

import { v4 } from '../../utils/uuid';
import type { CompletionLedger, CompletionSyncStatus } from './schemas';
import {
  CompletionLedgerSchema,
  SessionCompletionGradeSchema,
} from './schemas';
import {
  SessionSummarySchema,
  type SessionSummary,
} from '../../session/types/schemas';

/** Input shape for building a completion ledger */
interface BuildLedgerInput {
  completedAt: number;
  offlineSyncStatus: CompletionSyncStatus;
  sessionId: string;
  summary: unknown;
  timezone: string;
  userId: string;
}

/**
 * Derive a completion grade from the session's final score.
 * S: 95+, A: 80+, B: 60+, C: 40+, D: below 40.
 */
function deriveGrade(finalScore: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (finalScore >= 95) return 'S';
  if (finalScore >= 80) return 'A';
  if (finalScore >= 60) return 'B';
  if (finalScore >= 40) return 'C';
  return 'D';
}

/**
 * Build a CompletionLedger from session completion input.
 *
 * idempotencyKey format: `userId:sessionId`
 * - sessionId is cryptographically random (expo-crypto)
 * - Server deduplicates on UNIQUE(idempotency_key)
 * - Retries with same session ID are intentionally deduplicated
 */
export function buildCompletionLedger(input: BuildLedgerInput): CompletionLedger {
  const summary: SessionSummary = SessionSummarySchema.parse(input.summary);
  const idempotencyKey = `${input.userId}:${input.sessionId}`;
  const grade = deriveGrade(summary.finalScore);

  const ledger: CompletionLedger = {
    ledgerId: v4(),
    idempotencyKey,
    sessionId: input.sessionId,
    userId: input.userId,
    mode: summary.sessionMode,
    targetDurationSeconds: summary.plannedDuration,
    completedDurationSeconds: summary.actualDuration,
    effectiveFocusedSeconds: summary.effectiveDuration,
    pauseCount: summary.pauses,
    interruptionCount: summary.interruptions,
    strictMode: summary.pauses === 0 && summary.interruptions === 0,
    startedAt: summary.createdAt,
    completedAt: input.completedAt,
    timezone: input.timezone,
    grade: SessionCompletionGradeSchema.parse(grade),
    gradeScore: summary.finalScore,
    qualityScore: summary.focusQuality,
    focusScoreDelta: summary.focusPurityScore ?? 0,
    xpDelta: summary.xpEarned,
    streakResult: {
      action: summary.streakIncreased ? 'extended' : 'maintained',
      newDays: summary.streakDays,
      previousDays: summary.streakIncreased
        ? summary.streakDays - 1
        : summary.streakDays,
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

  return CompletionLedgerSchema.parse(ledger);
}
