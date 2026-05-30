import { captureSilentFailure } from "../../../utils/silent-failure";
import {
  withRetry,
  RepositoryError,
  RepositoryErrorCode,
} from "../../../lib/repository/base";
import {
  enqueue,
  type OfflineQueueEntryInput,
} from "../../../lib/offline/queue";
import { getSupabaseClient } from "../../../config/supabase";
import { StreakSchema, type Streak } from "../schemas";
import { v4 } from "../../../utils/uuid";

const supabase = getSupabaseClient();
export class StreaksRepositoryError extends RepositoryError {
  public override readonly name = "StreaksRepositoryError";
  constructor(operation: string, error: unknown, code?: RepositoryErrorCode) {
    super(operation, error, code);
  }
}

export interface RepositoryResult<T> {
  data: T | null;
  error: StreaksRepositoryError | null;
  fromCache: boolean;
}
export async function executeWithFallback<T>(
  operation: string,
  onlineFn: () => Promise<T>,
  offlineFn?: () => Promise<T | null>,
): Promise<RepositoryResult<T>> {
  try {
    const data = await withRetry(operation, onlineFn);
    return { data, error: null, fromCache: false };
  } catch (error) {
    const repoError =
      error instanceof RepositoryError
        ? new StreaksRepositoryError(operation, error.originalError, error.code)
        : new StreaksRepositoryError(
            operation,
            error instanceof Error ? error : new Error(String(error)),
          );
    if (offlineFn) {
      try {
        const cached = await offlineFn();
        if (cached) {
          return { data: cached, error: repoError, fromCache: true };
        }
      } catch (error) {
        captureSilentFailure(error, {
          feature: "streaks",
          operation: "network-fallback",
          type: "network",
        });
      }
    }
    return { data: null, error: repoError, fromCache: false };
  }
}

export async function fetchStreakEnhanced(
  userId: string,
): Promise<RepositoryResult<Streak>> {
  return executeWithFallback("fetchStreak", async () => {
    const { data, error } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("No data returned");
    }
    return StreakSchema.parse(data);
  });
}

export async function createStreakEnhanced(
  streak: Streak,
): Promise<RepositoryResult<Streak>> {
  return executeWithFallback("createStreak", async () => {
    const { data, error } = await supabase
      .from("streaks")
      .insert({
        id: streak.id,
        user_id: streak.userId,
        current_days: streak.currentDays,
        longest_days: streak.longestDays,
        last_qualifying_session_at: streak.lastQualifyingSessionAt,
        current_day_completed_at: streak.currentDayCompletedAt,
        shields_available: streak.shieldsAvailable,
        grace_period_used: streak.gracePeriodUsed,
        timezone: streak.timezone,
        created_at: streak.createdAt,
        updated_at: streak.updatedAt,
      })
      .select()
      .single();
    if (error) {
      throw error;
    }
    return StreakSchema.parse(data);
  });
}

export async function updateStreakEnhanced(
  userId: string,
  updates: Partial<Streak>,
): Promise<RepositoryResult<Streak>> {
  const queueEntry: OfflineQueueEntryInput = {
    operation: "UPDATE",
    feature: "streaks",
    payload: { userId, updates } as Record<string, unknown>,
    idempotencyKey: `streak:update:${userId}`,
    maxRetries: 5,
    priority: "high",
  };
  enqueue(queueEntry);
  return executeWithFallback("updateStreak", async () => {
    const { data, error } = await supabase
      .from("streaks")
      .update({ ...updates, updated_at: Date.now() })
      .eq("user_id", userId)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return StreakSchema.parse(data);
  });
}

export async function recordShieldUsageEnhanced(
  userId: string,
  shieldData: { usedAt: number; reason: string },
): Promise<RepositoryResult<{ id: string }>> {
  const shieldQueueEntry: OfflineQueueEntryInput = {
    operation: "UPDATE",
    feature: "streaks",
    payload: { userId, shieldData } as Record<string, unknown>,
    idempotencyKey: `shield:use:${userId}:${shieldData.usedAt}`,
    maxRetries: 5,
    priority: "high",
  };
  enqueue(shieldQueueEntry);
  return executeWithFallback("recordShieldUsage", async () => {
    const { data, error } = await supabase
      .from("streak_shields")
      .insert({
        id: v4(),
        user_id: userId,
        used_at: shieldData.usedAt,
        reason: shieldData.reason,
        created_at: Date.now(),
      })
      .select("id")
      .single();
    if (error) {
      throw error;
    }
    return data as { id: string };
  });
}

export async function batchUpdateStreaks(
  updates: Array<{ userId: string; streak: Partial<Streak> }>,
): Promise<{
  successful: Streak[];
  failed: Array<{ userId: string; error: StreaksRepositoryError }>;
}> {
  const results = {
    successful: [] as Streak[],
    failed: [] as Array<{ userId: string; error: StreaksRepositoryError }>,
  };
  for (const update of updates) {
    const result = await updateStreakEnhanced(update.userId, update.streak);
    if (result.error) {
      results.failed.push({ userId: update.userId, error: result.error });
    } else if (result.data) {
      results.successful.push(result.data);
    }
  }
  return results;
}

export {
  fetchActiveRepairQuestEnhanced,
  saveRepairQuestEnhanced,
  updateRepairQuestEnhanced,
  fetchExpiredRepairQuestsEnhanced,
} from "./enhanced-repair-quest";

export {
  saveRiskStatusEnhanced,
  fetchRiskStatusEnhanced,
  fetchUsersWithActiveStreaksEnhanced,
} from "./enhanced-risk-status";