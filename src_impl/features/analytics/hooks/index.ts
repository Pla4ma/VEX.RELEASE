/**
 * Analytics Hooks
 * TanStack Query hooks for analytics data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import * as service from '../service';
import * as repository from '../repository';
import { GetAnalyticsDataInputSchema, CreateExportJobInputSchema, UpdateDashboardWidgetInputSchema, type TimeRange, type AnalyticsMetric, type AnalyticsDimension, type AnalyticsFilter, type ExportFormat } from '../schemas';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  data: (userId: string, metrics: AnalyticsMetric[], timeRange: TimeRange) => [...analyticsKeys.all, 'data', userId, metrics, timeRange] as const,
  trend: (userId: string, metric: AnalyticsMetric, timeRange: TimeRange) => [...analyticsKeys.all, 'trend', userId, metric, timeRange] as const,
  insights: (userId: string, filters?: { unreadOnly?: boolean }) => [...analyticsKeys.all, 'insights', userId, filters] as const,
  patterns: (userId: string) => [...analyticsKeys.all, 'patterns', userId] as const,
  dashboard: (userId: string) => [...analyticsKeys.all, 'dashboard', userId] as const,
  exportJobs: (userId: string) => [...analyticsKeys.all, 'exports', userId] as const,
  preferences: (userId: string) => [...analyticsKeys.all, 'preferences', userId] as const,
  summary: (userId: string, timeRange: TimeRange) => [...analyticsKeys.all, 'summary', userId, timeRange] as const,
  sessionHeatmap: (userId: string, weeks: number) => [...analyticsKeys.all, 'session-heatmap', userId, weeks] as const,
};

// Hook: Get analytics data for multiple metrics
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!userId && metrics.length > 0,
  });
}

// Hook: Get trend analysis for a specific metric
export function useTrendAnalysis(userId: string, metric: AnalyticsMetric, timeRange: TimeRange) {
  return useQuery({
    queryKey: analyticsKeys.trend(userId, metric, timeRange),
    queryFn: () => service.calculateTrend(userId, metric, timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  });
}

// Hook: Get insights for user
export function useInsights(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
  return useQuery({
    queryKey: analyticsKeys.insights(userId, options),
    queryFn: () =>
      repository.fetchInsights(userId, {
        unreadOnly: options?.unreadOnly,
        limit: options?.limit,
      }),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!userId,
  });
}

// Hook: Get unread insights count
export function useUnreadInsightsCount(userId: string) {
  const { data: insights } = useInsights(userId, { unreadOnly: true });
  return insights?.length ?? 0;
}

// Hook: Mark insight as read
export function useMarkInsightAsRead(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ insightId }: { insightId: string }) => repository.markInsightAsRead(userId, insightId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.insights(userId),
      });
    },
  });
}

// Hook: Get detected patterns
export function useDetectedPatterns(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.patterns(userId),
    queryFn: () =>
      repository.fetchDetectedPatterns(userId, {
        since: Date.now() - 30 * 24 * 60 * 60 * 1000,
      }),
    staleTime: 30 * 60 * 1000,
    enabled: !!userId,
  });
}

// Hook: Get dashboard layout
export function useDashboardLayout(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(userId),
    queryFn: () => repository.fetchDefaultDashboard(userId),
    staleTime: 60 * 60 * 1000,
    enabled: !!userId,
  });
}

// Hook: Update dashboard widget
export function useUpdateDashboardWidget(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: z.infer<typeof UpdateDashboardWidgetInputSchema>) => repository.updateDashboardWidget(input.widgetId, input.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.dashboard(userId),
      });
    },
  });
}

// Hook: Get export jobs
export function useExportJobs(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.exportJobs(userId),
    queryFn: () => repository.fetchExportJobs(userId),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5000, // Poll every 5 seconds for progress updates
    enabled: !!userId,
  });
}

// Hook: Create export job
export function useCreateExportJob(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<z.infer<typeof CreateExportJobInputSchema>, 'userId'>) => {
      const validated = CreateExportJobInputSchema.parse({ ...input, userId });
      return service.exportAnalyticsData(userId, validated.format as 'json' | 'csv', validated.dateRange);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.exportJobs(userId),
      });
    },
  });
}

// Hook: Create export job (alias for useExportAnalytics)
export { useCreateExportJob as useExportAnalytics };

// Hook: Get analytics preferences
export function useAnalyticsPreferences(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.preferences(userId),
    queryFn: () => repository.fetchAnalyticsPreferences(userId),
    staleTime: 60 * 60 * 1000,
    enabled: !!userId,
  });
}

// Hook: Update analytics preferences
export function useUpdateAnalyticsPreferences(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Parameters<typeof repository.updateAnalyticsPreferences>[1]) => repository.updateAnalyticsPreferences(userId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.preferences(userId),
      });
    },
  });
}

// Hook: Get analytics summary
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
    queryFn: () => repository.fetchSessionHeatmapData(userId, weeks),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: Boolean(userId) && weeks > 0,
  });
}

// Hook: Generate insights manually
export function useGenerateInsights(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => service.generateInsights(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.insights(userId),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.summary(userId, 'last_30_days'),
      });
    },
  });
}

// Hook: Detect patterns manually
export function useDetectPatterns(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timeRange: TimeRange) => service.detectPatterns(userId, timeRange),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.patterns(userId),
      });
    },
  });
}

// Hook: Get comparative stats
export function useComparativeStats(userId: string, metric: AnalyticsMetric, timeRange: TimeRange) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'comparison', userId, metric, timeRange],
    queryFn: () => service.getComparativeStats(userId, metric, timeRange),
    staleTime: 10 * 60 * 1000,
    enabled: !!userId,
  });
}

// Hook: Degraded mode detection
export function useAnalyticsDegradedState(userId: string, isError: boolean, error: Error | null) {
  return {
    isDegraded: isError,
    degradedReason: error?.message?.includes('offline') ? 'offline' : error?.message?.includes('rate') ? 'rate_limited' : 'server_error',
    canShowCached: true,
    lastSuccessfulFetch: Date.now(),
  };
}
