import { getSupabaseClient } from "../../../config/supabase";
import {
  StreakRepairQuestSchema,
  type StreakRepairQuest,
} from "../schemas-risk-repair";
import { enqueue } from "../../../lib/offline/queue";
import {
  executeWithFallback,
  StreaksRepositoryError,
  type RepositoryResult,
} from "./enhanced";
import { RepositoryErrorCode } from "../../../lib/repository/base";

const supabase = getSupabaseClient();

export async function fetchActiveRepairQuestEnhanced(
  userId: string,
): Promise<RepositoryResult<StreakRepairQuest>> {
  return executeWithFallback("fetchActiveRepairQuest", async () => {
    const { data, error } = await supabase
      .from("streak_repair_quests")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        throw new StreaksRepositoryError(
          "fetchActiveRepairQuest",
          new Error("No active repair quest found"),
          RepositoryErrorCode.NOT_FOUND,
        );
      }
      throw error;
    }
    return StreakRepairQuestSchema.parse(data);
  });
}

export async function saveRepairQuestEnhanced(
  quest: StreakRepairQuest,
): Promise<RepositoryResult<StreakRepairQuest>> {
  enqueue({
    operation: "CREATE",
    feature: "streaks",
    payload: { quest },
    idempotencyKey: `quest:save:${quest.id}`,
    maxRetries: 5,
    priority: "high",
  });
  return executeWithFallback("saveRepairQuest", async () => {
    const { data, error } = await supabase
      .from("streak_repair_quests")
      .insert({
        id: quest.id,
        user_id: quest.userId,
        previous_streak: quest.previousStreak,
        target_restore_days: quest.targetRestoreDays,
        sessions_completed: quest.sessionsCompleted,
        sessions_required: quest.sessionsRequired,
        started_at: quest.startedAt,
        expires_at: quest.expiresAt,
        status: quest.status,
        session_ids: quest.sessionIds,
        completed_at: quest.completedAt,
      })
      .select()
      .single();
    if (error) {
      throw error;
    }
    return StreakRepairQuestSchema.parse(data);
  });
}

export async function updateRepairQuestEnhanced(
  questId: string,
  updates: Partial<StreakRepairQuest>,
): Promise<RepositoryResult<StreakRepairQuest>> {
  enqueue({
    operation: "UPDATE",
    feature: "streaks",
    payload: { questId, updates },
    idempotencyKey: `repair-quest:update:${questId}`,
    maxRetries: 5,
    priority: "high",
  });
  return executeWithFallback("updateRepairQuest", async () => {
    const { data, error } = await supabase
      .from("streak_repair_quests")
      .update({
        sessions_completed: updates.sessionsCompleted,
        session_ids: updates.sessionIds,
        status: updates.status,
        completed_at: updates.completedAt,
        updated_at: Date.now(),
      })
      .eq("id", questId)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return StreakRepairQuestSchema.parse(data);
  });
}

export async function fetchExpiredRepairQuestsEnhanced(): Promise<
  RepositoryResult<
    Array<{
      id: string;
      userId: string;
      previousStreak: number;
      status: string;
      expiresAt: number;
    }>
  >
> {
  return executeWithFallback("fetchExpiredRepairQuests", async () => {
    const { data, error } = await supabase
      .from("streak_repair_quests")
      .select("id, user_id, previous_streak, status, expires_at")
      .eq("status", "ACTIVE")
      .lt("expires_at", Date.now());
    if (error) {
      throw error;
    }
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      userId: row.user_id as string,
      previousStreak: row.previous_streak as number,
      status: row.status as string,
      expiresAt: row.expires_at as number,
    }));
  });
}
