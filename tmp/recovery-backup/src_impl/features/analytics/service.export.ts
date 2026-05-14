import { 
  ExportJobSchema, 
  AnalyticsMetric, 
  TimeRange 
} from './schemas';
import * as repository from './repository';
import { uploadExportData, deleteExportData } from './repository/storage';
import { eventBus } from '../../events';
import { withRetry, CircuitBreaker, classifyError } from '../../shared/hardening';
import * as Sentry from '@sentry/react-native';

/**
 * Analytics Service - Export
 * Handles asynchronous data export jobs with retry logic and circuit breaking.
 */

const exportCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeoutMs: 60000,
  halfOpenMaxCalls: 1,
  onStateChange: state => {
    Sentry.addBreadcrumb({ 
      category: 'analytics_export', 
      message: `Export circuit breaker state: ${state}`, 
      level: state === 'open' ? 'error' : 'warning' 
    });
  }
});

async function processExportJob(
  jobId: string, 
  userId: string, 
  format: 'json' | 'csv', 
  dateRange: { start: number; end: number }, 
  dataTypes?: string[]
): Promise<void> {
  const startTime = Date.now();
  try {
    await exportCircuitBreaker.execute(async () => {
      await repository.updateExportJobProgress(jobId, 5);
      
      const metricsToFetch = (dataTypes || ['sessions', 'xp', 'streaks']).map(type => {
        switch (type) {
          case 'sessions': return 'sessions_completed' as AnalyticsMetric;
          case 'xp': return 'xp_earned' as AnalyticsMetric;
          case 'streaks': return 'streak_days' as AnalyticsMetric;
          default: return 'sessions_completed' as AnalyticsMetric;
        }
      });

      await repository.updateExportJobProgress(jobId, 10);
      const fetchResults = await withRetry(async () => {
        return await Promise.all(metricsToFetch.map(metric => 
          repository.fetchTimeSeriesData(userId, metric, 'custom' as TimeRange, 'day')
        ));
      }, { maxAttempts: 3, baseDelayMs: 1000 });

      await repository.updateExportJobProgress(jobId, 40);
      const exportData: Record<string, any> = { 
        metadata: { jobId, userId, generatedAt: Date.now(), dateRange, format, version: '2.0' } 
      };
      
      metricsToFetch.forEach((metric, index) => {
        const result = fetchResults[index];
        exportData[metric] = { points: result.points, summary: result.summary };
      });

      await repository.updateExportJobProgress(jobId, 60);
      const uploadResult = await withRetry(async () => {
        return await uploadExportData(jobId, exportData, format, userId);
      }, { maxAttempts: 3, baseDelayMs: 2000 });

      await repository.updateExportJobProgress(jobId, 90);
      await repository.updateExportJobProgress(jobId, 100, uploadResult.url, uploadResult.size);

      eventBus.publish('analytics:export_completed', { jobId, userId, fileUrl: uploadResult.url });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await repository.markExportJobFailed(jobId, errorMessage);
    eventBus.publish('analytics:export_failed', { jobId, userId, error: errorMessage });
  }
}

export async function exportAnalyticsData(
  userId: string, 
  format: 'json' | 'csv', 
  dateRange: { start: number; end: number }
) {
  const jobId = crypto.randomUUID();
  const exportJob = await repository.createExportJob({
    id: jobId,
    userId,
    status: 'pending',
    format,
    dataTypes: ['sessions', 'xp', 'streaks', 'insights'],
    dateRange,
    progress: 0,
    createdAt: Date.now()
  });

  processExportJob(jobId, userId, format, dateRange);
  return exportJob;
}
