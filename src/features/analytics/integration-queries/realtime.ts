import { stateCache } from '../integration-types';
import { fetchAggregatedStats } from '../repository/stats';
import { fetchInsights } from '../repository/insights';
import * as Sentry from '@sentry/react-native';
import { hashUserId } from '../../../utils/sentry-privacy';

export async function getRealtimeAnalytics(
  userId: string,
): Promise<{
  today: { sessions: number; xp: number; focusTime: number };
  streak: number;
  level: number;
  recentInsights: Array<{
    id: string;
    type: string;
    title: string;
    severity: string;
  }>;
}> {
  const cached = stateCache.get(userId);
  const now = Date.now();
  if (cached && now - cached.lastSync < 60000) {
    return {
      today: {
        sessions: cached.sessionCount,
        xp: cached.xpEarned,
        focusTime: cached.totalFocusTime,
      },
      streak: cached.streakDays,
      level: 1,
      recentInsights: [],
    };
  }
  try {
    const [todayStats, insights] = await Promise.all([
      fetchAggregatedStats(userId, 'today'),
      fetchInsights(userId, { unreadOnly: false, limit: 3 }),
    ]);
    stateCache.set(userId, {
      sessionCount: todayStats?.metrics?.sessions_completed?.value || 0,
      totalFocusTime: todayStats?.metrics?.total_focus_time?.value || 0,
      xpEarned: todayStats?.metrics?.xp_earned?.value || 0,
      streakDays: todayStats?.metrics?.streak_days?.value || 0,
      lastSync: now,
    });
    return {
      today: {
        sessions: todayStats?.metrics?.sessions_completed?.value || 0,
        xp: todayStats?.metrics?.xp_earned?.value || 0,
        focusTime: todayStats?.metrics?.total_focus_time?.value || 0,
      },
      streak: todayStats?.metrics?.streak_days?.value || 0,
      level: 1,
      recentInsights: insights.map((i: { id: string; type: string; title: string; severity: string }) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        severity: i.severity,
      })),
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { integration: 'analytics_realtime' },
      extra: { userId: hashUserId(userId) },
    });
    return {
      today: {
        sessions: cached?.sessionCount || 0,
        xp: cached?.xpEarned || 0,
        focusTime: cached?.totalFocusTime || 0,
      },
      streak: cached?.streakDays || 0,
      level: 1,
      recentInsights: [],
    };
  }
}