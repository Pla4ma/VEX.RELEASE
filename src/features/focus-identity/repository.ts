import { getSupabaseClient } from '../../config/supabase';
import type { FocusIdentityProfile } from './FocusIdentityEngine';
import { withRetry, FocusProfileRowSchema } from './repository-helpers';
import { transformRowToProfile } from './repository-transforms';
import {
  insertScoreHistory,
  insertScoreHistoryBatch,
} from './repository-score-history';

// Re-export split modules for backward compatibility
export { insertScoreHistory, insertScoreHistoryBatch, getScoreHistory } from './repository-score-history';
export { getMonthlyReportData, saveMonthlyReportData, isRepositoryHealthy } from './repository-monthly-report';
export type { MonthlyReportData } from './repository-monthly-report';

export async function getFocusProfile(
  userId: string,
): Promise<FocusIdentityProfile | null> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('focus_identity_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    if (!data) {
      return null;
    }
    const parsed = FocusProfileRowSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid profile data: ${parsed.error.message}`);
    }
    return transformRowToProfile(parsed.data);
  }, 'getFocusProfile');
}

export async function createFocusProfile(
  userId: string,
  profile: Omit<FocusIdentityProfile, 'userId'>,
): Promise<FocusIdentityProfile> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const row = {
      user_id: userId,
      current_score: profile.currentScore,
      previous_score: profile.previousScore,
      percentile_rank: profile.percentileRank,
      band_label: profile.band.label,
      band_title: profile.band.title,
      identity_statement: profile.identityStatement,
      streak_in_current_band: profile.streakInCurrentBand,
      total_calculations: profile.totalScoreCalculations,
      first_score_date: profile.firstScoreDate,
      is_in_recovery: profile.isInRecovery,
      recovery_start_date: profile.recoveryStartDate,
      recovery_progress: profile.recoveryProgress,
      pre_lapse_score: profile.preLapseScore,
      top_strength: profile.topStrength,
      top_weakness: profile.topWeakness,
      recommended_actions: profile.recommendedActions,
    };
    const { data, error } = await supabase
      .from('focus_identity_profiles')
      .insert(row)
      .select()
      .single();
    if (error) {
      throw error;
    }
    await insertScoreHistoryBatch(userId, data.id, profile.scoreHistory);
    return transformRowToProfile(data);
  }, 'createFocusProfile');
}

export async function updateFocusProfile(
  userId: string,
  updates: Partial<FocusIdentityProfile>,
): Promise<FocusIdentityProfile> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const rowUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.currentScore !== undefined) {
      rowUpdates.current_score = updates.currentScore;
    }
    if (updates.previousScore !== undefined) {
      rowUpdates.previous_score = updates.previousScore;
    }
    if (updates.percentileRank !== undefined) {
      rowUpdates.percentile_rank = updates.percentileRank;
    }
    if (updates.band !== undefined) {
      rowUpdates.band_label = updates.band.label;
      rowUpdates.band_title = updates.band.title;
    }
    if (updates.identityStatement !== undefined) {
      rowUpdates.identity_statement = updates.identityStatement;
    }
    if (updates.streakInCurrentBand !== undefined) {
      rowUpdates.streak_in_current_band = updates.streakInCurrentBand;
    }
    if (updates.totalScoreCalculations !== undefined) {
      rowUpdates.total_calculations = updates.totalScoreCalculations;
    }
    if (updates.isInRecovery !== undefined) {
      rowUpdates.is_in_recovery = updates.isInRecovery;
    }
    if (updates.recoveryStartDate !== undefined) {
      rowUpdates.recovery_start_date = updates.recoveryStartDate;
    }
    if (updates.recoveryProgress !== undefined) {
      rowUpdates.recovery_progress = updates.recoveryProgress;
    }
    if (updates.preLapseScore !== undefined) {
      rowUpdates.pre_lapse_score = updates.preLapseScore;
    }
    if (updates.topStrength !== undefined) {
      rowUpdates.top_strength = updates.topStrength;
    }
    if (updates.topWeakness !== undefined) {
      rowUpdates.top_weakness = updates.topWeakness;
    }
    if (updates.recommendedActions !== undefined) {
      rowUpdates.recommended_actions = updates.recommendedActions;
    }
    const { data, error } = await supabase
      .from('focus_identity_profiles')
      .update(rowUpdates)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) {
      throw error;
    }
    if (updates.scoreHistory && updates.scoreHistory.length > 0) {
      const lastEntry = updates.scoreHistory[updates.scoreHistory.length - 1]!;
      await insertScoreHistory(userId, data.id, lastEntry);
    }
    return transformRowToProfile(data);
  }, 'updateFocusProfile');
}

export async function getFocusProfileForMigration(
  userId: string,
): Promise<{
  localProfile: FocusIdentityProfile | null;
  remoteProfile: FocusIdentityProfile | null;
}> {
  return withRetry(async () => {
    const [localProfile, remoteProfile] = await Promise.all([
      Promise.resolve(null),
      getFocusProfile(userId),
    ]);
    return { localProfile, remoteProfile };
  }, 'getFocusProfileForMigration');
}

export async function deleteFocusProfile(userId: string): Promise<void> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    await supabase.from('focus_score_history').delete().eq('user_id', userId);
    const { error } = await supabase
      .from('focus_identity_profiles')
      .delete()
      .eq('user_id', userId);
    if (error) {
      throw error;
    }
  }, 'deleteFocusProfile');
}
