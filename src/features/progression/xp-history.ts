import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { RepositoryError } from '../../lib/repository/error-handling';
import { v4 } from '../../utils/uuid';
import { withResilience } from '../../utils/supabase-resilience';
import { XpEntrySchema, type XpEntry } from './schemas';

export async function fetchXpHistory(
  userId: string,
  options?: { limit?: number; since?: number },
): Promise<XpEntry[]> {
  let query = getSupabaseClient()
    .from('xp_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.since) {
    query = query.gte('created_at', options.since);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new RepositoryError('fetchXpHistory', error);
  }
  return XpEntrySchema.array().parse(data);
}

export async function recordXpEntry(
  userId: string,
  entry: Omit<XpEntry, 'id' | 'userId'>,
): Promise<XpEntry> {
  const newEntry = {
    amount: entry.amount,
    created_at: entry.createdAt,
    id: v4(),
    metadata: entry.metadata,
    session_id: entry.sessionId,
    source: entry.source,
    user_id: userId,
  };

  const { data, error } = await withResilience(
    getSupabaseClient().from('xp_history').insert(newEntry).select().single(),
    { fallbackValue: newEntry, operation: 'recordXpEntry' },
  );
  if (error) {
    throw new RepositoryError('recordXpEntry', error);
  }
  return XpEntrySchema.parse(data);
}

export async function fetchXpForPeriod(
  userId: string,
  startTime: number,
  endTime: number,
): Promise<number> {
  const { data, error } = await getSupabaseClient()
    .from('xp_history')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', startTime)
    .lte('created_at', endTime);

  if (error) {
    throw new RepositoryError('fetchXpForPeriod', error);
  }
  return (data ?? []).reduce(
    (sum: number, entry: { amount: number | null }) => sum + (entry.amount ?? 0),
    0,
  );
}

export async function recordLevelUp(
  userId: string,
  level: number,
  xpAtLevel: number,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('level_up_history')
    .insert({
      achieved_at: Date.now(),
      id: v4(),
      level,
      user_id: userId,
      xp_at_level: xpAtLevel,
    });

  if (error) {
    throw new RepositoryError('recordLevelUp', error);
  }
}

export async function fetchLevelUpHistory(
  userId: string,
): Promise<Array<{ achievedAt: number; level: number; xpAtLevel: number }>> {
  const { data, error } = await getSupabaseClient()
    .from('level_up_history')
    .select('level, achieved_at, xp_at_level')
    .eq('user_id', userId)
    .order('level', { ascending: true });

  if (error) {
    throw new RepositoryError('fetchLevelUpHistory', error);
  }
  return (data ?? []).map(
    (row: { achieved_at: number; level: number; xp_at_level: number }) => ({
      achievedAt: row.achieved_at,
      level: row.level,
      xpAtLevel: row.xp_at_level,
    }),
  );
}

const AtomicXpRpcResultSchema = z.object({
  duplicate: z.boolean(),
  level_up: z.boolean(),
  new_level: z.number(),
  new_total_xp: z.number(),
  previous_level: z.number(),
  rewards: z.array(z.string()),
  success: z.boolean(),
  xp_added: z.number(),
});

export type AtomicXpRpcResult = z.infer<typeof AtomicXpRpcResultSchema>;

export async function atomicAddXpRpc(params: {
  amount: number;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
  sessionId?: string | null;
  source: string;
  userId: string;
}): Promise<{ data: AtomicXpRpcResult | null; error: Error | null }> {
  const { data, error } = await getSupabaseClient().rpc('atomic_add_xp', {
    p_amount: params.amount,
    p_idempotency_key: params.idempotencyKey ?? null,
    p_metadata: params.metadata ?? null,
    p_session_id: params.sessionId ?? null,
    p_source: params.source,
    p_user_id: params.userId,
  });
  if (error) {
    return { data: null, error: new RepositoryError('atomicAddXpRpc', error) };
  }
  return { data: AtomicXpRpcResultSchema.parse(data), error: null };
}
