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
import type { AnalyticsMetric } from '../schemas';

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

const CATEGORY_METRICS: Record<string, AnalyticsMetric[]> = {
  sessions: ['sessions_completed', 'sessions_abandoned', 'total_focus_time', 'average_session_duration'],
  analytics: ['streak_days', 'longest_streak', 'xp_earned', 'level_progression', 'social_interactions', 'squad_contributions', 'daily_active', 'weekly_active', 'retention_rate'],
  achievements: ['boss_damage_dealt', 'bosses_defeated', 'rewards_claimed', 'challenges_completed'],
  all: ['sessions_completed', 'sessions_abandoned', 'total_focus_time', 'average_session_duration', 'streak_days', 'longest_streak', 'xp_earned', 'level_progression', 'boss_damage_dealt', 'bosses_defeated', 'rewards_claimed', 'coins_earned', 'coins_spent', 'gems_earned', 'gems_spent', 'items_crafted', 'challenges_completed', 'social_interactions', 'squad_contributions', 'daily_active', 'weekly_active', 'retention_rate'],
};

export function resolveExportMetrics(dataTypes: string[]): AnalyticsMetric[] {
  const metrics = dataTypes.flatMap((type) => {
    const categoryMetrics = CATEGORY_METRICS[type];
    if (!categoryMetrics) { throw new Error(`Unsupported export category: ${type}`); }
    return categoryMetrics;
  });
  return [...new Set(metrics)];
}

type ExportPoint = { timestamp: number; value: number; dimension?: string; metadata?: Record<string, unknown> };
type ExportResult = { points: ExportPoint[]; summary: unknown };

export function buildExportData(
  fetchResults: (ExportResult | undefined)[],
  metricsToFetch: AnalyticsMetric[],
  jobId: string,
  userId: string,
  dateRange: { start: number; end: number },
  format: 'json' | 'csv',
  includeMetadata: boolean,
): unknown {
  const metadata = { jobId, userId, generatedAt: Date.now(), dateRange, format, version: '2.0' };
  if (format === 'csv') {
    const rows: Record<string, unknown>[] = [];
    const csvMetadata = includeMetadata
      ? { jobId, userId, generatedAt: metadata.generatedAt, start: dateRange.start, end: dateRange.end, format, version: metadata.version }
      : {};
    metricsToFetch.forEach((metric, index) => {
      fetchResults[index]?.points.forEach(({ metadata: pointMetadata, ...point }) => {
        rows.push({
          recordType: 'metric', metric, timestamp: point.timestamp, value: point.value,
          dimension: point.dimension ?? '',
          pointMetadata: includeMetadata && pointMetadata ? JSON.stringify(pointMetadata) : '',
          ...csvMetadata,
        });
      });
    });
    if (includeMetadata) {
      rows.unshift({
        recordType: 'metadata', metric: '', timestamp: '', value: '', dimension: '',
        pointMetadata: '', ...csvMetadata,
      });
    }
    return rows;
  }
  const exportData: Record<string, unknown> = {};
  if (includeMetadata) { exportData.metadata = metadata; }
  metricsToFetch.forEach((metric, index) => {
    const result = fetchResults[index];
    if (result) {
      const points = includeMetadata
        ? result.points
        : result.points.map(({ metadata: _metadata, ...point }) => point);
      exportData[metric] = { points, summary: result.summary };
    }
  });
  return exportData;
}

function handleExportError(
  error: unknown,
  jobId: string,
  userId: string,
  format: string,
  startTime: number,
): { errorMessage: string; classified: { type: string; retryable: boolean; severity: string } } {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const classified = error instanceof Error
    ? classifyError(error)
    : { type: 'unknown', retryable: false, severity: 'high' };
  Sentry.captureException(error, {
    tags: { feature: 'analytics_export', error_type: classified.type, retryable: String(classified.retryable) },
    extra: { jobId, userId, format, duration: Date.now() - startTime },
  });
  return { errorMessage, classified };
}

export async function exportAnalyticsData(
  userId: string,
  format: 'json' | 'csv',
  dateRange: { start: number; end: number },
  dataTypes: string[],
  includeMetadata = true,
) {
  const exportJob = await createExportJob({
    id: crypto.randomUUID(),
    userId,
    status: 'pending',
    format,
    dataTypes,
    dateRange,
    progress: 0,
    createdAt: Date.now(),
  });
  processExportJob(exportJob.id, userId, format, dateRange, dataTypes, includeMetadata);
  return exportJob;
}

async function processExportJob(
  jobId: string,
  userId: string,
  format: 'json' | 'csv',
  dateRange: { start: number; end: number },
  dataTypes: string[],
  includeMetadata: boolean,
) {
  const startTime = Date.now();
  try {
    await exportCircuitBreaker.execute(async () => {
      await updateExportJobProgress(jobId, 5);
      const metricsToFetch = resolveExportMetrics(dataTypes);
      const [, fetchResults] = await Promise.all([
        updateExportJobProgress(jobId, 10),
        withRetry(
          async () => Promise.all(metricsToFetch.map((metric) => fetchTimeSeriesData(userId, metric, 'custom', 'day', undefined, undefined, dateRange))),
          { maxAttempts: 3, baseDelayMs: 1000, retryableErrors: ['network_error', 'timeout', 'temporarily_unavailable'], onRetry: (attempt, error) => { Sentry.addBreadcrumb({ category: 'analytics_export', message: `Retrying data fetch attempt ${attempt}`, level: 'warning', data: { jobId, error: error.message } }); } },
        ),
      ]);
      await updateExportJobProgress(jobId, 40);
      const exportData = buildExportData(fetchResults, metricsToFetch, jobId, userId, dateRange, format, includeMetadata);
      const [, uploadResult] = await Promise.all([
        updateExportJobProgress(jobId, 60),
        withRetry(
          async () => uploadExportData(jobId, exportData, format, userId),
          { maxAttempts: 3, baseDelayMs: 2000, retryableErrors: ['network_error', 'timeout', 'rate_limited'], onRetry: (attempt, error) => { Sentry.addBreadcrumb({ category: 'analytics_export', message: `Retrying storage upload attempt ${attempt}`, level: 'warning', data: { jobId, error: error.message } }); } },
        ),
      ]);
      await updateExportJobProgress(jobId, 90);
      await updateExportJobProgress(jobId, 100, uploadResult.url, uploadResult.size);
      Sentry.addBreadcrumb({ category: 'analytics_export', message: 'Export completed successfully', level: 'info', data: { jobId, userId, format, fileSize: uploadResult.size, duration: Date.now() - startTime } });
      eventBus.publish('analytics:export_completed', { jobId, userId, fileUrl: uploadResult.url });
    });
  } catch (error) {
    const { errorMessage } = handleExportError(error, jobId, userId, format, startTime);
    await markExportJobFailed(jobId, errorMessage);
    try { await deleteExportData(jobId, userId, format); } catch (deleteError) { captureSilentFailure(deleteError, { feature: 'analytics', operation: 'network-fallback', type: 'network' }); }
    eventBus.publish('analytics:export_failed', { jobId, userId, error: errorMessage });
  }
}
