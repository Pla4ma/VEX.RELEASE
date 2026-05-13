import { getSupabaseClient } from "../../config/supabase";
import { StreakRowSchema, StreakSchema, type Streak } from "./schemas";
import { v4 } from "../../utils/uuid";


export async function fetchStreak(userId: string): Promise<Streak | null> {
  const { data, error } = await supabase.from('streaks').select('*').eq('user_id', userId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchStreak', error);
  }

  return parseStreakRow(data);
}

export async function createStreak(userId: string, timezone: string = 'UTC'): Promise<Streak> {
  const now = Date.now();
  const newStreak = {
    id: v4(),
    user_id: userId,
    current_days: 0,
    longest_days: 0,
    last_qualifying_session_at: null,
    current_day_completed_at: null,
    frozen_until: null,
    shields_available: 0,
    grace_period_used: false,
    protection_disabled_until: null,
    timezone,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('streaks').insert(newStreak).select().single();

  if (error) {
    throw new RepositoryError('createStreak', error);
  }

  return parseStreakRow(data);
}

export async function updateStreak(
  userId: string,
  updates: Partial<{
    currentDays: number;
    longestDays: number;
    lastQualifyingSessionAt: number | null;
    currentDayCompletedAt: number | null;
    frozenUntil: number | null;
    shieldsAvailable: number;
    gracePeriodUsed: boolean;
    protectionDisabledUntil: number | null;
  }>,
): Promise<Streak> {
  const { data, error } = await supabase
    .from('streaks')
    .update({
      current_days: updates.currentDays,
      longest_days: updates.longestDays,
      last_qualifying_session_at: updates.lastQualifyingSessionAt,
      current_day_completed_at: updates.currentDayCompletedAt,
      frozen_until: updates.frozenUntil,
      shields_available: updates.shieldsAvailable,
      grace_period_used: updates.gracePeriodUsed,
      protection_disabled_until: updates.protectionDisabledUntil,
      updated_at: Date.now(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('updateStreak', error);
  }

  return parseStreakRow(data);
}

export async function recordShieldEarned(userId: string, source: string): Promise<void> {
  const { error } = await supabase.from('streak_shields').insert({
    id: v4(),
    user_id: userId,
    source,
    used: false,
    created_at: Date.now(),
  });

  if (error) {
    throw new RepositoryError('recordShieldEarned', error);
  }

  // Increment shields available count
  await supabase.rpc('increment_shield_count', { p_user_id: userId });
}

export async function recordShieldUsed(userId: string, shieldId: string): Promise<void> {
  const { error } = await supabase
    .from('streak_shields')
    .update({
      used: true,
      used_at: Date.now(),
    })
    .eq('id', shieldId);

  if (error) {
    throw new RepositoryError('recordShieldUsed', error);
  }
}

export async function getAvailableShield(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('streak_shields').select('id').eq('user_id', userId).eq('used', false).order('created_at', { ascending: true }).limit(1).maybeSingle();

  if (error) {
    throw new RepositoryError('getAvailableShield', error);
  }

  return data?.id || null;
}

export async function fetchActiveRepairQuest(userId: string): Promise<{
  id: string;
  userId: string;
  previousStreak: number;
  targetRestoreDays: number;
  sessionsCompleted: number;
  sessionsRequired: number;
  startedAt: number;
  expiresAt: number;
  status: string;
  sessionIds: string[];
} | null> {
  const { data, error } = await supabase.from('streak_repair_quests').select('*').eq('user_id', userId).eq('status', 'ACTIVE').single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchActiveRepairQuest', error);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    previousStreak: data.previous_streak,
    targetRestoreDays: data.target_restore_days,
    sessionsCompleted: data.sessions_completed,
    sessionsRequired: data.sessions_required,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
    status: data.status,
    sessionIds: data.session_ids || [],
  };
}

export async function saveRepairQuest(quest: { id: string; userId: string; previousStreak: number; targetRestoreDays: number; sessionsCompleted: number; sessionsRequired: number; startedAt: number; expiresAt: number; status: string; sessionIds: string[] }): Promise<void> {
  const { error } = await supabase.from('streak_repair_quests').insert({
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
  });

  if (error) {
    throw new RepositoryError('saveRepairQuest', error);
  }
}