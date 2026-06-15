import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import * as service from '../service';
import { markInsightAsRead } from '../repository/insights';
import { updateDashboardWidget } from '../repository/dashboard';
import { updateAnalyticsPreferences } from '../repository/stats';
import {
  CreateExportJobInputSchema,
  UpdateDashboardWidgetInputSchema,
  type TimeRange,
} from '../schemas';
import { analyticsKeys } from './analyticsKeys';

export function useMarkInsightAsRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ insightId }: { insightId: string }) =>
      markInsightAsRead(userId, insightId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.insights(userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'analytics', operation: 'mark-insight-as-read' },
      });
    },
  });
}

export function useUpdateDashboardWidget(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: z.infer<typeof UpdateDashboardWidgetInputSchema>) =>
      updateDashboardWidget(input.widgetId, input.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.dashboard(userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'analytics', operation: 'update-dashboard-widget' },
      });
    },
  });
}

export function useCreateExportJob(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Omit<z.infer<typeof CreateExportJobInputSchema>, 'userId'>,
    ) => {
      const validated = CreateExportJobInputSchema.parse({ ...input, userId });
      return service.exportAnalyticsData(
        userId,
        validated.format as 'json' | 'csv',
        validated.dateRange,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.exportJobs(userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'analytics', operation: 'create-export-job' },
      });
    },
  });
}

export { useCreateExportJob as useExportAnalytics };

export function useUpdateAnalyticsPreferences(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      preferences: Parameters<typeof updateAnalyticsPreferences>[1],
    ) => updateAnalyticsPreferences(userId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.preferences(userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'analytics', operation: 'update-analytics-preferences' },
      });
    },
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
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'analytics', operation: 'generate-insights' },
      });
    },
  });
}

export function useDetectPatterns(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timeRange: TimeRange) =>
      service.detectPatterns(userId, timeRange),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.patterns(userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'analytics', operation: 'detect-patterns' },
      });
    },
  });
}
