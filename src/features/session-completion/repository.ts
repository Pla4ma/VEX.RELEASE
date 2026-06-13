/**
 * Session Completion Repository
 *
 * Persists completion ledgers to Supabase with offline queue fallback.
 */

import * as Sentry from '@sentry/react-native';
import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
  type CompletionSyncStatus,
} from './schemas';
import { mapRowToCompletionLedger, mapRowToCompletionLedgerNullable } from './mappers';

const debug = createDebugger('session-completion:repository');

export class SessionCompletionRepositoryError extends Error {
  public readonly cause: unknown;

  constructor(operation: string, cause: unknown) {
    super(
      `Session completion repository failed during ${operation}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = 'SessionCompletionRepositoryError';
    this.cause = cause;
  }
}

export async function persistCompletionLedger(
  ledger: CompletionLedger,
): Promise<CompletionLedger> {
  const supabase = getSupabaseClient();
  const row = {
    ledger_id: ledger.ledgerId,
    idempotency_key: ledger.idempotencyKey,
    session_id: ledger.sessionId,
    user_id: ledger.userId,
    mode: ledger.mode,
    target_duration_seconds: ledger.targetDurationSeconds,
    completed_duration_seconds: ledger.completedDurationSeconds,
    effective_focused_seconds: ledger.effectiveFocusedSeconds,
    pause_count: ledger.pauseCount,
    interruption_count: ledger.interruptionCount,
    strict_mode: ledger.strictMode,
    started_at: ledger.startedAt,
    completed_at: ledger.completedAt,
    timezone: ledger.timezone,
    grade: ledger.grade,
    grade_score: ledger.gradeScore,
    quality_score: ledger.qualityScore,
    focus_score_delta: ledger.focusScoreDelta,
    xp_delta: ledger.xpDelta,
    streak_result: ledger.streakResult,
    companion_reaction_id: ledger.companionReactionId,
    reward_ids: ledger.rewardIds,
    daily_mission_result: ledger.dailyMissionResult,
    offline_sync_status: 'synced' as const,
    degraded_systems: ledger.degradedSystems,
    created_at: ledger.createdAt,
  };

  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    const code =
      error != null && typeof error === 'object' && 'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : null;
    if (code === '23505') {
      // Duplicate idempotency key — fetch existing
      const existing = await getCompletionLedgerByIdempotencyKey(ledger.idempotencyKey);
      if (existing) {
        return existing;
      }
    }
    throw new SessionCompletionRepositoryError('create', error);
  }

  if (!data) {
    throw new SessionCompletionRepositoryError('create', 'invalid-response');
  }

  return mapRowToCompletionLedger(data);
}

export async function getCompletionLedgerByIdempotencyKey(
  idempotencyKey: string,
): Promise<CompletionLedger | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (error) {
    const code =
      error != null && typeof error === 'object' && 'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : null;
    if (code === 'PGRST116') {
      return null;
    }
    throw new SessionCompletionRepositoryError('lookup-idempotency-key', error);
  }

  return mapRowToCompletionLedgerNullable(data);
}

export async function getCompletionLedgerBySessionId(
  sessionId: string,
): Promise<CompletionLedger | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    const code =
      error != null && typeof error === 'object' && 'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : null;
    if (code === 'PGRST116') {
      return null;
    }
    throw new SessionCompletionRepositoryError('lookup-session-id', error);
  }

  return mapRowToCompletionLedgerNullable(data);
}

export async function hasSessionBeenCompleted(
  sessionId: string,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .select('session_id')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    return false;
  }

  return data !== null;
}

export async function updateCompletionSyncStatus(
  ledgerId: string,
  offlineSyncStatus: CompletionSyncStatus,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('session_completion_ledgers')
    .update({ offline_sync_status: offlineSyncStatus })
    .eq('ledger_id', ledgerId);

  if (error) {
    throw new SessionCompletionRepositoryError('update-sync-status', error);
  }
}