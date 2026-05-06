import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import {
  CompletionLedgerSchema,
  CompletionSyncStatusSchema,
  type CompletionLedger,
  type CompletionSyncStatus,
} from './schemas';

const debug = createDebugger('session-completion:repository');
const TABLE = 'session_completion_ledgers';

export class SessionCompletionRepositoryError extends Error {
  constructor(
    public operation: string,
    public cause: unknown,
  ) {
    super(
      `Session completion repository failed during ${operation}: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'SessionCompletionRepositoryError';
  }
}

const CompletionLedgerRowSchema = z
  .object({
    completed_at: z.number().int(),
    created_at: z.union([z.number().int(), z.string()]),
    idempotency_key: z.string(),
    ledger_id: z.string().uuid(),
    ledger_payload: z.unknown(),
    offline_sync_status: CompletionSyncStatusSchema.optional(),
    session_id: z.string().uuid(),
    user_id: z.string().min(1),
  })
  .passthrough();

type CompletionLedgerRow = z.infer<typeof CompletionLedgerRowSchema>;

function parseCreatedAt(value: CompletionLedgerRow['created_at']): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error('Invalid created_at timestamp');
  }
  return parsed;
}

function mapLedgerToRow(ledger: CompletionLedger): Record<string, unknown> {
  return {
    completed_at: ledger.completedAt,
    idempotency_key: ledger.idempotencyKey,
    ledger_id: ledger.ledgerId,
    ledger_payload: ledger,
    offline_sync_status: ledger.offlineSyncStatus,
    session_id: ledger.sessionId,
    user_id: ledger.userId,
  };
}

function mapRowToLedger(row: CompletionLedgerRow): CompletionLedger {
  const payload = CompletionLedgerSchema.parse(row.ledger_payload);
  return CompletionLedgerSchema.parse({
    ...payload,
    createdAt: parseCreatedAt(row.created_at),
    idempotencyKey: row.idempotency_key,
    ledgerId: row.ledger_id,
    offlineSyncStatus: row.offline_sync_status ?? payload.offlineSyncStatus,
    sessionId: row.session_id,
    userId: row.user_id,
  });
}

async function fetchSingleLedgerBy(
  column: 'idempotency_key' | 'session_id',
  value: string,
): Promise<CompletionLedger | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq(column, value)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new SessionCompletionRepositoryError(`fetch:${column}`, error);
  }
  return mapRowToLedger(CompletionLedgerRowSchema.parse(data));
}

export async function createCompletionLedger(
  ledger: CompletionLedger,
): Promise<CompletionLedger> {
  const validated = CompletionLedgerSchema.parse(ledger);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(mapLedgerToRow(validated))
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505' || error.code === '409') {
      const existing = await getCompletionLedgerByIdempotencyKey(
        validated.idempotencyKey,
      );
      if (existing) {
        return existing;
      }
    }
    throw new SessionCompletionRepositoryError('create', error);
  }

  const row = CompletionLedgerRowSchema.safeParse(data);
  if (!row.success) {
    throw new SessionCompletionRepositoryError('create:invalid-response', row.error);
  }
  const created = mapRowToLedger(row.data);
  debug.info('Completion ledger persisted: %s', created.ledgerId);
  return created;
}

export async function getCompletionLedgerByIdempotencyKey(
  idempotencyKey: string,
): Promise<CompletionLedger | null> {
  return fetchSingleLedgerBy('idempotency_key', idempotencyKey);
}

export async function getCompletionLedgerBySessionId(
  sessionId: string,
): Promise<CompletionLedger | null> {
  return fetchSingleLedgerBy('session_id', sessionId);
}

export async function updateCompletionSyncStatus(
  ledgerId: string,
  status: CompletionSyncStatus,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ offline_sync_status: status })
    .eq('ledger_id', ledgerId);

  if (error) {
    throw new SessionCompletionRepositoryError('update-sync-status', error);
  }
}

export async function hasSessionBeenCompleted(sessionId: string): Promise<boolean> {
  const existing = await getCompletionLedgerBySessionId(sessionId);
  return existing !== null;
}

export const updateRewardStatus = updateCompletionSyncStatus;
