import { syncAnalyticsData } from './sync';
import { getRealtimeAnalytics } from './realtime';
import * as Sentry from '@sentry/react-native';
import { hashUserId } from '../../../utils/sentry-privacy';

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