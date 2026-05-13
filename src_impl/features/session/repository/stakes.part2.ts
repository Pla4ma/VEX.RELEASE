import { getSupabaseClient } from "../../../config/supabase";
import { enqueue, type OfflineQueueEntryInput } from "../../../lib/offline/queue";
import { withRetry, RepositoryError } from "../../../lib/repository/base";
import { captureSilentFailure } from "../../../utils/silent-failure";
import { z } from "zod";


export async function fetchStakesStats(userId: string): Promise<{
  data: {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    totalXpEarned: number;
    netGems: number;
  } | null;
  error: RepositoryError | null;
}> {
  try {
    const { data, error } = await withRetry('fetchStakesStats', async () => {
      return await supabase.rpc('get_stakes_stats', { p_user_id: userId });
    });

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: 'sessions', operation: 'fetchStats', type: 'REPOSITORY_ERROR' as any });
    return { data: null, error: new RepositoryError('fetchStakesStats', error) };
  }
}

export async function batchSaveStakesSessions(records: StakesSessionRecord[]): Promise<{
  successful: StakesSessionRecord[];
  failed: Array<{ record: StakesSessionRecord; error: RepositoryError }>;
}> {
  const results = {
    successful: [] as StakesSessionRecord[],
    failed: [] as Array<{ record: StakesSessionRecord; error: RepositoryError }>,
  };

  for (const record of records) {
    const result = await saveStakesSession(record);
    if (result.error) {
      results.failed.push({ record, error: result.error });
    } else if (result.data) {
      results.successful.push(result.data);
    }
  }

  return results;
}