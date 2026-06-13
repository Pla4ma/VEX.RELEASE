/**
 * Session Completion Repository — Row Mappers
 *
 * Extracts the Zod parsing/mapping logic for CompletionLedger rows
 * to keep repository.ts under 200 lines.
 */

import { CompletionLedgerSchema, type CompletionLedger } from './schemas';

const mapRowToCompletionLedger = (data: Record<string, unknown>): CompletionLedger => {
  const parsed = CompletionLedgerSchema.safeParse({
    ledgerId: data.ledger_id,
    idempotencyKey: data.idempotency_key,
    sessionId: data.session_id,
    userId: data.user_id,
    mode: data.mode,
    targetDurationSeconds: data.target_duration_seconds,
    completedDurationSeconds: data.completed_duration_seconds,
    effectiveFocusedSeconds: data.effective_focused_seconds,
    pauseCount: data.pause_count,
    interruptionCount: data.interruption_count,
    strictMode: data.strict_mode,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    timezone: data.timezone,
    grade: data.grade,
    gradeScore: data.grade_score,
    qualityScore: data.quality_score,
    focusScoreDelta: data.focus_score_delta,
    xpDelta: data.xp_delta,
    streakResult: data.streak_result,
    companionReactionId: data.companion_reaction_id,
    rewardIds: data.reward_ids,
    dailyMissionResult: data.daily_mission_result,
    offlineSyncStatus: data.offline_sync_status,
    degradedSystems: data.degraded_systems,
    createdAt: data.created_at,
  });

  if (!parsed.success) {
    throw new Error('invalid-response');
  }

  return { ...parsed.data, offlineSyncStatus: 'synced' as const };
};

const mapRowToCompletionLedgerNullable = (data: Record<string, unknown> | null): CompletionLedger | null => {
  if (!data) return null;

  const parsed = CompletionLedgerSchema.safeParse({
    ledgerId: data.ledger_id,
    idempotencyKey: data.idempotency_key,
    sessionId: data.session_id,
    userId: data.user_id,
    mode: data.mode,
    targetDurationSeconds: data.target_duration_seconds,
    completedDurationSeconds: data.completed_duration_seconds,
    effectiveFocusedSeconds: data.effective_focused_seconds,
    pauseCount: data.pause_count,
    interruptionCount: data.interruption_count,
    strictMode: data.strict_mode,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    timezone: data.timezone,
    grade: data.grade,
    gradeScore: data.grade_score,
    qualityScore: data.quality_score,
    focusScoreDelta: data.focus_score_delta,
    xpDelta: data.xp_delta,
    streakResult: data.streak_result,
    companionReactionId: data.companion_reaction_id,
    rewardIds: data.reward_ids,
    dailyMissionResult: data.daily_mission_result,
    offlineSyncStatus: data.offline_sync_status,
    degradedSystems: data.degraded_systems,
    createdAt: data.created_at,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

export { mapRowToCompletionLedger, mapRowToCompletionLedgerNullable };