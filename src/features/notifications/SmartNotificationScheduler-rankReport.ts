/**
 * Smart Notification Scheduler — Rank Report & Rate Limiting
 *
 * Weekly leaderboard notification generator plus notification rate limit helpers.
 */

import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import type { NotificationContent } from './SmartNotificationScheduler-types';
import { MAX_NOTIFICATIONS_PER_DAY } from './SmartNotificationScheduler-types';

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
    const { data: sessions, error } = await getSupabaseClient()
      .from('sessions')
      .select('duration_seconds')
      .eq('user_id', userId)
      .eq('status', 'COMPLETED')
      .gte('completed_at', weekStart.toISOString());
    if (error) {
      return null;
    }
    const weeklyMinutes = (sessions || []).reduce(
      (sum, s) => sum + (s.duration_seconds || 0) / 60,
      0,
    );
    const { data: leaderboard, error: lbError } = await getSupabaseClient()
      .from('weekly_leaderboard')
      .select('user_id, focus_minutes')
      .order('focus_minutes', { ascending: false });
    if (lbError || !leaderboard) {
      return null;
    }
    const userIndex = leaderboard.findIndex(
      (entry) => entry.user_id === userId,
    );
    const totalUsers = leaderboard.length;
    const rankPosition = userIndex >= 0 ? userIndex + 1 : totalUsers;
    const percentile =
      totalUsers > 0 ? ((totalUsers - rankPosition) / totalUsers) * 100 : 0;
    const { tier, tierIcon, sessionsToNext } = calculateTier(
      percentile,
      totalUsers,
      rankPosition,
    );
    let body = `You're in ${tier} tier this week — top ${Math.round(percentile)}% of VEX users. Keep the focus Sunday!`;
    if (sessionsToNext && sessionsToNext > 0) {
      body += ` About ${sessionsToNext} more sessions to reach the next tier.`;
    }
    return {
      title: `Weekly Rank: ${tierIcon} ${tier}`,
      body,
      data: {
        type: 'RANK_REPORT',
        tier,
        percentile: Math.round(percentile),
        weeklyMinutes: Math.round(weeklyMinutes),
        rankPosition,
        totalUsers,
      },
    };
  } catch (error) {
    return null;
  }
}

function calculateTier(
  percentile: number,
  totalUsers: number,
  rankPosition: number,
): { tier: string; tierIcon: string; sessionsToNext: number | null } {
  const notInRank = totalUsers - rankPosition;
  if (percentile >= 99) {
    return { tier: 'LEGEND', tierIcon: '👑', sessionsToNext: null };
  }
  if (percentile >= 95) {
    return {
      tier: 'DIAMOND',
      tierIcon: '💎',
      sessionsToNext: Math.ceil((0.99 * totalUsers - notInRank) * 25),
    };
  }
  if (percentile >= 90) {
    return {
      tier: 'PLATINUM',
      tierIcon: '⭐',
      sessionsToNext: Math.ceil((0.95 * totalUsers - notInRank) * 25),
    };
  }
  if (percentile >= 75) {
    return {
      tier: 'GOLD',
      tierIcon: '🥇',
      sessionsToNext: Math.ceil((0.9 * totalUsers - notInRank) * 25),
    };
  }
  if (percentile >= 50) {
    return {
      tier: 'SILVER',
      tierIcon: '🥈',
      sessionsToNext: Math.ceil((0.75 * totalUsers - notInRank) * 25),
    };
  }
  return {
    tier: 'BRONZE',
    tierIcon: '🥉',
    sessionsToNext: Math.ceil((0.5 * totalUsers - notInRank) * 25),
  };
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count, error } = await getSupabaseClient()
      .from('notifications_sent')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('notification_type', 'SMART_REMINDER')
      .gte('sent_at', today.toISOString());
    if (error) {
      debug.warn('Error checking rate limit', error);
      return false;
    }
    return (count ?? 0) < MAX_NOTIFICATIONS_PER_DAY;
  } catch (error) {
    return false;
  }
}

export async function recordNotificationSent(userId: string): Promise<void> {
  try {
    await getSupabaseClient()
      .from('notifications_sent')
      .insert({
        user_id: userId,
        notification_type: 'SMART_REMINDER',
        sent_at: new Date().toISOString(),
      });
  } catch (error) {
    debug.warn(
      'Failed to record notification',
      error instanceof Error ? error : undefined,
    );
  }
}
