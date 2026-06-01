/**
 * Scheduler Repository — Data access for Smart Notification Scheduler.
 *
 * All Supabase queries used by the scheduler live here.
 * Business logic stays in the scheduler service files.
 */

import { getSupabaseClient } from '../../../config/supabase';
import { RepositoryError } from './shared';

export interface SessionTimeRow {
  started_at: string;
  timezone: string | null;
}

export interface SessionDurationRow {
  duration_seconds: number | null;
}

export interface StreakRow {
  current_streak: number;
}

export interface BossEncounterRow {
  boss_name: string;
  current_health: number;
  max_health: number;
}

export interface RivalRow {
  rival_name: string;
  rival_minutes: number;
  my_minutes: number;
}

export interface ComebackQuestRow {
  stage: string;
  days_absent: number;
}

export interface LeaderboardRow {
  user_id: string;
  focus_minutes: number;
}

export async function fetchCompletedSessionsInWindow(
  userId: string,
  fromDate: Date,
): Promise<SessionTimeRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('started_at, timezone')
    .eq('user_id', userId)
    .eq('status', 'COMPLETED')
    .gte('started_at', fromDate.toISOString())
    .order('started_at', { ascending: false });
  if (error) {throw new RepositoryError('fetchCompletedSessionsInWindow', error);}
  return (data as SessionTimeRow[]) ?? [];
}

export async function fetchCompletedSessionDurationsSince(
  userId: string,
  sinceDate: Date,
): Promise<SessionDurationRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .eq('status', 'COMPLETED')
    .gte('completed_at', sinceDate.toISOString());
  if (error) {throw new RepositoryError('fetchCompletedSessionDurationsSince', error);}
  return (data as SessionDurationRow[]) ?? [];
}

export async function fetchCurrentStreak(
  userId: string,
): Promise<StreakRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();
  if (error) {return null;}
  return data as StreakRow;
}

export async function fetchActiveBossEncounter(
  userId: string,
): Promise<BossEncounterRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('boss_encounters')
    .select('boss_name, current_health, max_health')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {return null;}
  return data as BossEncounterRow | null;
}

export async function fetchActiveRival(
  userId: string,
): Promise<RivalRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('rivals')
    .select('rival_name, rival_minutes, my_minutes')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) {return null;}
  return data as RivalRow | null;
}

export async function fetchActiveComebackQuest(
  userId: string,
): Promise<ComebackQuestRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('comeback_quests')
    .select('stage, days_absent')
    .eq('user_id', userId)
    .eq('all_quests_completed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {return null;}
  return data as ComebackQuestRow | null;
}

export async function fetchWeeklyLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('weekly_leaderboard')
    .select('user_id, focus_minutes')
    .order('focus_minutes', { ascending: false });
  if (error) {throw new RepositoryError('fetchWeeklyLeaderboard', error);}
  return (data as LeaderboardRow[]) ?? [];
}

export async function fetchNotificationCountToday(
  userId: string,
  todayStart: Date,
): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from('notification_rate_limits')
    .select('count', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('sent_at', todayStart.toISOString());
  if (error) {return 0;}
  return count ?? 0;
}

export async function recordNotificationSend(
  userId: string,
  notificationType: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase
    .from('notification_rate_limits')
    .insert({ user_id: userId, notification_type: notificationType, sent_at: new Date().toISOString() });
}

export interface NotificationEnabledUser {
  id: string;
  timezone: string | null;
}

export async function fetchNotificationEnabledUsers(): Promise<NotificationEnabledUser[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, timezone')
    .eq('notifications_enabled', true);
  if (error) {throw new RepositoryError('fetchNotificationEnabledUsers', error);}
  return (data as NotificationEnabledUser[]) ?? [];
}
