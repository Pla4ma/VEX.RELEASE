import { getSupabaseClient } from '../../../config/supabase';
import { DifficultyProfileSchema, type DifficultyProfile } from '../schemas';
import { RepositoryError } from './error';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();

export async function fetchDifficultyProfile(
  userId: string,
): Promise<DifficultyProfile | null> {
  const { data, error } = await supabase
    .from('difficulty_profiles')
    .select('user_id,current_difficulty,recommended_difficulty,last_adjustment_at,adjustment_reason,success_rate_recent,success_rate_overall,trend')
    .eq('user_id', userId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchDifficultyProfile', error);
  }
  return data ? DifficultyProfileSchema.parse(data) : null;
}

export async function upsertDifficultyProfile(
  profile: DifficultyProfile,
): Promise<DifficultyProfile> {
  const { data, error } = await supabase
    .from('difficulty_profiles')
    .upsert({
      user_id: profile.userId,
      current_difficulty: profile.currentDifficulty,
      recommended_difficulty: profile.recommendedDifficulty,
      last_adjustment_at: profile.lastAdjustmentAt,
      adjustment_reason: profile.adjustmentReason,
      success_rate_recent: profile.successRateRecent,
      success_rate_overall: profile.successRateOverall,
      trend: profile.trend,
    })
    .select(tableColumns('difficulty_profiles'))
    .single();
  if (error) {
    throw new RepositoryError('upsertDifficultyProfile', error);
  }
  return DifficultyProfileSchema.parse(data);
}
