import type {
  TimeRange,
  AnalyticsMetric,
} from '../schemas';

export const analyticsKeys = {
  all: ['analytics'] as const,
  data: (userId: string, metrics: AnalyticsMetric[], timeRange: TimeRange) =>
    [...analyticsKeys.all, 'data', userId, metrics, timeRange] as const,
  trend: (userId: string, metric: AnalyticsMetric, timeRange: TimeRange) =>
    [...analyticsKeys.all, 'trend', userId, metric, timeRange] as const,
  insights: (userId: string, filters?: { unreadOnly?: boolean }) =>
    [...analyticsKeys.all, 'insights', userId, filters] as const,
  patterns: (userId: string) =>
    [...analyticsKeys.all, 'patterns', userId] as const,
  dashboard: (userId: string) =>
    [...analyticsKeys.all, 'dashboard', userId] as const,
  exportJobs: (userId: string) =>
    [...analyticsKeys.all, 'exports', userId] as const,
  preferences: (userId: string) =>
    [...analyticsKeys.all, 'preferences', userId] as const,
  summary: (userId: string, timeRange: TimeRange) =>
    [...analyticsKeys.all, 'summary', userId, timeRange] as const,
  sessionHeatmap: (userId: string, weeks: number) =>
    [...analyticsKeys.all, 'session-heatmap', userId, weeks] as const,
};
