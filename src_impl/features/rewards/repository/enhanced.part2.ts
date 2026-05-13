import { captureSilentFailure } from "../../../utils/silent-failure";
import { withRetry, RepositoryError, RepositoryErrorCode } from "../../../lib/repository/base";
import { enqueue } from "../../../lib/offline/queue";
import { getSupabaseClient } from "../../../config/supabase";
import { RewardSchema, RewardLedgerSchema, type Reward, type RewardLedger } from "../schemas";
import { v4 } from "../../../utils/uuid";


export async function fetchExpiredRewardsEnhanced(): Promise<RepositoryResult<Reward[]>> {
  return executeWithFallback('fetchExpiredRewards', async () => {
    const { data, error } = await supabase.from('rewards').select('*').eq('status', 'PENDING').lt('expires_at', Date.now());

    if (error) {
      throw error;
    }
    return RewardSchema.array().parse(data || []);
  });
}

export async function batchClaimRewards(rewardIds: string[]): Promise<{ successful: Reward[]; failed: Array<{ rewardId: string; error: RewardsRepositoryError }> }> {
  const results = { successful: [] as Reward[], failed: [] as Array<{ rewardId: string; error: RewardsRepositoryError }> };

  for (const rewardId of rewardIds) {
    const result = await markRewardClaimedEnhanced(rewardId);

    if (result.error) {
      results.failed.push({ rewardId, error: result.error });
    } else if (result.data) {
      results.successful.push(result.data);
    }
  }

  return results;
}