import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { TTLCache } from "../../shared/hardening";
import * as repository from "./repository";
import * as service from "./service";
import { generateInsights } from "./service";


export async function trackSessionCompleted(
  userId: string,
  sessionData: {
    sessionId: string;
    duration: number;
    xpEarned: number;
    quality: number;
    streakDay: number;
    bossActive: boolean;
    bossDamage?: number;
    itemsCrafted?: number;
    coinsEarned?: number;
  },
): Promise<void> {
  const cacheKey = `session-${sessionData.sessionId}`;

  // Prevent duplicate processing
  if (integrationCache.get(cacheKey)) {
    return;
  }
  integrationCache.set(cacheKey, { processed: true });

  try {
    // Update local state
    updateIntegrationState(userId, {
      sessionCount: 1,
      totalFocusTime: sessionData.duration,
      xpEarned: sessionData.xpEarned,
      streakDays: 0,
      lastSync: Date.now(),
    });

    // Emit analytics event
    eventBus.publish('analytics:data_refreshed', {
      userId,
      metrics: ['sessions_completed', 'xp_earned', 'streak_days'],
    });

    // Track with Sentry
    Sentry.addBreadcrumb({
      category: 'analytics_session',
      message: 'Session completed and tracked',
      level: 'info',
      data: {
        userId,
        sessionId: sessionData.sessionId,
        duration: sessionData.duration,
        xpEarned: sessionData.xpEarned,
      },
    });

    // Trigger insight generation if thresholds met
    if (sessionData.streakDay > 0 && sessionData.streakDay % 7 === 0) {
      await generateInsights(userId);
    }

    // Log to analytics_events table
    await repository.bulkInsertAnalyticsEvents([
      {
        user_id: userId,
        metric_type: 'sessions_completed',
        value: 1,
        dimension_type: 'session_category',
        dimension_value: sessionData.bossActive ? 'boss' : 'standard',
        timestamp: Date.now(),
      },
      {
        user_id: userId,
        metric_type: 'xp_earned',
        value: sessionData.xpEarned,
        dimension_type: 'session_category',
        dimension_value: sessionData.bossActive ? 'boss' : 'standard',
        timestamp: Date.now(),
      },
      {
        user_id: userId,
        metric_type: 'total_focus_time',
        value: sessionData.duration,
        dimension_type: 'time_of_day',
        dimension_value: getTimeOfDay(),
        timestamp: Date.now(),
      },
    ]);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { integration: 'analytics_session' },
      extra: { userId, sessionId: sessionData.sessionId },
    });
    throw error;
  }
}

export async function syncAnalyticsData(userId: string): Promise<{
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let synced = 0;
  let failed = 0;

  try {
    // Fetch current state from repository
    const [stats, insights, patterns] = await Promise.all([
      repository.fetchAggregatedStats(userId, 'today').catch((e) => {
        errors.push(`Stats fetch failed: ${e.message}`);
        failed++;
        return null;
      }),
      repository.fetchInsights(userId, { limit: 5 }).catch((e) => {
        errors.push(`Insights fetch failed: ${e.message}`);
        failed++;
        return [];
      }),
      repository.fetchDetectedPatterns(userId).catch((e) => {
        errors.push(`Patterns fetch failed: ${e.message}`);
        failed++;
        return [];
      }),
    ]);

    if (stats) {
      synced++;
    }

    // Emit sync completion event
    eventBus.publish('network:sync:complete', {
      synced,
      failed,
    });

    // Update state cache
    if (stats) {
      const currentState = stateCache.get(userId) || {
        sessionCount: 0,
        totalFocusTime: 0,
        xpEarned: 0,
        streakDays: 0,
        lastSync: 0,
      };

      stateCache.set(userId, {
        ...currentState,
        lastSync: Date.now(),
      });
    }

    return {
      success: failed === 0,
      synced,
      failed,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Sentry.captureException(error, {
      tags: { integration: 'analytics_sync' },
      extra: { userId },
    });

    return {
      success: false,
      synced,
      failed: failed + 1,
      errors: [...errors, message],
    };
  }
}