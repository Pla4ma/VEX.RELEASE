import { eventBus } from '../../events/EventBus';
import * as Sentry from '@sentry/react-native';
import { stateCache, DEFAULT_INTEGRATION_STATE } from './integration-types';
import { fetchAggregatedStats, fetchDetectedPatterns, deleteOldAnalyticsData } from './repository/stats';
import { fetchInsights } from './repository/insights';
import { hashUserId } from '../../utils/sentry-privacy';


export async function syncAnalyticsData(
  userId: string,
): Promise<{
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let synced = 0;
  let failed = 0;
  try {
    const [stats, _insights, _patterns] = await Promise.all([
      fetchAggregatedStats(userId, 'today').catch((e) => {
        errors.push(`Stats fetch failed: ${e.message}`);
        failed++;
        return null;
      }),
      fetchInsights(userId, { limit: 5 }).catch((e) => {
        errors.push(`Insights fetch failed: ${e.message}`);
        failed++;
        return [];
      }),
      fetchDetectedPatterns(userId).catch((e) => {
        errors.push(`Patterns fetch failed: ${e.message}`);
        failed++;
        return [];
      }),
    ]);
    if (stats) {synced++;}

    eventBus.publish('network:sync:complete', { synced, failed });

    if (stats) {
      const currentState = stateCache.get(userId) || DEFAULT_INTEGRATION_STATE;
      stateCache.set(userId, { ...currentState, lastSync: Date.now() });
    }

    return { success: failed === 0, synced, failed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Sentry.captureException(error, {
      tags: { integration: 'analytics_sync' },
      extra: { userId: hashUserId(userId) },
    });
    return {
      success: false,
      synced,
      failed: failed + 1,
      errors: [...errors, message],
    };
  }
}

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
      recentInsights: insights.map((i) => ({
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

export async function cleanupAnalyticsData(
  userId: string,
  retentionDays: number = 90,
): Promise<{ deleted: number; errors: string[] }> {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const errors: string[] = [];
  try {
    await deleteOldAnalyticsData(userId, cutoff);
    Sentry.addBreadcrumb({
      category: 'analytics_cleanup',
      message: `Cleaned up analytics data older than ${retentionDays} days`,
      level: 'info',
      data: { userId, retentionDays },
    });
    return { deleted: 1, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    errors.push(message);
    Sentry.captureException(error, {
      tags: { integration: 'analytics_cleanup' },
      extra: { userId: hashUserId(userId), retentionDays },
    });
    return { deleted: 0, errors };
  }
}

export async function initializeAnalytics(
  userId: string,
): Promise<{
  success: boolean;
  initialData?: {
    todayStats: Record<string, number>;
    streak: number;
    level: number;
  };
  error?: string;
}> {
  try {
    const syncResult = await syncAnalyticsData(userId);
    if (!syncResult.success) {
      return {
        success: false,
        error: `Sync failed: ${syncResult.errors.join(', ')}`,
      };
    }
    const realtime = await getRealtimeAnalytics(userId);
    return {
      success: true,
      initialData: {
        todayStats: {
          sessions: realtime.today.sessions,
          xp: realtime.today.xp,
          focusTime: realtime.today.focusTime,
        },
        streak: realtime.streak,
        level: realtime.level,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Sentry.captureException(error, {
      tags: { integration: 'analytics_init' },
      extra: { userId: hashUserId(userId) },
    });
    return { success: false, error: message };
  }
}
