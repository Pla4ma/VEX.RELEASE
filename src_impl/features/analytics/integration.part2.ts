import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { TTLCache } from "../../shared/hardening";
import * as repository from "./repository";
import * as service from "./service";
import { generateInsights } from "./service";


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