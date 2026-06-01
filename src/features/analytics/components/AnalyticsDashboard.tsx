import { captureSilentFailure } from '../../../utils/silent-failure';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, Pressable, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { ErrorBoundary } from '../../../errors';
import { eventBus } from '../../../events';
import { analyticsKeys, useAnalyticsData, useInsights, useSessionHeatmapData } from '../hooks';
import type { AnalyticsMetric } from '../schemas';
import { MetricSelector } from './MetricSelector';
import { TimeRangeFilter } from './TimeRangeFilter';
import { launchColors } from '@theme/tokens/launch-colors';
import { DashboardContent } from './DashboardContent';
import { styles } from './AnalyticsDashboard.styles';
import { timeRangeToWeeks } from './AnalyticsDashboard.helpers';
import type { DashboardState, DashboardTimeRange, DashboardError, AnalyticsDashboardProps } from './AnalyticsDashboard.types';

export function AnalyticsDashboard({
  userId,
  initialMetrics = ['sessions_completed', 'xp_earned'],
  initialTimeRange = 'last_7_days',
  onInsightPress,
  onExportPress,
  onSettingsPress,
}: AnalyticsDashboardProps) {
  const queryClient = useQueryClient();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(initialMetrics);
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>(initialTimeRange);
  const [dashboardState, setDashboardState] = useState<DashboardState>('idle');
  const [error, setError] = useState<DashboardError | null>(null);
  const weeks = useMemo(() => timeRangeToWeeks(timeRange), [timeRange]);
  const analyticsMetrics = selectedMetrics as AnalyticsMetric[];
  const {
    data: analyticsData, isLoading: dataLoading, isError: dataError,
    error: dataErrorObj, refetch: refetchData,
  } = useAnalyticsData(userId, analyticsMetrics, timeRange, 'day', { dimensions: [], filters: [] });
  const {
    data: heatmapData, isLoading: heatmapLoading, isError: heatmapError, refetch: refetchHeatmap,
  } = useSessionHeatmapData(userId, weeks);
  const { data: insights, isLoading: insightsLoading } = useInsights(userId, { limit: 5 });

  React.useEffect(() => {
    if (!dataError || !dataErrorObj) {return;}
    const analyticsError = dataErrorObj instanceof Error ? dataErrorObj : new Error('Unknown error');
    setDashboardState('error');
    setError({
      title: 'Failed to load analytics',
      message: analyticsError.message,
      recoverable: true,
      action: () => { refetchData(); },
    });
    Sentry.captureException(analyticsError, {
      tags: { component: 'AnalyticsDashboard', operation: 'fetchData' },
      extra: { userId, timeRange, metrics: selectedMetrics },
    });
  }, [dataError, dataErrorObj, refetchData, selectedMetrics, timeRange, userId]);

  const state = useMemo<DashboardState>(() => {
    if (dataLoading || insightsLoading) {return 'loading';}
    if (dataError) {return 'error';}
    if (!analyticsData || analyticsData.length === 0) {return 'empty';}
    if (analyticsData.some((entry) => entry.points.length === 0)) {return 'partial';}
    return 'ready';
  }, [analyticsData, dataError, dataLoading, insightsLoading]);

  React.useEffect(() => { setDashboardState(state); }, [state]);

  const handleRefresh = useCallback(async () => {
    setDashboardState('loading');
    try {
      await Promise.all([
        refetchData(),
        refetchHeatmap(),
        queryClient.invalidateQueries({ queryKey: analyticsKeys.insights(userId) }),
      ]);
      Sentry.addBreadcrumb({ category: 'analytics_dashboard', message: 'Dashboard refreshed', level: 'info' });
    } catch (err) {
      captureSilentFailure(err, { feature: 'analytics', operation: 'ui-fallback', type: 'ui' });
    }
  }, [queryClient, refetchData, refetchHeatmap, userId]);

  const handleMetricsChange = useCallback((metrics: string[]) => {
    if (metrics.length > 0 && metrics.length <= 10) {
      setSelectedMetrics(metrics);
      Sentry.addBreadcrumb({ category: 'analytics_dashboard', message: 'Metrics changed', level: 'info', data: { metrics } });
    }
  }, []);

  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range as DashboardTimeRange);
    Sentry.addBreadcrumb({ category: 'analytics_dashboard', message: 'Time range changed', level: 'info', data: { range } });
  }, []);

  const handleInsightPress = useCallback((insightId: string) => {
    onInsightPress?.(insightId);
    eventBus.publish('analytics:insight_read', { userId, insightId });
  }, [onInsightPress, userId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.8 }]}
            onPress={onExportPress}
            accessibilityRole="button"
            accessibilityLabel="Export analytics data"
            accessibilityHint="Double tap to select"
          >
            <Text style={styles.iconButtonText}>EXP</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.8 }]}
            onPress={onSettingsPress}
            accessibilityRole="button"
            accessibilityLabel="Open analytics settings"
            accessibilityHint="Double tap to select"
          >
            <Text style={styles.iconButtonText}>SET</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.filtersContainer}>
        <TimeRangeFilter selected={timeRange} onChange={handleTimeRangeChange} />
        <MetricSelector
          selected={analyticsMetrics}
          onChange={handleMetricsChange}
          maxSelection={5}
          disabled={dashboardState === 'loading'}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={dashboardState === 'loading'}
            onRefresh={handleRefresh}
            tintColor={launchColors.hex_6366f1}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ErrorBoundary onReset={handleRefresh}>
          <DashboardContent
            state={dashboardState}
            analyticsData={analyticsData}
            heatmapData={heatmapData}
            heatmapLoading={heatmapLoading}
            heatmapError={heatmapError}
            error={error}
            insights={insights}
            userId={userId}
            onInsightPress={handleInsightPress}
          />
        </ErrorBoundary>
      </ScrollView>
    </View>
  );
}
