/**
 * Achievement Repository
 *
 * Data access layer for achievement system
 */

import { getSupabaseClient } from '../../config/supabase';

const supabase = getSupabaseClient();
import { type UserAchievement } from './types';

// ============================================================================
// User Achievements
// ============================================================================

export async function getUserAchievement(
  userId: string,
  achievementId: string
): Promise<UserAchievement | null> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single();

  if (error || !data) {return null;}

  return {
    userId: data.user_id,
    achievementId: data.achievement_id,
    progress: data.progress,
    maxProgress: data.max_progress,
    isUnlocked: data.is_unlocked,
    unlockedAt: data.unlocked_at,
    progressHistory: data.progress_history || [],
  };
}

export async function getAllUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) {return [];}

  return data.map((row) => ({
    userId: row.user_id,
    achievementId: row.achievement_id,
    progress: row.progress,
    maxProgress: row.max_progress,
    isUnlocked: row.is_unlocked,
    unlockedAt: row.unlocked_at,
    progressHistory: row.progress_history || [],
  }));
}

export async function createUserAchievement(
  userId: string,
  achievementId: string,
  initialData: {
    progress: number;
    maxProgress: number;
    isUnlocked: boolean;
  }
): Promise<UserAchievement | null> {
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
      progress: initialData.progress,
      max_progress: initialData.maxProgress,
      is_unlocked: initialData.isUnlocked,
      progress_history: [],
    })
    .select()
    .single();

  if (error || !data) {return null;}

  return {
    userId: data.user_id,
    achievementId: data.achievement_id,
    progress: data.progress,
    maxProgress: data.max_progress,
    isUnlocked: data.is_unlocked,
    progressHistory: data.progress_history || [],
  };
}

export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  updates: {
    progress: number;
    isUnlocked?: boolean;
    unlockedAt?: number;
  }
): Promise<UserAchievement | null> {
  const updateData: Record<string, unknown> = {
    progress: updates.progress,
    updated_at: new Date().toISOString(),
  };

  if (updates.isUnlocked !== undefined) {
    updateData.is_unlocked = updates.isUnlocked;
  }

  if (updates.unlockedAt) {
    updateData.unlocked_at = new Date(updates.unlockedAt).toISOString();
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .update(updateData)
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .select()
    .single();

  if (error || !data) {return null;}

  return {
    userId: data.user_id,
    achievementId: data.achievement_id,
    progress: data.progress,
    maxProgress: data.max_progress,
    isUnlocked: data.is_unlocked,
    unlockedAt: data.unlocked_at ? new Date(data.unlocked_at).getTime() : undefined,
    progressHistory: data.progress_history || [],
  };
}

export async function resetAllUserAchievements(userId: string): Promise<void> {
  await supabase
    .from('user_achievements')
    .delete()
    .eq('user_id', userId);
}
