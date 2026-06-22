import { getSupabaseClient } from '../../../config/supabase';
import { enqueue } from '../../../lib/offline/queue';
import { withRetry, RepositoryError } from '../../../lib/repository/base';
import { captureSilentFailure } from '../../../utils/silent-failure';
import {
  UserStakesPreferenceSchema,
  StakesStatsSchema,
  type StakesStats,
  type StakesSessionRecord,
  type UserStakesPreference,
} from './stakes-schemas';
import { saveStakesSession } from './stakes-queries';
import { tableColumns } from '../../../lib/repository/tableColumns';

export async function updateStakesPreference(
  userId: string,
  updates: Partial<UserStakesPreference>,
): Promise<{
  data: UserStakesPreference | null;
  error: RepositoryError | null;
}> {
  try {
    enqueue({
      operation: 'UPDATE',
      feature: 'sessions',
      payload: { userId, updates },
      idempotencyKey: `stakes-pref:${userId}:${Date.now()}`,
      maxRetries: 5,
      priority: 'normal',
    });
    const supabase = getSupabaseClient();
    const { data, error } = await withRetry(
      'updateStakesPreference',
      async () => {
        return await supabase
          .from('user_stakes_preferences')
          .upsert(
            { user_id: userId, ...updates, updated_at: Date.now() },
            { onConflict: 'user_id' },
          )
          .select(tableColumns('user_stakes_preferences'))
          .single();
      },
    );
    if (error) {
      throw error;
    }
    return { data: UserStakesPreferenceSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'sessions',
      operation: 'updatePreference',
      type: 'data',
    });
    return {
      data: null,
      error: new RepositoryError('updateStakesPreference', error),
    };
  }
}

export async function fetchStakesStats(
  userId: string,
): Promise<{
  data: StakesStats | null;
  error: RepositoryError | null;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await withRetry('fetchStakesStats', async () => {
      return await supabase.rpc('get_stakes_stats', { p_user_id: userId });
    });
    if (error) {
      throw error;
    }
    return { data: StakesStatsSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'sessions',
      operation: 'fetchStats',
      type: 'data',
    });
    return {
      data: null,
      error: new RepositoryError('fetchStakesStats', error),
    };
  }
}

export async function batchSaveStakesSessions(
  records: StakesSessionRecord[],
): Promise<{
  successful: StakesSessionRecord[];
  failed: Array<{ record: StakesSessionRecord; error: RepositoryError }>;
}> {
  const settled = await Promise.allSettled(
    records.map((record) => saveStakesSession(record).then((result) => ({ record, result }))),
  );
  const successful: StakesSessionRecord[] = [];
  const failed: Array<{ record: StakesSessionRecord; error: RepositoryError }> = [];
  for (const item of settled) {
    if (item.status === 'fulfilled' && item.value.result.data) {
      successful.push(item.value.result.data);
    } else if (item.status === 'fulfilled' && item.value.result.error) {
      failed.push({ record: item.value.record, error: item.value.result.error });
    }
  }
  return { successful, failed };
}
