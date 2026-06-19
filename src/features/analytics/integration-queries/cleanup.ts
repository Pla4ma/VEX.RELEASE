import { deleteOldAnalyticsData } from '../repository/stats';
import * as Sentry from '@sentry/react-native';
import { hashUserId } from '../../../utils/sentry-privacy';

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