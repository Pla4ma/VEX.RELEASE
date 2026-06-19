import { eventBus } from '../../../events/EventBus';
import * as Sentry from '@sentry/react-native';
import { stateCache, DEFAULT_INTEGRATION_STATE } from '../integration-types';
import { fetchAggregatedStats, fetchDetectedPatterns, deleteOldAnalyticsData } from '../repository/stats';
import { fetchInsights } from '../repository/insights';
import { hashUserId } from '../../../utils/sentry-privacy';

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
    if (stats) {
      synced++;
    }

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