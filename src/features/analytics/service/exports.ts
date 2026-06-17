import { createExportJob, updateExportJobProgress, markExportJobFailed } from '../repository/export-jobs';
import { fetchTimeSeriesData } from '../repository/time-series';
import { uploadExportData, deleteExportData } from '../repository/storage';
import {
  withRetry,
  CircuitBreaker,
} from '../../../shared/hardening/retry';
import { classifyError } from '../../../shared/hardening/error-utils';
import { captureSilentFailure } from '../../../utils/silent-failure';
import { eventBus } from '../../../events/EventBus';
import * as Sentry from '@sentry/react-native';
import type { TimeRange, AnalyticsMetric } from '../schemas';

const exportCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeoutMs: 60000,
  halfOpenMaxCalls: 1,
  onStateChange: (state) => {
    Sentry.addBreadcrumb({
      category: 'analytics_export',
      message: `Export circuit breaker state: ${state}`,
      level: state === 'open' ? 'error' : 'warning',
    });
  },
});

export async function exportAnalyticsData(
  userId: string,
  format: 'json' | 'csv',
  dateRange: { start: number; end: number },
) {
  const exportJob = await createExportJob({
    id: crypto.randomUUID(),
    userId,
    status: 'pending',
    format,
    dataTypes: ['sessions', 'xp', 'streaks', 'insights'],
    dateRange,
    progress: 0,
    createdAt: Date.now(),
  });
  processExportJob(exportJob.id, userId, format, dateRange);
  return exportJob;
}

async function processExportJob(
  jobId: string,
  userId: string,
  format: 'json' | 'csv',
  dateRange: { start: number; end: number },
  dataTypes?: string[],
) {
  const startTime = Date.now();
  try {
    await exportCircuitBreaker.execute(async () => {
      await updateExportJobProgress(jobId, 5);
      const metricsToFetch = (dataTypes ?? ['sessions', 'xp', 'streaks']).map(
        (type) => {
          switch (type) {
            case 'sessions':
              return 'sessions_completed' as AnalyticsMetric;
            case 'xp':
              return 'xp_earned' as AnalyticsMetric;
            case 'streaks':
              return 'streak_days' as AnalyticsMetric;
            case 'boss':
              return 'boss_damage_dealt' as AnalyticsMetric;
            case 'items':
              return 'items_crafted' as AnalyticsMetric;
            default:
              return 'sessions_completed' as AnalyticsMetric;
          }
        },
      );
      await updateExportJobProgress(jobId, 10);
      const fetchResults = await withRetry(
        async () => {
          return await Promise.all(
            metricsToFetch.map((metric) =>
              fetchTimeSeriesData(
                userId,
                metric,
                'custom' as TimeRange,
                'day',
              ),
            ),
          );
        },
        {
          maxAttempts: 3,
          baseDelayMs: 1000,
          retryableErrors: [
            'network_error',
            'timeout',
            'temporarily_unavailable',
          ],
          onRetry: (attempt, error) => {
            Sentry.addBreadcrumb({
              category: 'analytics_export',
              message: `Retrying data fetch attempt ${attempt}`,
              level: 'warning',
              data: { jobId, error: error.message },
            });
          },
        },
      );
      await updateExportJobProgress(jobId, 40);
      const exportData: Record<string, unknown> = {
        metadata: {
          jobId,
          userId,
          generatedAt: Date.now(),
          dateRange,
          format,
          version: '2.0',
        },
      };
      metricsToFetch.forEach((metric, index) => {
        const result = fetchResults[index];
        if (result) {
          exportData[metric] = {
            points: result.points,
            summary: result.summary,
          };
        }
      });
      await updateExportJobProgress(jobId, 60);
      const uploadResult = await withRetry(
        async () => {
          return await uploadExportData(jobId, exportData, format, userId);
        },
        {
          maxAttempts: 3,
          baseDelayMs: 2000,
          retryableErrors: ['network_error', 'timeout', 'rate_limited'],
          onRetry: (attempt, error) => {
            Sentry.addBreadcrumb({
              category: 'analytics_export',
              message: `Retrying storage upload attempt ${attempt}`,
              level: 'warning',
              data: { jobId, error: error.message },
            });
          },
        },
      );
      await updateExportJobProgress(jobId, 90);
      await updateExportJobProgress(
        jobId,
        100,
        uploadResult.url,
        uploadResult.size,
      );
      const duration = Date.now() - startTime;
      Sentry.addBreadcrumb({
        category: 'analytics_export',
        message: 'Export completed successfully',
        level: 'info',
        data: { jobId, userId, format, fileSize: uploadResult.size, duration },
      });
      eventBus.publish('analytics:export_completed', {
        jobId,
        userId,
        fileUrl: uploadResult.url,
      });
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const classified =
      error instanceof Error
        ? classifyError(error)
        : { type: 'unknown', retryable: false, severity: 'high' };
    Sentry.captureException(error, {
      tags: {
        feature: 'analytics_export',
        error_type: classified.type,
        retryable: String(classified.retryable),
      },
      extra: { jobId, userId, format, duration: Date.now() - startTime },
    });
    await markExportJobFailed(jobId, errorMessage);
    try {
      await deleteExportData(jobId, userId, format);
    } catch (deleteError) {
      captureSilentFailure(deleteError, {
        feature: 'analytics',
        operation: 'network-fallback',
        type: 'network',
      });
    }
    eventBus.publish('analytics:export_failed', {
      jobId,
      userId,
      error: errorMessage,
    });
  }
}
