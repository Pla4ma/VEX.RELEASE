import { getSupabaseClient } from "../../config/supabase";
import { StreakRowSchema, StreakSchema, type Streak } from "./schemas";
import { v4 } from "../../utils/uuid";


export async function updateRepairQuest(
  userId: string,
  questId: string,
  updates: {
    sessionsCompleted?: number;
    sessionIds?: string[];
    status?: string;
    completedAt?: number;
  },
): Promise<void> {
  const { error } = await supabase
    .from('streak_repair_quests')
    .update({
      sessions_completed: updates.sessionsCompleted,
      session_ids: updates.sessionIds,
      status: updates.status,
      completed_at: updates.completedAt,
      updated_at: Date.now(),
    })
    .eq('id', questId)
    .eq('user_id', userId);

  if (error) {
    throw new RepositoryError('updateRepairQuest', error);
  }
}

export async function fetchExpiredRepairQuests(): Promise<
  Array<{
    id: string;
    userId: string;
    previousStreak: number;
    status: string;
    expiresAt: number;
  }>
> {
  const { data, error } = await supabase.from('streak_repair_quests').select('id, user_id, previous_streak, status, expires_at').eq('status', 'ACTIVE').lt('expires_at', Date.now());

  if (error) {
    throw new RepositoryError('fetchExpiredRepairQuests', error);
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    previousStreak: row.previous_streak as number,
    status: row.status as string,
    expiresAt: row.expires_at as number,
  }));
}

export async function fetchUsersWithActiveStreaks(): Promise<string[]> {
  const { data, error } = await supabase.from('streaks').select('user_id').gt('current_days', 0);

  if (error) {
    throw new RepositoryError('fetchUsersWithActiveStreaks', error);
  }

  return (data || []).map((row: { user_id: string }) => row.user_id);
}