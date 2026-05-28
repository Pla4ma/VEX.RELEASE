import { getSupabaseClient } from "../../config/supabase";
import { RepositoryError } from "./repository-helpers";

const supabase = getSupabaseClient();

export async function recordReroll(
  userId: string,
  originalChallengeId: string,
  newChallengeId: string,
  rerollType: "FREE" | "PAID",
  gemsSpent: number,
): Promise<void> {
  const { error } = await supabase
    .from("challenge_rerolls")
    .insert({
      user_id: userId,
      original_challenge_id: originalChallengeId,
      new_challenge_id: newChallengeId,
      reroll_type: rerollType,
      gems_spent: gemsSpent,
      rerolled_at: new Date().toISOString(),
    });
  if (error) {
    throw new RepositoryError("recordReroll", error);
  }
}

export async function getRerollCountToday(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("challenge_rerolls")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("rerolled_at", today);
  if (error) {
    throw new RepositoryError("getRerollCountToday", error);
  }
  return count ?? 0;
}

export async function getFreeRerollCountToday(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("challenge_rerolls")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("reroll_type", "FREE")
    .gte("rerolled_at", today);
  if (error) {
    throw new RepositoryError("getFreeRerollCountToday", error);
  }
  return count ?? 0;
}

export async function expireOldChallenges(cutoffDate: number): Promise<number> {
  const { data, error } = await supabase
    .from("user_challenges")
    .update({ status: "EXPIRED" })
    .lt("expires_at", new Date(cutoffDate).toISOString())
    .eq("status", "ACTIVE")
    .select("id");
  if (error) {
    throw new RepositoryError("expireOldChallenges", error);
  }
  return data?.length ?? 0;
}

export async function cleanupRerollHistory(
  olderThanDays: number,
): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  const { error } = await supabase
    .from("challenge_rerolls")
    .delete()
    .lt("rerolled_at", cutoff.toISOString());
  if (error) {
    throw new RepositoryError("cleanupRerollHistory", error);
  }
  return 0;
}
