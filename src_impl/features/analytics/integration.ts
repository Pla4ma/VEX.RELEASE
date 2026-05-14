/**
 * Analytics Integration Layer
 * Cross-system integration with events, analytics tracking, and feature coordination
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { TTLCache } from '../../shared/hardening';
import * as repository from './repository';
import * as service from './service';
import { generateInsights } from './service';

// Cache for integration state to prevent duplicate processing
const integrationCache = new TTLCache<{ processed: boolean }>(60000);

// Integration state tracking
interface IntegrationState {
  sessionCount: number;
  totalFocusTime: number;
  xpEarned: number;
  streakDays: number;
  lastSync: number;
}

const stateCache = new TTLCache<IntegrationState>(300000); // 5 minutes

/**
 * Track session completion with full analytics pipeline
 */
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

/**
 * Sync analytics data across systems
 */
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

/**
 * Get real-time analytics for dashboard
 */
export async function getRealtimeAnalytics(userId: string): Promise<{
  today: {
    sessions: number;
    xp: number;
    focusTime: number;
  };
  streak: number;
  level: number;
  recentInsights: Array<{
    id: string;
    type: string;
    title: string;
    severity: string;
  }>;
}> {
  // Try cache first
  const cached = stateCache.get(userId);
  const now = Date.now();

  // If cache is fresh (< 1 minute), use it
  if (cached && now - cached.lastSync < 60000) {
    return {
      today: {
        sessions: cached.sessionCount,
        xp: cached.xpEarned,
        focusTime: cached.totalFocusTime,
      },
      streak: cached.streakDays,
      level: 1, // Would be fetched from progression service
      recentInsights: [],
    };
  }

  // Fetch fresh data
  try {
    const [todayStats, insights] = await Promise.all([repository.fetchAggregatedStats(userId, 'today'), repository.fetchInsights(userId, { unreadOnly: false, limit: 3 })]);

    // Update cache
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
      extra: { userId },
    });

    // Return fallback from cache or defaults
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

/**
 * Handle boss encounter completion
 */
export async function trackBossEncounter(
  userId: string,
  bossData: {
    bossId: string;
    damageDealt: number;
    won: boolean;
    duration: number;
  },
): Promise<void> {
  try {
    await repository.bulkInsertAnalyticsEvents([
      {
        user_id: userId,
        metric_type: 'boss_damage_dealt',
        value: bossData.damageDealt,
        dimension_type: 'boss_type',
        dimension_value: bossData.bossId,
        timestamp: Date.now(),
      },
    ]);

    // Generate insight if boss was defeated
    if (bossData.won) {
      await generateInsights(userId);
    }

    eventBus.publish('analytics:data_refreshed', {
      userId,
      metrics: ['boss_damage_dealt'],
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { integration: 'analytics_boss' },
      extra: { userId, bossId: bossData.bossId },
    });
  }
}

/**
 * Track item crafting for analytics
 */
export async function trackItemCrafted(
  userId: string,
  itemData: {
    itemId: string;
    rarity: string;
    coinsSpent: number;
  },
): Promise<void> {
  try {
    await repository.bulkInsertAnalyticsEvents([
      {
        user_id: userId,
        metric_type: 'items_crafted',
        value: 1,
        dimension_type: 'item_type',
        dimension_value: itemData.rarity,
        timestamp: Date.now(),
      },
      {
        user_id: userId,
        metric_type: 'coins_spent',
        value: itemData.coinsSpent,
        dimension_type: 'item_type',
        dimension_value: itemData.rarity,
        timestamp: Date.now(),
      },
    ]);

    eventBus.publish('analytics:data_refreshed', {
      userId,
      metrics: ['items_crafted', 'coins_spent'],
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { integration: 'analytics_crafting' },
      extra: { userId, itemId: itemData.itemId },
    });
  }
}

// Helper functions
function updateIntegrationState(userId: string, updates: Partial<IntegrationState>): void {
  const current = stateCache.get(userId) || {
    sessionCount: 0,
    totalFocusTime: 0,
    xpEarned: 0,
    streakDays: 0,
    lastSync: 0,
  };

  stateCache.set(userId, {
    sessionCount: current.sessionCount + (updates.sessionCount || 0),
    totalFocusTime: current.totalFocusTime + (updates.totalFocusTime || 0),
    xpEarned: current.xpEarned + (updates.xpEarned || 0),
    streakDays: Math.max(current.streakDays, updates.streakDays || 0),
    lastSync: updates.lastSync || Date.now(),
  });
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) {
    return 'night';
  }
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 18) {
    return 'afternoon';
  }
  return 'evening';
}

/**
 * Cleanup old analytics data based on retention policy
 */
export async function cleanupAnalyticsData(userId: string, retentionDays: number = 90): Promise<{ deleted: number; errors: string[] }> {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const errors: string[] = [];

  try {
    await repository.deleteOldAnalyticsData(userId, cutoff);

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
      extra: { userId, retentionDays },
    });

    return { deleted: 0, errors };
  }
}

/**
 * Initialize analytics integration for a user
 */
export async function initializeAnalytics(userId: string): Promise<{
  success: boolean;
  initialData?: {
    todayStats: Record<string, number>;
    streak: number;
    level: number;
  };
  error?: string;
}> {
  try {
    // Perform initial sync
    const syncResult = await syncAnalyticsData(userId);

    if (!syncResult.success) {
      return {
        success: false,
        error: `Sync failed: ${syncResult.errors.join(', ')}`,
      };
    }

    // Get initial data
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
      extra: { userId },
    });

    return {
      success: false,
      error: message,
    };
  }
}
