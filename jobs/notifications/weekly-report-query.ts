import * as Sentry from '@sentry/node';
import { getSupabaseClient } from '../../src/config/supabase';
import type { WeeklyStats, WeekComparison } from './weekly-report-types';

export function getWeekBoundaries(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day;

  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function fetchWeeklyStats(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyStats> {
  const { data: sessions, error: sessionsError } = await getSupabaseClient()
    .from('sessions')
    .select('duration_seconds, grade, started_at')
    .eq('user_id', userId)
    .eq('status', 'COMPLETED')
    .gte('completed_at', weekStart.toISOString())
    .lte('completed_at', weekEnd.toISOString());

  if (sessionsError) {
    Sentry.captureException(sessionsError, { tags: { job: 'weekly-focus-report', operation: 'fetch-sessions' } });
  }

  const { data: streakData, error: streakError } = await getSupabaseClient()
    .from('user_streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  if (streakError) {
    Sentry.captureException(streakError, { tags: { job: 'weekly-focus-report', operation: 'fetch-streak' } });
  }

  const { data: bossDamage, error: bossError } = await getSupabaseClient()
    .from('boss_damage_logs')
    .select('damage_amount')
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString());

  if (bossError) {
    Sentry.captureException(bossError, { tags: { job: 'weekly-focus-report', operation: 'fetch-boss-damage' } });
  }

  const totalMinutes = (sessions ?? []).reduce(
    (sum, s) => sum + (s.duration_seconds || 0) / 60,
    0
  );

  const bestSession = (sessions ?? []).reduce((best, session) => {
    if (!best || (session.duration_seconds || 0) > best.duration) {
      return {
        duration: (session.duration_seconds || 0) / 60,
        grade: session.grade || 'C',
      };
    }
    return best;
  }, null as { duration: number; grade: string } | null);

  const bossDamageDealt = (bossDamage ?? []).reduce(
    (sum, d) => sum + (d.damage_amount || 0),
    0
  );

  return {
    userId,
    weekStart,
    weekEnd,
    totalMinutes: Math.round(totalMinutes),
    sessionsCompleted: sessions?.length ?? 0,
    xpEarned: Math.round(totalMinutes * 1.5),
    streakMaintained: (streakData?.current_streak ?? 0) > 0,
    streakDays: streakData?.current_streak ?? 0,
    bossDamageDealt,
    bestSession,
  };
}

export async function calculatePercentile(
  userMinutes: number,
  weekStart: Date,
  weekEnd: Date
): Promise<number> {
  try {
    const { data: allSessions, error } = await getSupabaseClient()
      .from('sessions')
      .select('user_id, duration_seconds')
      .eq('status', 'COMPLETED')
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString());

    if (error || !allSessions) {
      return 50;
    }

    const minutesByUser: Record<string, number> = {};
    for (const session of allSessions) {
      minutesByUser[session.user_id] =
        (minutesByUser[session.user_id] || 0) + (session.duration_seconds || 0) / 60;
    }

    const allMinutes = Object.values(minutesByUser).sort((a, b) => a - b);
    const totalUsers = allMinutes.length;

    if (totalUsers === 0) return 50;

    let position = 0;
    for (const minutes of allMinutes) {
      if (minutes < userMinutes) {
        position++;
      }
    }

    return Math.round((position / totalUsers) * 100);
  } catch (error) {
    Sentry.captureException(error, { tags: { job: 'weekly-focus-report', operation: 'calculate-percentile' } });
    return 50;
  }
}

export async function compareWeeks(
  userId: string,
  currentWeek: WeeklyStats
): Promise<WeekComparison> {
  const prevWeekStart = new Date(currentWeek.weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const prevWeekEnd = new Date(currentWeek.weekEnd);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

  const previousWeek = await fetchWeeklyStats(userId, prevWeekStart, prevWeekEnd);

  const changeMinutes = currentWeek.totalMinutes - previousWeek.totalMinutes;
  const changePercent = previousWeek.totalMinutes
    ? Math.round((changeMinutes / previousWeek.totalMinutes) * 100)
    : 0;

  const percentile = await calculatePercentile(
    currentWeek.totalMinutes,
    currentWeek.weekStart,
    currentWeek.weekEnd
  );

  return {
    currentWeek,
    previousWeek: previousWeek.sessionsCompleted > 0 ? previousWeek : null,
    changeMinutes,
    changePercent,
    percentile,
  };
}
