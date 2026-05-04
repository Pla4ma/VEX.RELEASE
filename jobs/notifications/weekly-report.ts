/**
 * WeeklyReportJob
 *
 * Trigger.dev job that sends weekly focus report notifications every Sunday evening.
 * Contains: total focus time, sessions completed, XP earned, streak status,
 * boss damage, best session, comparison to previous week, percentile.
 *
 * @phase 11.6
 */

import { task } from '@trigger.dev/sdk/v3';
import { getSupabaseClient } from '../../src/config/supabase';

// ============================================================================
// Types
// ============================================================================

interface WeeklyStats {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  totalMinutes: number;
  sessionsCompleted: number;
  xpEarned: number;
  streakMaintained: boolean;
  streakDays: number;
  bossDamageDealt: number;
  bestSession: {
    duration: number;
    grade: string;
  } | null;
}

interface WeekComparison {
  currentWeek: WeeklyStats;
  previousWeek: WeeklyStats | null;
  changeMinutes: number;
  changePercent: number;
  percentile: number; // 0-100
}

// ============================================================================
// Stats Calculation
// ============================================================================

/**
 * Get week boundaries (Sunday to Saturday)
 */
function getWeekBoundaries(date: Date): { start: Date; end: Date } {
  const day = date.getDay(); // 0 = Sunday
  const diff = date.getDate() - day;

  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Fetch weekly stats for a user
 */
async function fetchWeeklyStats(
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
    console.error('Error fetching sessions:', sessionsError);
  }

  const { data: streakData, error: streakError } = await getSupabaseClient()
    .from('user_streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  if (streakError) {
    console.error('Error fetching streak:', streakError);
  }

  const { data: bossDamage, error: bossError } = await getSupabaseClient()
    .from('boss_damage_logs')
    .select('damage_amount')
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString());

  if (bossError) {
    console.error('Error fetching boss damage:', bossError);
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
    xpEarned: Math.round(totalMinutes * 1.5), // Approximate XP
    streakMaintained: (streakData?.current_streak ?? 0) > 0,
    streakDays: streakData?.current_streak ?? 0,
    bossDamageDealt,
    bestSession,
  };
}

/**
 * Calculate percentile rank compared to all users
 */
async function calculatePercentile(
  userMinutes: number,
  weekStart: Date,
  weekEnd: Date
): Promise<number> {
  try {
    // Get all users' focus time for the week
    const { data: allSessions, error } = await getSupabaseClient()
      .from('sessions')
      .select('user_id, duration_seconds')
      .eq('status', 'COMPLETED')
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString());

    if (error || !allSessions) {
      return 50; // Default to median on error
    }

    // Aggregate by user
    const userMinutes: Record<string, number> = {};
    for (const session of allSessions) {
      userMinutes[session.user_id] =
        (userMinutes[session.user_id] || 0) + (session.duration_seconds || 0) / 60;
    }

    const allMinutes = Object.values(userMinutes).sort((a, b) => a - b);
    const totalUsers = allMinutes.length;

    if (totalUsers === 0) return 50;

    // Find position
    let position = 0;
    for (const minutes of allMinutes) {
      if (minutes < userMinutes) {
        position++;
      }
    }

    return Math.round((position / totalUsers) * 100);
  } catch (error) {
    console.error('Error calculating percentile:', error);
    return 50;
  }
}

/**
 * Compare current week to previous week
 */
async function compareWeeks(
  userId: string,
  currentWeek: WeeklyStats
): Promise<WeekComparison> {
  // Get previous week boundaries
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

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Format report content for notification
 */
function formatWeeklyReport(comparison: WeekComparison): {
  title: string;
  body: string;
  data: Record<string, unknown>;
} {
  const { currentWeek, changeMinutes, changePercent, percentile } = comparison;

  // Title based on performance
  let title = '📊 Your Weekly Focus Report';
  if (changePercent > 20) {
    title = '📈 Amazing week! Your focus report';
  } else if (changePercent < -20) {
    title = "📉 Let's bounce back — your week in review";
  }

  // Build body
  const parts: string[] = [
    `You focused for ${currentWeek.totalMinutes} minutes this week`,
    `(${currentWeek.sessionsCompleted} sessions)`,
  ];

  if (comparison.previousWeek) {
    const changeEmoji = changePercent >= 0 ? '📈' : '📉';
    parts.push(`\n${changeEmoji} ${Math.abs(changePercent)}% vs last week`);
  }

  parts.push(`\n🏆 Top ${100 - percentile}% of VEX users`);

  if (currentWeek.streakMaintained) {
    parts.push(`\n🔥 ${currentWeek.streakDays}-day streak maintained`);
  }

  return {
    title,
    body: parts.join(''),
    data: {
      type: 'WEEKLY_REPORT',
      totalMinutes: currentWeek.totalMinutes,
      sessions: currentWeek.sessionsCompleted,
      percentile,
    },
  };
}

// ============================================================================
// Trigger.dev Job
// ============================================================================

export const weeklyReportJob = task({
  id: 'weekly-focus-report',
  name: 'Weekly Focus Report',
  description: 'Send weekly focus report notifications every Sunday evening',
  // Run every Sunday at 6 PM
  cron: '0 18 * * 0',
  run: async () => {
    console.log('Starting weekly focus report job...');

    // Get current week boundaries
    const now = new Date();
    const { start, end } = getWeekBoundaries(now);

    // Get all users with notifications enabled
    const { data: users, error: usersError } = await getSupabaseClient()
      .from('users')
      .select('id, timezone')
      .eq('notifications_enabled', true);

    if (usersError || !users) {
      console.error('Failed to fetch users:', usersError);
      return { success: false, error: usersError?.message };
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Fetch stats
        const currentWeek = await fetchWeeklyStats(user.id, start, end);

        // Skip if no activity
        if (currentWeek.sessionsCompleted === 0) {
          console.log(`Skipping user ${user.id} - no activity`);
          continue;
        }

        // Compare weeks
        const comparison = await compareWeeks(user.id, currentWeek);

        // Format report
        const report = formatWeeklyReport(comparison);

        // Send notification (placeholder for actual push notification)
        console.log(`Would send to ${user.id}:`, report.title);

        // In production:
        // await sendPushNotification(user.id, {
        //   title: report.title,
        //   body: report.body,
        //   data: report.data,
        // });

        // Record sent
        await getSupabaseClient().from('notifications_sent').insert({
          user_id: user.id,
          notification_type: 'WEEKLY_REPORT',
          sent_at: new Date().toISOString(),
          metadata: {
            total_minutes: currentWeek.totalMinutes,
            sessions: currentWeek.sessionsCompleted,
            percentile: comparison.percentile,
          },
        });

        sentCount++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Weekly report job complete. Sent: ${sentCount}, Errors: ${errorCount}`);

    return {
      success: true,
      sent: sentCount,
      errors: errorCount,
    };
  },
});

export default weeklyReportJob;
