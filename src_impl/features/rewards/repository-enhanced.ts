import { captureSilentFailure } from "../../utils/silent-failure";
/**
 * Enhanced Rewards Repository
 * Features: Retry logic, offline queue integration
 */

import { withRetry, RepositoryError, RepositoryErrorCode } from "../../lib/repository/base";
import { enqueue } from "../../lib/offline/queue";
import { getSupabaseClient } from "../../config/supabase";
import { RewardSchema, RewardLedgerSchema, type Reward, type RewardLedger } from "./schemas";
import { v4 } from "../../utils/uuid";

const supabase = getSupabaseClient();

// ============================================================================
// Enhanced Error Handling
// ============================================================================

export class RewardsRepositoryError extends RepositoryError {
  constructor(operation: string, error: unknown, code?: RepositoryErrorCode) {
    super(operation, error, code);
    this.name = "RewardsRepositoryError";
  }
}

// ============================================================================
// Connection-Aware Operations
// ============================================================================

interface RepositoryResult<T> {
  data: T | null;
  error: RewardsRepositoryError | null;
  fromCache: boolean;
}

async function executeWithFallback<T>(operation: string, onlineFn: () => Promise<T>, offlineFn?: () => Promise<T | null>): Promise<RepositoryResult<T>> {
  try {
    const data = await withRetry(operation, onlineFn);
    return { data, error: null, fromCache: false };
  } catch (error) {
    const repoError = error instanceof RepositoryError ? new RewardsRepositoryError(operation, error.originalError, error.code) : new RewardsRepositoryError(operation, error);

    if (offlineFn) {
      try {
        const cached = await offlineFn();
        if (cached) {
          return { data: cached, error: repoError, fromCache: true };
        }
      } catch (error) {
        captureSilentFailure(error, { feature: "rewards", operation: "network-fallback", type: "network" });
        // Cache miss
      }
    }

    return { data: null, error: repoError, fromCache: false };
  }
}

// ============================================================================
// Enhanced Reward CRUD
// ============================================================================

export async function createRewardEnhanced(userId: string, type: string, amount: number | null, triggerType: string, triggerId: string | null, expiresAt: number | null): Promise<RepositoryResult<Reward>> {
  const newReward = {
    id: v4(),
    user_id: userId,
    type,
    amount,
    trigger_type: triggerType,
    trigger_id: triggerId,
    status: "PENDING",
    expires_at: expiresAt,
    created_at: Date.now(),
  };

  enqueue({
    operation: "REWARD_CLAIM",
    feature: "rewards",
    payload: newReward,
    idempotencyKey: `reward:create:${userId}:${triggerType}:${triggerId || Date.now()}`,
    maxRetries: 5,
    priority: "high",
  });

  return executeWithFallback("createReward", async () => {
    const { data, error } = await supabase.from("rewards").insert(newReward).select().single();

    if (error) {
      throw error;
    }
    return RewardSchema.parse(data);
  });
}

export async function fetchRewardEnhanced(rewardId: string): Promise<RepositoryResult<Reward | null>> {
  return executeWithFallback("fetchReward", async () => {
    const { data, error } = await supabase.from("rewards").select("*").eq("id", rewardId).single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return RewardSchema.parse(data);
  });
}

export async function fetchRewardsEnhanced(userId: string, status?: string): Promise<RepositoryResult<Reward[]>> {
  return executeWithFallback("fetchRewards", async () => {
    let query = supabase.from("rewards").select("*").eq("user_id", userId).order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return RewardSchema.array().parse(data || []);
  });
}

// ============================================================================
// Claim Operations
// ============================================================================

export async function markRewardClaimedEnhanced(rewardId: string): Promise<RepositoryResult<Reward>> {
  enqueue({
    operation: "UPDATE",
    feature: "rewards",
    payload: { rewardId, status: "CLAIMED" },
    idempotencyKey: `reward:claim:${rewardId}`,
    maxRetries: 5,
    priority: "high",
  });

  return executeWithFallback("markRewardClaimed", async () => {
    const { data, error } = await supabase
      .from("rewards")
      .update({
        status: "CLAIMED",
        claimed_at: Date.now(),
        updated_at: Date.now(),
      })
      .eq("id", rewardId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return RewardSchema.parse(data);
  });
}

export async function markRewardExpiredEnhanced(rewardId: string): Promise<RepositoryResult<Reward>> {
  return executeWithFallback("markRewardExpired", async () => {
    const { data, error } = await supabase
      .from("rewards")
      .update({
        status: "EXPIRED",
        updated_at: Date.now(),
      })
      .eq("id", rewardId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return RewardSchema.parse(data);
  });
}

export async function markRewardFailedEnhanced(rewardId: string): Promise<RepositoryResult<Reward>> {
  return executeWithFallback("markRewardFailed", async () => {
    const { data, error } = await supabase
      .from("rewards")
      .update({
        status: "FAILED",
        updated_at: Date.now(),
      })
      .eq("id", rewardId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return RewardSchema.parse(data);
  });
}

// ============================================================================
// Duplicate Prevention
// ============================================================================

export async function checkDuplicateRewardEnhanced(userId: string, triggerType: string, triggerId: string): Promise<RepositoryResult<boolean>> {
  return executeWithFallback("checkDuplicateReward", async () => {
    const { data, error } = await supabase.from("rewards").select("id").eq("user_id", userId).eq("trigger_type", triggerType).eq("trigger_id", triggerId).limit(1);

    if (error) {
      throw error;
    }
    return (data || []).length > 0;
  });
}

// ============================================================================
// Ledger Operations
// ============================================================================

export async function recordLedgerEntryEnhanced(rewardId: string, action: string, details: Record<string, unknown>): Promise<RepositoryResult<RewardLedger>> {
  enqueue({
    operation: "CREATE",
    feature: "rewards",
    payload: { rewardId, action, details },
    idempotencyKey: `ledger:${rewardId}:${action}:${Date.now()}`,
    maxRetries: 3,
    priority: "normal",
  });

  return executeWithFallback("recordLedgerEntry", async () => {
    const { data, error } = await supabase
      .from("reward_ledger")
      .insert({
        id: v4(),
        reward_id: rewardId,
        action,
        details,
        created_at: Date.now(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return RewardLedgerSchema.parse(data);
  });
}

// ============================================================================
// Expired Rewards
// ============================================================================

export async function fetchExpiredRewardsEnhanced(): Promise<RepositoryResult<Reward[]>> {
  return executeWithFallback("fetchExpiredRewards", async () => {
    const { data, error } = await supabase.from("rewards").select("*").eq("status", "PENDING").lt("expires_at", Date.now());

    if (error) {
      throw error;
    }
    return RewardSchema.array().parse(data || []);
  });
}

// ============================================================================
// Batch Operations
// ============================================================================

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
