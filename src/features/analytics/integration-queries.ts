import { eventBus } from '../../events/EventBus';
import * as repository from './repository';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export interface RealtimeAnalytics {
  today: {
    sessions: number;
    xp: number;
    focusTime: number;
  };
  streak: number;
  recentInsights: Array<{
    id: string;
    type: string;
    title: string;
    severity: string;
  }>;
}

export interface InitializeResult {
  success: boolean;
  initialData?: RealtimeAnalytics;
  error?: string;
}

export async function syncAnalyticsData(userId: string): Promise<SyncResult> {
  const errors: string[] = [];
  let synced = 0;
  let failed = 0;

  try {
    await repository.fetchAggregatedStats(userId, 'today');
    synced++;
  } catch (error) {
    failed++;
    errors.push(error instanceof Error ? error.message : String(error));
  }

  try {
    await repository.fetchInsights(userId);
    synced++;
  } catch (error) {
    failed++;
    errors.push(error instanceof Error ? error.message : String(error));
  }

  try {
    await repository.fetchDetectedPatterns(userId);
    synced++;
  } catch (error) {
    failed++;
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const success = failed === 0;

  if (success) {
    eventBus.publish('network:sync:complete', {
      synced,
      failed,
    });
  }

  return { success, synced, failed, errors };
}

export async function getRealtimeAnalytics(
  userId: string,
): Promise<RealtimeAnalytics> {
  const defaultResult: RealtimeAnalytics = {
    today: { sessions: 0, xp: 0, focusTime: 0 },
    streak: 0,
    recentInsights: [],
  };

  try {
    const [stats, insights] = await Promise.all([
      repository.fetchAggregatedStats(userId, 'today').catch(() => null),
      repository.fetchInsights(userId).catch(() => []),
    ]);

    if (!stats) {
      return defaultResult;
    }

    const metrics = (stats as Record<string, unknown>).metrics as
      | Record<string, { value: number }>
      | undefined;

    return {
      today: {
        sessions: metrics?.sessions_completed?.value ?? 0,
        xp: metrics?.xp_earned?.value ?? 0,
        focusTime: metrics?.total_focus_time?.value ?? 0,
      },
      streak: metrics?.streak_days?.value ?? 0,
      recentInsights: (insights as Array<{
        id: string;
        type: string;
        title: string;
        severity: string;
      }>) ?? [],
    };
  } catch {
    return defaultResult;
  }
}

export async function cleanupAnalyticsData(userId: string): Promise<void> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await repository.deleteOldAnalyticsData(userId, thirtyDaysAgo);
}

export async function initializeAnalytics(
  userId: string,
): Promise<InitializeResult> {
  try {
    const [stats, insights, patterns] = await Promise.all([
      repository.fetchAggregatedStats(userId, 'today'),
      repository.fetchInsights(userId),
      repository.fetchDetectedPatterns(userId),
    ]);

    const metrics = (stats as Record<string, unknown> & { metrics?: Record<string, { value: number }> }).metrics;

    return {
      success: true,
      initialData: {
        today: {
          sessions: 0,
          xp: 0,
          focusTime: 0,
        },
        streak: 0,
        recentInsights: (insights as Array<{
          id: string;
          type: string;
          title: string;
          severity: string;
        }>) ?? [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
