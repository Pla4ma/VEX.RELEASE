import * as Sentry from '@sentry/react-native';
import { v4 } from '../../utils/uuid';
import type { Streak } from './schemas';
import { RepositoryError } from '../../lib/repository/error-handling';
import { supabase, parseStreakRow } from './repository-helpers';
import { tableColumns } from '../../lib/repository/tableColumns';

export async function fetchStreak(userId: string): Promise<Streak | null> {
  const { data, error } = await supabase
    .from('streaks')
    .select('id,user_id,current_days,longest_days,last_qualifying_session_at,current_day_completed_at,frozen_until,shields_available,grace_period_used,timezone,created_at,updated_at')    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchStreak', error);
  }
  return parseStreakRow(data);
}

export async function createStreak(
  userId: string,
  timezone: string = 'UTC',
): Promise<Streak> {
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
    timezone,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase
    .from('streaks')
    .insert(newStreak)
    .select(tableColumns('streaks'))
    .single();
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
      updated_at: Date.now(),
    })    .select(tableColumns('streaks'))
    .single();
  if (error) {
    throw new RepositoryError('updateStreak', error);
  }
  return parseStreakRow(data);
}

export async function recordShieldEarned(
  userId: string,
  source: string,
): Promise<void> {
  const { error } = await supabase
    .from('streak_shields')
    .insert({
      id: v4(),
      user_id: userId,
      source,
      used: false,
      created_at: Date.now(),
    });
  if (error) {
    throw new RepositoryError('recordShieldEarned:insert', error);
  }

  const { error: rpcError } = await supabase
    .rpc('increment_shield_count', { p_user_id: userId });
  if (rpcError) {
    Sentry.captureException(rpcError, {
      tags: { operation: 'increment_shield_count' },
      extra: { userId, source },
    });
    throw new RepositoryError('recordShieldEarned:increment', rpcError);
  }
}

export async function recordShieldUsed(
  userId: string,
  shieldId: string,
): Promise<void> {
  const { error } = await supabase
    .from('streak_shields')
    .update({ used: true, used_at: Date.now() })
    .eq('id', shieldId);
  if (error) {
    throw new RepositoryError('recordShieldUsed', error);
  }
}

export async function getAvailableShield(
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('streak_shields')
    .select('id')    .eq('used', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new RepositoryError('getAvailableShield', error);
  }
  return data?.id || null;
}
