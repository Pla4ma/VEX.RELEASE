import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { CompletionLedger } from '../schemas';

export const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
export const USER_ID = 'user-123';

export function createSessionSummary(
  overrides: Partial<SessionSummary> = {},
): SessionSummary {
  return {
    actualDuration: 1500,
    baseScore: 100,
    bonuses: [],
    coinsEarned: 50,
    completionPercentage: 100,
    createdAt: 1710000000000,
    damageTaken: 0,
    effectiveDuration: 1400,
    finalScore: 120,
    focusPurityScore: 95,
    focusQuality: 95,
    gemsEarned: 0,
    interruptions: 0,
    modeBonus: 0,
    pausedDuration: 0,
    pausedTime: 0,
    pauses: 0,
    penaltiesApplied: [],
    plannedDuration: 1500,
    sessionId: SESSION_ID,
    sessionMode: SessionMode.FLOW,
    status: 'COMPLETED',
    streakBonus: 10,
    streakDays: 4,
    streakIncreased: true,
    streakMaintained: true,
    timeBonus: 10,
    userId: USER_ID,
    userLevel: 2,
    vsAverage: 0,
    vsBest: 0,
    xpEarned: 120,
    ...overrides,
  };
}

export function createCompletionLedger(
  overrides: Partial<CompletionLedger> = {},
): CompletionLedger {
  return {
    companionReactionId: null,
    completedAt: 1710001500000,
    completedDurationSeconds: 1500,
    createdAt: 1710001501000,
    dailyMissionResult: {
      missionId: null,
      progressDelta: 0,
      status: 'unchanged',
    },
    degradedSystems: [],
    effectiveFocusedSeconds: 1400,
    focusScoreDelta: 8,
    grade: 'A',
    gradeScore: 86,
    idempotencyKey: `${SESSION_ID}:1710001500000`,
    interruptionCount: 0,
    ledgerId: '550e8400-e29b-41d4-a716-446655440001',
    mode: SessionMode.FLOW,
    offlineSyncStatus: 'synced',
    pauseCount: 0,
    qualityScore: 90,
    rewardIds: [],
    sessionId: SESSION_ID,
    startedAt: 1710000000000,
    streakResult: { action: 'extended', newDays: 4, previousDays: 3 },
    strictMode: false,
    targetDurationSeconds: 1500,
    timezone: 'UTC',
    userId: USER_ID,
    xpDelta: 120,
    ...overrides,
  };
}

export function createLedgerRow(
  ledger: CompletionLedger = createCompletionLedger(),
): Record<string, unknown> {
  return {
    companion_reaction_id: ledger.companionReactionId,
    completed_at: ledger.completedAt,
    completed_duration_seconds: ledger.completedDurationSeconds,
    created_at: ledger.createdAt,
    daily_mission_result: ledger.dailyMissionResult,
    degraded_systems: ledger.degradedSystems,
    effective_focused_seconds: ledger.effectiveFocusedSeconds,
    focus_score_delta: ledger.focusScoreDelta,
    grade: ledger.grade,
    grade_score: ledger.gradeScore,
    idempotency_key: ledger.idempotencyKey,
    interruption_count: ledger.interruptionCount,
    ledger_id: ledger.ledgerId,
    mode: ledger.mode,
    offline_sync_status: ledger.offlineSyncStatus,
    pause_count: ledger.pauseCount,
    quality_score: ledger.qualityScore,
    reward_ids: ledger.rewardIds,
    session_id: ledger.sessionId,
    started_at: ledger.startedAt,
    streak_result: ledger.streakResult,
    strict_mode: ledger.strictMode,
    target_duration_seconds: ledger.targetDurationSeconds,
    timezone: ledger.timezone,
    user_id: ledger.userId,
    xp_delta: ledger.xpDelta,
  };
}
