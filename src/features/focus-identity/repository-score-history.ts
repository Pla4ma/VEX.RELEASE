import { getSupabaseClient } from "../../config/supabase";
import { withRetry } from "./repository-helpers";

export async function insertScoreHistory(
  userId: string,
  profileId: string,
  entry: { date: string; score: number; reason: string },
): Promise<void> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("focus_score_history")
      .insert({
        user_id: userId,
        profile_id: profileId,
        date: entry.date,
        score: entry.score,
        reason: entry.reason,
      });
    if (error) {
      throw error;
    }
  }, "insertScoreHistory");
}

export async function insertScoreHistoryBatch(
  userId: string,
  profileId: string,
  entries: Array<{ date: string; score: number; reason: string }>,
): Promise<void> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const rows = entries.map((entry) => ({
      user_id: userId,
      profile_id: profileId,
      date: entry.date,
      score: entry.score,
      reason: entry.reason,
    }));
    const { error } = await supabase.from("focus_score_history").insert(rows);
    if (error) {
      throw error;
    }
  }, "insertScoreHistoryBatch");
}

export async function getScoreHistory(
  userId: string,
  days: number = 90,
): Promise<Array<{ date: string; score: number; reason: string }>> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const { data, error } = await supabase
      .from("focus_score_history")
      .select("date, score, reason")
      .eq("user_id", userId)
      .gte("date", cutoffDate.toISOString().split("T")[0])
      .order("date", { ascending: true });
    if (error) {
      throw error;
    }
    return data || [];
  }, "getScoreHistory");
}
