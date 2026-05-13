import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import * as service from "../service";
import * as repository from "../repository";
import { GetAnalyticsDataInputSchema, CreateExportJobInputSchema, UpdateDashboardWidgetInputSchema, type TimeRange, type AnalyticsMetric, type AnalyticsDimension, type AnalyticsFilter, type ExportFormat } from "../schemas";


export function useSessionHeatmapData(userId: string, weeks: number) {
  return useQuery({
    queryKey: analyticsKeys.sessionHeatmap(userId, weeks),
    queryFn: () => repository.fetchSessionHeatmapData(userId, weeks),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: Boolean(userId) && weeks > 0,
  });
}

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

export function useComparativeStats(userId: string, metric: AnalyticsMetric, timeRange: TimeRange) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'comparison', userId, metric, timeRange],
    queryFn: () => service.getComparativeStats(userId, metric, timeRange),
    staleTime: 10 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useAnalyticsDegradedState(userId: string, isError: boolean, error: Error | null) {
  return {
    isDegraded: isError,
    degradedReason: error?.message?.includes('offline') ? 'offline' : error?.message?.includes('rate') ? 'rate_limited' : 'server_error',
    canShowCached: true,
    lastSuccessfulFetch: Date.now(),
  };
}