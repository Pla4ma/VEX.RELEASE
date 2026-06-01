/**
 * Smart Notification Scheduler — Rank Report & Rate Limiting
 *
 * Weekly leaderboard notification generator plus notification rate limit helpers.
 */

import { createDebugger } from '../../utils/debug';
import type { NotificationContent } from './SmartNotificationScheduler-types';
import { MAX_NOTIFICATIONS_PER_DAY } from './SmartNotificationScheduler-types';
import {
  fetchCompletedSessionDurationsSince,
  fetchWeeklyLeaderboard,
  fetchNotificationCountToday,
  recordNotificationSend,
} from './repository';

const debug = createDebugger('notifications:smart-scheduler');

export async function generateRankReportNotification(
  userId: string,
): Promise<NotificationContent | null> {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    if (dayOfWeek !== 0 || hour < 19 || hour >= 20) {
      return null;
    }
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const sessions = await fetchCompletedSessionDurationsSince(userId, weekStart);
    const weeklyMinutes = sessions.reduce(
      (sum, s) => sum + (s.duration_seconds || 0) / 60,
      0,
    );
    const leaderboard = await fetchWeeklyLeaderboard();
    const userIndex = leaderboard.findIndex(
      (entry) => entry.user_id === userId,
    );
    const totalUsers = leaderboard.length;
    const rankPosition = userIndex >= 0 ? userIndex + 1 : totalUsers;
    if (rankPosition <= 3) {
      return {
        title: `🏆 You're #${rankPosition} this week!`,
        body: `Out of ${totalUsers} users, you're in the top 3. Keep it up!`,
        data: { type: 'RANK_TOP', rank: rankPosition, total: totalUsers },
      };
    }
    const percentile = Math.round((rankPosition / totalUsers) * 100);
    return {
      title: `📊 Weekly Rank: #${rankPosition}`,
      body: `You're in the top ${percentile}% this week with ${Math.round(weeklyMinutes)} minutes focused.`,
      data: {
        type: 'RANK_REPORT',
        rank: rankPosition,
        total: totalUsers,
        weeklyMinutes: Math.round(weeklyMinutes),
      },
    };
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  userId: string,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const count = await fetchNotificationCountToday(userId, todayStart);
    const remaining = MAX_NOTIFICATIONS_PER_DAY - count;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
  } catch (error) {
    debug.warn('Rate limit check failed, allowing:', error);
    return { allowed: true, remaining: MAX_NOTIFICATIONS_PER_DAY };
  }
}

export async function recordNotificationSent(
  userId: string,
  notificationType: string,
): Promise<void> {
  try {
    await recordNotificationSend(userId, notificationType);
  } catch (error) {
    debug.warn('Failed to record notification send:', error);
  }
}
