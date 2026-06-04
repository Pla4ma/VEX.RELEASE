import { getSupabaseClient } from '../../config/supabase';
import { withResilience } from '../../utils/supabase-resilience';
import { RepositoryError } from '../../lib/repository/error-handling';
import {
import { tableColumns } from '../../lib/repository/tableColumns';
  ProgressionSchema,
  type Progression,
} from './schemas';

const supabase = getSupabaseClient();

export async function fetchProgression(
  userId: string,
): Promise<Progression | null> {
  const { data, error } = await withResilience(
    supabase.from('progression').select('id,user_id,level,xp,total_xp,next_level_threshold,last_level_up_at,created_at,updated_at').eq('user_id', userId).single(),
    { operation: 'fetchProgression' },
  );
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchProgression', error);
  }
  if (!data) {
    return null;
  }
  return ProgressionSchema.parse(data);
}

export async function createProgression(userId: string): Promise<Progression> {
  const now = Date.now();
  const newProgression = {
    id: crypto.randomUUID(),
    user_id: userId,
    level: 1,
    xp: 0,
    total_xp: 0,
    next_level_threshold: 100,
    last_level_up_at: null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await withResilience(
    supabase.from('progression').insert(newProgression).select(tableColumns('progression')).single(),
    { operation: 'createProgression', fallbackValue: newProgression },
  );
  if (error) {
    throw new RepositoryError('createProgression', error);
  }
  return ProgressionSchema.parse(data);
}

export async function updateProgression(
  userId: string,
  updates: Partial<{
    level: number;
    xp: number;
    total_xp: number;
    next_level_threshold: number;
    last_level_up_at: number | null;
  }>,
): Promise<Progression> {
  const { data, error } = await withResilience(
    supabase
      .from('progression')
      .update({ ...updates, updated_at: Date.now() })
      .eq('user_id', userId)
      .select(tableColumns('progression'))
      .single(),
    { operation: 'updateProgression' },
  );
  if (error) {
    throw new RepositoryError('updateProgression', error);
  }
  return ProgressionSchema.parse(data);
}

// XP / level-up queries live in xp-history.ts
export {
  fetchXpHistory,
  recordXpEntry,
  fetchXpForPeriod,
  recordLevelUp,
  fetchLevelUpHistory,
  atomicAddXpRpc,
  type AtomicXpRpcResult,
} from './xp-history';
