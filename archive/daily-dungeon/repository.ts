/**
 * Daily Dungeon Repository
 */

import { supabase } from '../../supabase/client';
import type { DailyDungeon, UserDungeonAttempt } from './types';

const DUNGEON_TABLE = 'daily_dungeons';
const ATTEMPT_TABLE = 'user_dungeon_attempts';

export async function fetchTodaysDungeon(): Promise<DailyDungeon | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from(DUNGEON_TABLE)
    .select('*')
    .eq('date', today)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data ? dbToDungeon(data) : null;
}

export async function fetchUserAttempt(
  userId: string,
  dungeonId: string
): Promise<UserDungeonAttempt | null> {
  const { data, error } = await supabase
    .from(ATTEMPT_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('dungeon_id', dungeonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data ? dbToAttempt(data) : null;
}

export async function createUserAttempt(
  userId: string,
  dungeonId: string,
  date: string
): Promise<UserDungeonAttempt> {
  const { data, error } = await supabase
    .from(ATTEMPT_TABLE)
    .insert({
      user_id: userId,
      dungeon_id: dungeonId,
      date,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dbToAttempt(data);
}

export async function updateAttempt(
  attemptId: string,
  updates: Partial<UserDungeonAttempt>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.attempts !== undefined) {
    dbUpdates.attempts = updates.attempts;
  }
  if (updates.bestTimeSeconds !== undefined) {
    dbUpdates.best_time_seconds = updates.bestTimeSeconds;
  }
  if (updates.bestDamage !== undefined) {
    dbUpdates.best_damage = updates.bestDamage;
  }
  if (updates.completed !== undefined) {
    dbUpdates.completed = updates.completed;
  }
  if (updates.completedAt !== undefined) {
    dbUpdates.completed_at = updates.completedAt
      ? new Date(updates.completedAt).toISOString()
      : null;
  }
  if (updates.claimedRewards !== undefined) {
    dbUpdates.claimed_rewards = updates.claimedRewards;
  }

  const { error } = await supabase
    .from(ATTEMPT_TABLE)
    .update(dbUpdates)
    .eq('id', attemptId);

  if (error) {
    throw error;
  }
}

export async function fetchLeaderboard(
  dungeonId: string,
  limit: number = 10
): Promise<Array<{ userId: string; displayName: string; timeSeconds: number; rank: number }>> {
  const { data, error } = await supabase
    .from(ATTEMPT_TABLE)
    .select('user_id, best_time_seconds, profiles(display_name)')
    .eq('dungeon_id', dungeonId)
    .eq('completed', true)
    .order('best_time_seconds', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map((row: Record<string, unknown>, index: number) => ({
    userId: row.user_id as string,
    displayName: (row.profiles as Record<string, string>)?.display_name || 'Unknown',
    timeSeconds: row.best_time_seconds as number,
    rank: index + 1,
  }));
}

function dbToDungeon(row: Record<string, unknown>): DailyDungeon {
  return {
    id: row.id as string,
    date: row.date as string,
    bossId: row.boss_id as string,
    bossName: row.boss_name as string,
    bossAvatarUrl: row.boss_avatar_url as string,
    specialMechanic: row.special_mechanic as string,
    mechanicDescription: row.mechanic_description as string,
    guaranteedDrop: row.guaranteed_reward as DailyDungeon['guaranteedDrop'],
    bonusRewards: row.bonus_rewards as DailyDungeon['bonusRewards'],
    baseHealth: row.base_health as number,
    healthScaling: row.health_scaling as number,
    timeLimitMinutes: row.time_limit_minutes as number,
    theme: row.theme as DailyDungeon['theme'],
  };
}

function dbToAttempt(row: Record<string, unknown>): UserDungeonAttempt {
  return {
    userId: row.user_id as string,
    dungeonId: row.dungeon_id as string,
    date: row.date as string,
    attempts: row.attempts as number,
    bestTimeSeconds: row.best_time_seconds as number | null,
    bestDamage: row.best_damage as number,
    completed: row.completed as boolean,
    completedAt: row.completed_at ? new Date(row.completed_at as string).getTime() : null,
    claimedRewards: (row.claimed_rewards as string[]) || [],
  };
}
