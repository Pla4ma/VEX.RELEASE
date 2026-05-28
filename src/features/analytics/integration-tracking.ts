import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { integrationCache } from "./integration-types";
import * as repository from "./repository";
import { generateInsights } from "./service";
import { updateIntegrationState, getTimeOfDay } from "./integration-helpers";

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
  if (integrationCache.get(cacheKey)) return;
  integrationCache.set(cacheKey, { processed: true });

  try {
    updateIntegrationState(userId, {
      sessionCount: 1,
      totalFocusTime: sessionData.duration,
      xpEarned: sessionData.xpEarned,
      streakDays: 0,
      lastSync: Date.now(),
    });

    eventBus.publish("analytics:data_refreshed", {
      userId,
      metrics: ["sessions_completed", "xp_earned", "streak_days"],
    });

    Sentry.addBreadcrumb({
      category: "analytics_session",
      message: "Session completed and tracked",
      level: "info",
      data: {
        userId,
        sessionId: sessionData.sessionId,
        duration: sessionData.duration,
        xpEarned: sessionData.xpEarned,
      },
    });

    if (sessionData.streakDay > 0 && sessionData.streakDay % 7 === 0) {
      await generateInsights(userId);
    }

    await repository.bulkInsertAnalyticsEvents([
      {
        user_id: userId,
        metric_type: "sessions_completed",
        value: 1,
        dimension_type: "session_category",
        dimension_value: sessionData.bossActive ? "boss" : "standard",
        timestamp: Date.now(),
      },
      {
        user_id: userId,
        metric_type: "xp_earned",
        value: sessionData.xpEarned,
        dimension_type: "session_category",
        dimension_value: sessionData.bossActive ? "boss" : "standard",
        timestamp: Date.now(),
      },
      {
        user_id: userId,
        metric_type: "total_focus_time",
        value: sessionData.duration,
        dimension_type: "time_of_day",
        dimension_value: getTimeOfDay(),
        timestamp: Date.now(),
      },
    ]);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { integration: "analytics_session" },
      extra: { userId, sessionId: sessionData.sessionId },
    });
    throw error;
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
        metric_type: "boss_damage_dealt",
        value: bossData.damageDealt,
        dimension_type: "boss_type",
        dimension_value: bossData.bossId,
        timestamp: Date.now(),
      },
    ]);
    if (bossData.won) await generateInsights(userId);

    eventBus.publish("analytics:data_refreshed", {
      userId,
      metrics: ["boss_damage_dealt"],
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { integration: "analytics_boss" },
      extra: { userId, bossId: bossData.bossId },
    });
  }
}

export async function trackItemCrafted(
  userId: string,
  itemData: { itemId: string; rarity: string; coinsSpent: number },
): Promise<void> {
  try {
    await repository.bulkInsertAnalyticsEvents([
      {
        user_id: userId,
        metric_type: "items_crafted",
        value: 1,
        dimension_type: "item_type",
        dimension_value: itemData.rarity,
        timestamp: Date.now(),
      },
      {
        user_id: userId,
        metric_type: "coins_spent",
        value: itemData.coinsSpent,
        dimension_type: "item_type",
        dimension_value: itemData.rarity,
        timestamp: Date.now(),
      },
    ]);
    eventBus.publish("analytics:data_refreshed", {
      userId,
      metrics: ["items_crafted", "coins_spent"],
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { integration: "analytics_crafting" },
      extra: { userId, itemId: itemData.itemId },
    });
  }
}
