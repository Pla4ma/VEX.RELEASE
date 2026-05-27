import { SessionMode } from "../../session/modes";
import { SessionSummarySchema, type SessionSummary } from "../../session/types";
import { getCompletionLedgerBySessionId } from "./repository";
import {
  SessionCompletionNavigationParamsSchema,
  type CompletionLedger,
  type SessionCompletionNavigationParams,
} from "./schemas";

function calculateCompletionPercentage(ledger: CompletionLedger): number {
  if (ledger.targetDurationSeconds <= 0) {
    return 0;
  }
  return Math.min(
    100,
    Math.round(
      (ledger.completedDurationSeconds / ledger.targetDurationSeconds) * 100,
    ),
  );
}

function resolveRecoveredMode(ledger: CompletionLedger): SessionMode {
  return ledger.mode === "UNKNOWN" ? SessionMode.FLOW : ledger.mode;
}

export function buildSessionSummaryFromCompletionLedger(
  ledger: CompletionLedger,
): SessionSummary {
  const pausedDuration = Math.max(
    0,
    ledger.completedDurationSeconds - ledger.effectiveFocusedSeconds,
  );

  return SessionSummarySchema.parse({
    actualDuration: ledger.completedDurationSeconds,
    baseScore: ledger.gradeScore,
    coinsEarned: 0,
    completionPercentage: calculateCompletionPercentage(ledger),
    createdAt: ledger.completedAt,
    damageTaken: 0,
    effectiveDuration: ledger.effectiveFocusedSeconds,
    finalScore: ledger.gradeScore,
    focusPurityScore: ledger.qualityScore,
    focusQuality: ledger.qualityScore,
    gemsEarned: 0,
    interruptions: ledger.interruptionCount,
    modeBonus: 0,
    pausedDuration,
    pausedTime: pausedDuration,
    pauses: ledger.pauseCount,
    plannedDuration: ledger.targetDurationSeconds,
    sessionId: ledger.sessionId,
    sessionMode: resolveRecoveredMode(ledger),
    status: "COMPLETED",
    streakBonus: 0,
    streakDays: ledger.streakResult.newDays,
    streakIncreased: ledger.streakResult.action === "extended",
    streakMaintained: ledger.streakResult.action !== "broken",
    timeBonus: 0,
    userId: ledger.userId,
    userLevel: 1,
    vsAverage: 0,
    vsBest: 0,
    xpEarned: ledger.xpDelta,
  });
}

export async function recoverSessionCompletionParams(
  sessionId: string,
): Promise<SessionCompletionNavigationParams | null> {
  const ledger = await getCompletionLedgerBySessionId(sessionId);
  if (!ledger) {
    return null;
  }

  return SessionCompletionNavigationParamsSchema.parse({
    sessionId,
    summary: buildSessionSummaryFromCompletionLedger(ledger),
  });
}
