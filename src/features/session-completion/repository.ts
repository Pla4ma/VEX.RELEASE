import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import { CompletionLedgerSchema, type CompletionLedger } from './schemas';

const debug = createDebugger('session-completion:repository');

const CompletionLedgerRowSchema = z.object({
  id: z.string().uuid(),
  ledger_id: z.string().uuid(),
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  idempotency_key: z.string(),
  completed_at: z.number(),
  duration_seconds: z.number(),
  quality_score: z.number(),
  pause_count: z.number(),
  effects: z.record(z.unknown()),
  reward_status: z.enum(['PENDING', 'COMPLETE', 'PARTIAL', 'FAILED']),
  next_action: z.record(z.unknown()),
  created_at: z.string(),
});

function mapRowToLedger(row: z.infer<typeof CompletionLedgerRowSchema>): CompletionLedger {
  return CompletionLedgerSchema.parse({
    ledgerId: row.ledger_id,
    sessionId: row.session_id,
    userId: row.user_id,
    idempotencyKey: row.idempotency_key,
    completedAt: row.completed_at,
    session: {
      durationSeconds: row.duration_seconds,
      qualityScore: row.quality_score,
      pauseCount: row.pause_count,
    },
    effects: row.effects as CompletionLedger['effects'],
    rewardStatus: row.reward_status,
    nextAction: row.next_action as CompletionLedger['nextAction'],
  });
}

export async function createCompletionLedger(
  ledger: Omit<CompletionLedger, 'ledgerId'> & { ledgerId: string }
): Promise<CompletionLedger> {
  const supabase = getSupabaseClient();

  const row = {
    ledger_id: ledger.ledgerId,
    session_id: ledger.sessionId,
    user_id: ledger.userId,
    idempotency_key: ledger.idempotencyKey,
    completed_at: ledger.completedAt,
    duration_seconds: ledger.session.durationSeconds,
    quality_score: ledger.session.qualityScore,
    pause_count: ledger.session.pauseCount,
    effects: ledger.effects,
    reward_status: ledger.rewardStatus,
    next_action: ledger.nextAction,
  };

  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .insert(row)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      debug.warn('Completion ledger already exists for idempotency key: %s', ledger.idempotencyKey);

      const existing = await getCompletionLedgerByIdempotencyKey(ledger.idempotencyKey);
      if (existing) {
        return existing;
      }
    }
    debug.error('Failed to create completion ledger', error);
    throw new Error(`Failed to create completion ledger: ${error.message}`);
  }

  const parsed = CompletionLedgerRowSchema.parse(data);
  debug.info('Created completion ledger: %s', parsed.ledger_id);

  return mapRowToLedger(parsed);
}

export async function getCompletionLedgerByIdempotencyKey(
  idempotencyKey: string
): Promise<CompletionLedger | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    debug.error('Failed to fetch completion ledger', error);
    throw new Error(`Failed to fetch completion ledger: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapRowToLedger(CompletionLedgerRowSchema.parse(data));
}

export async function getCompletionLedgerBySessionId(
  sessionId: string
): Promise<CompletionLedger | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_completion_ledgers')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    debug.error('Failed to fetch completion ledger', error);
    throw new Error(`Failed to fetch completion ledger: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapRowToLedger(CompletionLedgerRowSchema.parse(data));
}

export async function updateRewardStatus(
  ledgerId: string,
  status: CompletionLedger['rewardStatus'],
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseClient();

  const update: Record<string, unknown> = {
    reward_status: status,
  };

  if (metadata) {
    update.metadata = metadata;
  }

  const { error } = await supabase
    .from('session_completion_ledgers')
    .update(update)
    .eq('ledger_id', ledgerId);

  if (error) {
    debug.error('Failed to update reward status', error);
    throw new Error(`Failed to update reward status: ${error.message}`);
  }

  debug.info('Updated reward status for ledger %s to %s', ledgerId, status);
}

export async function hasSessionBeenCompleted(sessionId: string): Promise<boolean> {
  const ledger = await getCompletionLedgerBySessionId(sessionId);
  return ledger !== null;
}
