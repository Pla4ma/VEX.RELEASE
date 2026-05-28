import { getSupabaseClient } from "../../../config/supabase";
import { enqueue } from "../../../lib/offline/queue";
import { withRetry, RepositoryError } from "../../../lib/repository/base";
import { captureSilentFailure } from "../../../utils/silent-failure";
import {
  UserStakesPreferenceSchema,
  type StakesSessionRecord,
  type UserStakesPreference,
} from "./stakes-schemas";
import { saveStakesSession } from "./stakes-queries";

const supabase = getSupabaseClient();

export async function updateStakesPreference(
  userId: string,
  updates: Partial<UserStakesPreference>,
): Promise<{
  data: UserStakesPreference | null;
  error: RepositoryError | null;
}> {
  try {
    enqueue({
      operation: "UPDATE",
      feature: "sessions",
      payload: { userId, updates },
      idempotencyKey: `stakes-pref:${userId}:${Date.now()}`,
      maxRetries: 5,
      priority: "normal",
    });
    const { data, error } = await withRetry(
      "updateStakesPreference",
      async () => {
        return await supabase
          .from("user_stakes_preferences")
          .upsert(
            { user_id: userId, ...updates, updated_at: Date.now() },
            { onConflict: "user_id" },
          )
          .select()
          .single();
      },
    );
    if (error) {
      throw error;
    }
    return { data: UserStakesPreferenceSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, {
      feature: "sessions",
      operation: "updatePreference",
      type: "data",
    });
    return {
      data: null,
      error: new RepositoryError("updateStakesPreference", error),
    };
  }
}

export async function fetchStakesStats(
  userId: string,
): Promise<{
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
    const { data, error } = await withRetry("fetchStakesStats", async () => {
      return await supabase.rpc("get_stakes_stats", { p_user_id: userId });
    });
    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    captureSilentFailure(error, {
      feature: "sessions",
      operation: "fetchStats",
      type: "data",
    });
    return {
      data: null,
      error: new RepositoryError("fetchStakesStats", error),
    };
  }
}

export async function batchSaveStakesSessions(
  records: StakesSessionRecord[],
): Promise<{
  successful: StakesSessionRecord[];
  failed: Array<{ record: StakesSessionRecord; error: RepositoryError }>;
}> {
  const results = {
    successful: [] as StakesSessionRecord[],
    failed: [] as Array<{
      record: StakesSessionRecord;
      error: RepositoryError;
    }>,
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
