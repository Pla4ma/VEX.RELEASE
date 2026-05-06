/**
 * Daily Rewards Repository
 * Persistence for D1-D7 login reward system
 */

import { getSupabaseClient } from "../../config/supabase";
import { enqueue } from "../../lib/offline/queue";
import { withRetry, RepositoryError } from "../../lib/repository/base";
import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";

const supabase = getSupabaseClient();

// ============================================================================
// Schemas
// ============================================================================

export const DailyRewardClaimSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  day: z.number().min(1).max(7),
  tier: z.enum(["DAY_1", "DAY_2", "DAY_3", "DAY_4", "DAY_5", "DAY_6", "DAY_7"]),
  items: z.array(
    z.object({
      type: z.enum(["COINS", "GEMS", "XP_BOOST", "STREAK_SHIELD", "CHEST"]),
      amount: z.number(),
    }),
  ),
  is_premium: z.boolean(),
  claimed_at: z.number(),
  streak_at_claim: z.number(),
});

export const UserDailyRewardsStateSchema = z.object({
  user_id: z.string().uuid(),
  current_streak: z.number().min(0).default(0),
  last_claimed_at: z.number().nullable(),
  last_claimed_day: z.number().min(0).max(7),
  has_claimed_today: z.boolean().default(false),
  can_claim_today: z.boolean().default(false),
  next_reset_at: z.number().nullable(),
});

export type DailyRewardClaim = z.infer<typeof DailyRewardClaimSchema>;
export type UserDailyRewardsState = z.infer<typeof UserDailyRewardsStateSchema>;

// ============================================================================
// Repository Functions
// ============================================================================

export async function saveDailyRewardClaim(claim: DailyRewardClaim): Promise<{ data: DailyRewardClaim | null; error: RepositoryError | null }> {
  try {
    enqueue({
      operation: "CREATE",
      feature: "rewards",
      payload: claim,
      idempotencyKey: `daily-reward:${claim.user_id}:${claim.day}:${claim.claimed_at}`,
      maxRetries: 5,
      priority: "high",
    });

    const { data, error } = await withRetry("saveDailyRewardClaim", async () => {
      return await supabase
        .from("daily_reward_claims")
        .insert({
          id: claim.id,
          user_id: claim.user_id,
          day: claim.day,
          tier: claim.tier,
          items: claim.items,
          is_premium: claim.is_premium,
          claimed_at: claim.claimed_at,
          streak_at_claim: claim.streak_at_claim,
        })
        .select()
        .single();
    });

    if (error) {
      throw error;
    }
    return { data: DailyRewardClaimSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "saveClaim", type: "network" });
    return { data: null, error: new RepositoryError("saveDailyRewardClaim", error) };
  }
}

export async function fetchDailyRewardsState(userId: string): Promise<{ data: UserDailyRewardsState | null; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry("fetchDailyRewardsState", async () => {
      return await supabase.from("user_daily_rewards").select("*").eq("user_id", userId).single();
    });

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null, error: null };
      }
      throw error;
    }

    return {
      data: UserDailyRewardsStateSchema.parse({
        user_id: data.user_id,
        current_streak: data.current_streak,
        last_claimed_at: data.last_claimed_at,
        last_claimed_day: data.last_claimed_day,
        has_claimed_today: data.has_claimed_today,
        can_claim_today: data.can_claim_today,
        next_reset_at: data.next_reset_at,
      }),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "fetchState", type: "network" });
    return { data: null, error: new RepositoryError("fetchDailyRewardsState", error) };
  }
}

export async function updateDailyRewardsState(userId: string, updates: Partial<UserDailyRewardsState>): Promise<{ data: UserDailyRewardsState | null; error: RepositoryError | null }> {
  try {
    enqueue({
      operation: "UPDATE",
      feature: "rewards",
      payload: { userId, updates },
      idempotencyKey: `daily-state:${userId}:${Date.now()}`,
      maxRetries: 5,
      priority: "high",
    });

    const { data, error } = await withRetry("updateDailyRewardsState", async () => {
      return await supabase
        .from("user_daily_rewards")
        .upsert(
          {
            user_id: userId,
            current_streak: updates.current_streak,
            last_claimed_at: updates.last_claimed_at,
            last_claimed_day: updates.last_claimed_day,
            has_claimed_today: updates.has_claimed_today,
            can_claim_today: updates.can_claim_today,
            next_reset_at: updates.next_reset_at,
            updated_at: Date.now(),
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();
    });

    if (error) {
      throw error;
    }
    return { data: UserDailyRewardsStateSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "updateState", type: "network" });
    return { data: null, error: new RepositoryError("updateDailyRewardsState", error) };
  }
}

export async function fetchUsersWithExpiredStreaks(): Promise<{
  data: Array<{ userId: string; currentStreak: number; lastClaimedAt: number }>;
  error: RepositoryError | null;
}> {
  try {
    const { data, error } = await withRetry("fetchUsersWithExpiredStreaks", async () => {
      return await supabase.from("user_daily_rewards").select("user_id, current_streak, last_claimed_at").lt("next_reset_at", Date.now()).gt("current_streak", 0);
    });

    if (error) {
      throw error;
    }
    return {
      data: (data || []).map((row) => ({
        userId: row.user_id,
        currentStreak: row.current_streak,
        lastClaimedAt: row.last_claimed_at,
      })),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "fetchExpired", type: "network" });
    return { data: [], error: new RepositoryError("fetchUsersWithExpiredStreaks", error) };
  }
}

export async function fetchClaimHistory(userId: string, limit: number = 30): Promise<{ data: DailyRewardClaim[]; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry("fetchClaimHistory", async () => {
      return await supabase.from("daily_reward_claims").select("*").eq("user_id", userId).order("claimed_at", { ascending: false }).limit(limit);
    });

    if (error) {
      throw error;
    }
    return {
      data: (data || []).map((row) => DailyRewardClaimSchema.parse(row)),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: "rewards", operation: "fetchHistory", type: "network" });
    return { data: [], error: new RepositoryError("fetchClaimHistory", error) };
  }
}
