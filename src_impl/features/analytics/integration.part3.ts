import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { TTLCache } from "../../shared/hardening";
import * as repository from "./repository";
import * as service from "./service";
import { generateInsights } from "./service";


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