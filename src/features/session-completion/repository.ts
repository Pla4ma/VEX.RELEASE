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
import { tableColumns } from '../../lib/repository/tableColumns';

const debug = createDebugger('session-completion:repository');

export class SessionCompletionRepositoryError extends Error {
  public readonly cause: unknown;

  constructor(operation: string, cause: unknown) {
    super(
      `Session completion repository failed during ${operation}:${cause instanceof Error ? cause.message : String(cause)}`,
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
    completed_at: ledger.completedAt,
    ledger_payload: CompletionLedgerSchema.parse(ledger),
    offline_sync_status: 'synced' as const,
    created_at: ledger.createdAt,
  };

  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .insert(row)
    .select(tableColumns('session_completion_ledgers'))
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

  try {
    const persisted = mapRowToCompletionLedger(data);
    await recordCompletionSessionEvent(persisted);
    return persisted;
  } catch (e) {
    throw new SessionCompletionRepositoryError('create', e);
  }
}

export async function getCompletionLedgerByIdempotencyKey(
  idempotencyKey: string,
): Promise<CompletionLedger | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .select(tableColumns('session_completion_ledgers'))
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
    .select(tableColumns('session_completion_ledgers'))
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

async function recordCompletionSessionEvent(ledger: CompletionLedger): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('record_session_event', {
    p_user_id: ledger.userId,
    p_session_id: ledger.sessionId,
    p_event_type: 'session.completed',
    p_event_payload: CompletionLedgerSchema.parse(ledger),
    p_idempotency_key: ledger.idempotencyKey + ':event',
    p_occurred_at: new Date(ledger.completedAt).toISOString(),
  });

  if (error) {
    Sentry.captureException(error);
    debug.warn('Failed to record session completion event:', error);
  }
}
