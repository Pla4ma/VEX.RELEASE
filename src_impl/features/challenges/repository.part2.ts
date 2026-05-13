import { getSupabaseClient } from "../../config/supabase";
import { ChallengeDetailSchema, ChallengeSchema, ChallengeTemplateSchema, UserChallengeSchema, type Challenge, type ChallengeDetail, type ChallengeTemplate, type UserChallenge } from "./schemas";


export async function getFreeRerollCountToday(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase.from('challenge_rerolls').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('reroll_type', 'FREE').gte('rerolled_at', today);
  if (error) {
    throw new RepositoryError('getFreeRerollCountToday', error);
  }
  return count ?? 0;
}

export async function expireOldChallenges(cutoffDate: number): Promise<number> {
  const { data, error } = await supabase.from('user_challenges').update({ status: 'EXPIRED' }).lt('expires_at', new Date(cutoffDate).toISOString()).eq('status', 'ACTIVE').select('id');
  if (error) {
    throw new RepositoryError('expireOldChallenges', error);
  }
  return data?.length ?? 0;
}

export async function cleanupRerollHistory(olderThanDays: number): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  const { error } = await supabase.from('challenge_rerolls').delete().lt('rerolled_at', cutoff.toISOString());
  if (error) {
    throw new RepositoryError('cleanupRerollHistory', error);
  }
  return 0;
}