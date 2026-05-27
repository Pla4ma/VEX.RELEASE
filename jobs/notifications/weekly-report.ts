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
import * as Sentry from '@sentry/node';
import { getSupabaseClient } from '../../src/config/supabase';
import type { WeekComparison } from './weekly-report-types';
import { getWeekBoundaries, fetchWeeklyStats, compareWeeks } from './weekly-report-query';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

function formatWeeklyReport(comparison: WeekComparison): {
  title: string;
  body: string;
  data: Record<string, unknown>;
} {
  const { currentWeek, changeMinutes, changePercent, percentile } = comparison;

  let title = '📊 Your Weekly Focus Report';
  if (changePercent > 20) {
    title = '📈 Amazing week! Your focus report';
  } else if (changePercent < -20) {
    title = "📉 Let's bounce back — your week in review";
  }

  const parts: string[] = [
    `You focused for ${currentWeek.totalMinutes} minutes this week`,
    `(${currentWeek.sessionsCompleted} sessions)`,
  ];

  if (comparison.previousWeek) {
    const changeEmoji = changePercent >= 0 ? '📈' : '📉';
    parts.push(`\\n${changeEmoji} ${Math.abs(changePercent)}% vs last week`);
  }

  parts.push(`\\n🏆 Top ${100 - percentile}% of VEX users`);

  if (currentWeek.streakMaintained) {
    parts.push(`\\n🔥 ${currentWeek.streakDays}-day streak maintained`);
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

export const weeklyReportJob = task({
  id: 'weekly-focus-report',
  name: 'Weekly Focus Report',
  description: 'Send weekly focus report notifications every Sunday evening',
  cron: '0 18 * * 0',
  run: async (_payload, io) => {
    io.logger.info('Starting weekly focus report job');

    const now = new Date();
    const { start, end } = getWeekBoundaries(now);

    const { data: users, error: usersError } = await getSupabaseClient()
      .from('users')
      .select('id, timezone')
      .eq('notifications_enabled', true);

    if (usersError || !users) {
      Sentry.captureException(usersError, { tags: { job: 'weekly-focus-report', operation: 'fetch-users' } });
      return { success: false, error: usersError?.message };
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const currentWeek = await fetchWeeklyStats(user.id, start, end);

        if (currentWeek.sessionsCompleted === 0) {
          io.logger.info('Skipping inactive weekly report user', { userId: user.id });
          continue;
        }

        const comparison = await compareWeeks(user.id, currentWeek);
        const report = formatWeeklyReport(comparison);

        await getSupabaseClient().from('notifications').insert({
          user_id: user.id,
          type: 'WEEKLY_REPORT',
          title: report.title,
          body: report.body,
          data: report.data,
          status: 'PENDING',
          priority: 'NORMAL',
          created_at: new Date().toISOString(),
        });

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
        Sentry.captureException(error, { tags: { job: 'weekly-focus-report', operation: 'process-user', userId: user.id } });
        errorCount++;
      }
    }

    io.logger.info('Weekly report job complete', { sent: sentCount, errors: errorCount });

    return {
      success: true,
      sent: sentCount,
      errors: errorCount,
    };
  },
});

export default weeklyReportJob;
