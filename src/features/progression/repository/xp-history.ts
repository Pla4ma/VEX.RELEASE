import { getSupabaseClient } from '../../../config/supabase';
import { RepositoryError } from '../../../lib/repository/error-handling';
import { v4 } from '../../../utils/uuid';
import { z } from 'zod';
import {
  XpEntrySchema,
  type XpEntry,
} from '../schemas';
import { XpEntryRowSchema } from '../progression-row-schemas';
import { withResilience } from '../../../utils/supabase-resilience';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();

function parseXpEntryRow(row: unknown): XpEntry {
  const parsed = XpEntryRowSchema.parse(row);
  return XpEntrySchema.parse({
    id: parsed.id,
    amount: parsed.amount,
    source: parsed.source,
    sessionId: parsed.session_id,
    metadata: parsed.metadata,
    createdAt: parsed.created_at,
  });
}

/** Fetch XP entries for a user, ordered newest first. */
export async function fetchXpHistory(
  userId: string,
  options?: { limit?: number; since?: number },
): Promise<XpEntry[]> {
  let query = supabase
    .from('xp_history')
    .select('id,amount,source,session_id,metadata,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.since) {
    query = query.gte('created_at', options.since);
  }
  query = query.limit(options?.limit ?? 50);

  const { data, error } = await query;
  if (error) {
    throw new RepositoryError('fetchXpHistory', error);
  }
  return (data ?? []).map(parseXpEntryRow);
}

/** Insert a single XP entry. */
export async function recordXpEntry(
  userId: string,
  entry: Omit<XpEntry, 'id' | 'userId'>,
): Promise<XpEntry> {
  const newEntry = {
    id: v4(),
    user_id: userId,
    amount: entry.amount,
    source: entry.source,
    session_id: entry.sessionId,
    metadata: entry.metadata,
    created_at: entry.createdAt,
  };

  const { data, error } = await withResilience(
    supabase.from('xp_history').insert(newEntry).select(tableColumns('xp_history')).single(),
    { operation: 'recordXpEntry', fallbackValue: newEntry },
  );
  if (error) {
    throw new RepositoryError('recordXpEntry', error);
  }
  return parseXpEntryRow(data);
}

/** Sum XP awarded within a time window. */
export async function fetchXpForPeriod(
  userId: string,
  startTime: number,
  endTime: number,
): Promise<number> {
  const { data, error } = await supabase
    .from('xp_history')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', startTime)
    .lte('created_at', endTime);

  if (error) {
    throw new RepositoryError('fetchXpForPeriod', error);
  }
  if (!data) {
    return 0;
  }
  return data.reduce(
    (sum: number, entry: { amount: number | null }) =>
      sum + (entry.amount || 0),
    0,
  );
}

/** Insert a level-up milestone record. */
export async function recordLevelUp(
  userId: string,
  level: number,
  xpAtLevel: number,
): Promise<void> {
  const { error } = await supabase
    .from('level_up_history')
    .insert({
      id: v4(),
      user_id: userId,
      level,
      achieved_at: Date.now(),
      xp_at_level: xpAtLevel,
    });

  if (error) {
    throw new RepositoryError('recordLevelUp', error);
  }
}

/** Fetch all level-up milestones for a user. */
export async function fetchLevelUpHistory(
  userId: string,
): Promise<Array<{ level: number; achievedAt: number; xpAtLevel: number }>> {
  const { data, error } = await supabase
    .from('level_up_history')
    .select('level, achieved_at, xp_at_level')
    .eq('user_id', userId)
    .order('level', { ascending: true });

  if (error) {
    throw new RepositoryError('fetchLevelUpHistory', error);
  }
  return (data || []).map(
    (row: { level: number; achieved_at: number; xp_at_level: number }) => ({
      level: row.level,
      achievedAt: row.achieved_at,
      xpAtLevel: row.xp_at_level,
    }),
  );
}

const AtomicXpRpcResultSchema = z.object({
  success: z.boolean(),
  duplicate: z.boolean(),
  xp_added: z.number(),
  new_total_xp: z.number(),
  new_level: z.number(),
  previous_level: z.number(),
  level_up: z.boolean(),
  rewards: z.array(z.string()),
});

export type AtomicXpRpcResult = z.infer<typeof AtomicXpRpcResultSchema>;

export async function atomicAddXpRpc(params: {
  userId: string;
  amount: number;
  source: string;
  sessionId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<{ data: AtomicXpRpcResult | null; error: Error | null }> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.rpc('atomic_add_xp', {
    p_user_id: params.userId,
    p_amount: params.amount,
    p_source: params.source,
    p_session_id: params.sessionId ?? null,
    p_idempotency_key: params.idempotencyKey ?? null,
    p_metadata: params.metadata
      ? structuredClone(params.metadata)
      : null,
  });
  if (error) {
    return { data: null, error: new RepositoryError('atomicAddXpRpc', error) };
  }
  return { data: AtomicXpRpcResultSchema.parse(data), error: null };
}
