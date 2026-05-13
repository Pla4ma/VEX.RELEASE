import { getSupabaseClient } from "../../../config/supabase";
import { enqueue } from "../../../lib/offline/queue";
import { withRetry, RepositoryError } from "../../../lib/repository/base";
import { captureSilentFailure } from "../../../utils/silent-failure";
import { z } from "zod";


export async function fetchClaimHistory(userId: string, limit: number = 30): Promise<{ data: DailyRewardClaim[]; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry('fetchClaimHistory', async () => {
      return await supabase.from('daily_reward_claims').select('*').eq('user_id', userId).order('claimed_at', { ascending: false }).limit(limit);
    });

    if (error) {
      throw error;
    }
    return {
      data: (data || []).map((row) => DailyRewardClaimSchema.parse(row)),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: 'rewards', operation: 'fetchHistory', type: 'network' });
    return { data: [], error: new RepositoryError('fetchClaimHistory', error) };
  }
}