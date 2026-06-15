import { useQuery } from '@tanstack/react-query';
import * as service from '../service';
import { fetchInsights } from '../repository/insights';
import { fetchDetectedPatterns, fetchAnalyticsPreferences } from '../repository/stats';
import { fetchDefaultDashboard } from '../repository/dashboard';
import { fetchExportJobs } from '../repository/export-jobs';
import { fetchSessionHeatmapData } from '../repository/time-series';
import type {
  TimeRange,
  AnalyticsMetric,
  AnalyticsDimension,
  AnalyticsFilter,
} from '../schemas';
import { analyticsKeys } from './analyticsKeys';

export function useAnalyticsData(
  userId: string,
  metrics: AnalyticsMetric[],
  timeRange: TimeRange,
  granularity: 'hour' | 'day' | 'week' | 'month' = 'day',
  options?: {
    dimensions?: AnalyticsDimension[];
    filters?: AnalyticsFilter[];
    includeComparison?: boolean;
  },
) {
  return useQuery({
    queryKey: analyticsKeys.data(userId, metrics, timeRange),
    queryFn: () =>
      service.getAnalyticsData({
        userId,
        metrics,
        timeRange,
        granularity,
        ...options,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!userId && metrics.length > 0,
  });
}

export function useTrendAnalysis(
  userId: string,
  metric: AnalyticsMetric,
  timeRange: TimeRange,
) {
  return useQuery({
    queryKey: analyticsKeys.trend(userId, metric, timeRange),
    queryFn: () => service.calculateTrend(userId, metric, timeRange),
    staleTime: 10 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useInsights(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number },
) {
  return useQuery({
    queryKey: analyticsKeys.insights(userId, options),
    queryFn: () =>
      fetchInsights(userId, {
        unreadOnly: options?.unreadOnly,
        limit: options?.limit,
      }),
    staleTime: 1 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useUnreadInsightsCount(userId: string) {
  const { data: insights } = useInsights(userId, { unreadOnly: true });
  return insights?.length ?? 0;
}

export function useDetectedPatterns(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.patterns(userId),
    queryFn: () =>
      fetchDetectedPatterns(userId, {
        since: Date.now() - 30 * 24 * 60 * 60 * 1000,
      }),
    staleTime: 30 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useDashboardLayout(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(userId),
    queryFn: () => fetchDefaultDashboard(userId),
    staleTime: 60 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useExportJobs(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.exportJobs(userId),
    queryFn: () => fetchExportJobs(userId),
    staleTime: 30 * 1000,
    refetchInterval: 5000,
    enabled: !!userId,
  });
}

export function useAnalyticsPreferences(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.preferences(userId),
    queryFn: () => fetchAnalyticsPreferences(userId),
    staleTime: 60 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useAnalyticsSummary(userId: string, timeRange: TimeRange) {
  return useQuery({
    queryKey: analyticsKeys.summary(userId, timeRange),
    queryFn: () => service.getAnalyticsSummary(userId, timeRange),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useSessionHeatmapData(userId: string, weeks: number) {
  return useQuery({
    queryKey: analyticsKeys.sessionHeatmap(userId, weeks),
    queryFn: () => fetchSessionHeatmapData(userId, weeks),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: Boolean(userId) && weeks > 0,
  });
}

export function useComparativeStats(
  userId: string,
  metric: AnalyticsMetric,
  timeRange: TimeRange,
) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'comparison', userId, metric, timeRange],
    queryFn: () => service.getComparativeStats(userId, metric, timeRange),
    staleTime: 10 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useAnalyticsDegradedState(
  userId: string,
  isError: boolean,
  error: Error | null,
) {
  return {
    isDegraded: isError,
    degradedReason: error?.message?.includes('offline')
      ? 'offline'
      : error?.message?.includes('rate')
        ? 'rate_limited'
        : 'server_error',
    canShowCached: true,
    lastSuccessfulFetch: Date.now(),
  };
}
