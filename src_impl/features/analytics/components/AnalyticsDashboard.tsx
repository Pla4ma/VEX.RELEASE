import { captureSilentFailure } from '../../../utils/silent-failure';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, Text, Pressable, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';

import { ErrorBoundary } from '../../../errors';
import { eventBus } from '../../../events';
import { EmptyAnalytics, NetworkError } from '../../../shared/ui/primitives/EmptyState';
import { Skeleton, SkeletonChart, SkeletonList } from '../../../shared/ui/primitives/Skeleton';
import { createSheet } from '@/shared/ui/create-sheet';
import { analyticsKeys, useAnalyticsData, useInsights, useSessionHeatmapData } from '../hooks';
import type { AnalyticsMetric } from '../schemas';
import { Heatmap } from './Heatmap';
import { InsightCard } from './InsightCard';
import { MetricSelector } from './MetricSelector';
import { TimeRangeFilter } from './TimeRangeFilter';
import { TimeSeriesChart } from './TimeSeriesChart';

const { width: screenWidth } = Dimensions.get('window');
const MIN_HEATMAP_SESSIONS = 5;

type DashboardState = 'idle' | 'loading' | 'error' | 'empty' | 'partial' | 'ready';
type DashboardTimeRange = 'today' | 'last_7_days' | 'last_30_days' | 'this_month';

interface DashboardError {
  title: string;
  message: string;
  code?: string;
  recoverable: boolean;
  action?: () => void;
}

interface AnalyticsDashboardProps {
  userId: string;
  initialMetrics?: string[];
  initialTimeRange?: DashboardTimeRange;
  onInsightPress?: (insightId: string) => void;
  onExportPress?: () => void;
  onSettingsPress?: () => void;
}

export function AnalyticsDashboard({ userId, initialMetrics = ['sessions_completed', 'xp_earned'], initialTimeRange = 'last_7_days', onInsightPress, onExportPress, onSettingsPress }: AnalyticsDashboardProps) {
  const queryClient = useQueryClient();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(initialMetrics);
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>(initialTimeRange);
  const [dashboardState, setDashboardState] = useState<DashboardState>('idle');
  const [error, setError] = useState<DashboardError | null>(null);

  const weeks = useMemo(() => timeRangeToWeeks(timeRange), [timeRange]);
  const analyticsMetrics = selectedMetrics as AnalyticsMetric[];

  const {
    data: analyticsData,
    isLoading: dataLoading,
    isError: dataError,
    error: dataErrorObj,
    refetch: refetchData,
  } = useAnalyticsData(userId, analyticsMetrics, timeRange, 'day', {
    dimensions: [],
    filters: [],
  });

  const { data: heatmapData, isLoading: heatmapLoading, isError: heatmapError, refetch: refetchHeatmap } = useSessionHeatmapData(userId, weeks);

  const { data: insights, isLoading: insightsLoading } = useInsights(userId, { limit: 5 });

  React.useEffect(() => {
    if (dataError && dataErrorObj) {
      const analyticsError = dataErrorObj instanceof Error ? dataErrorObj : new Error('Unknown error');
      setDashboardState('error');
      setError({
        title: 'Failed to load analytics',
        message: analyticsError.message,
        recoverable: true,
        action: () => {
          void refetchData();
        },
      });

      Sentry.captureException(analyticsError, {
        tags: { component: 'AnalyticsDashboard', operation: 'fetchData' },
        extra: { userId, timeRange, metrics: selectedMetrics },
      });
    }
  }, [dataError, dataErrorObj, refetchData, selectedMetrics, timeRange, userId]);

  const state = useMemo<DashboardState>(() => {
    if (dataLoading || insightsLoading) {
      return 'loading';
    }

    if (dataError) {
      return 'error';
    }

    if (!analyticsData || analyticsData.length === 0) {
      return 'empty';
    }

    if (analyticsData.some((entry) => entry.points.length === 0)) {
      return 'partial';
    }

    return 'ready';
  }, [analyticsData, dataError, dataLoading, insightsLoading]);

  React.useEffect(() => {
    setDashboardState(state);
  }, [state]);

  const handleRefresh = useCallback(async () => {
    setDashboardState('loading');

    try {
      await Promise.all([refetchData(), refetchHeatmap(), queryClient.invalidateQueries({ queryKey: analyticsKeys.insights(userId) })]);

      Sentry.addBreadcrumb({
        category: 'analytics_dashboard',
        message: 'Dashboard refreshed',
        level: 'info',
      });
    } catch (error) {
      captureSilentFailure(error, { feature: 'analytics', operation: 'ui-fallback', type: 'ui' });
      return;
    }
  }, [queryClient, refetchData, refetchHeatmap, userId]);

  const handleMetricsChange = useCallback((metrics: string[]) => {
    if (metrics.length > 0 && metrics.length <= 10) {
      setSelectedMetrics(metrics);
      Sentry.addBreadcrumb({
        category: 'analytics_dashboard',
        message: 'Metrics changed',
        level: 'info',
        data: { metrics },
      });
    }
  }, []);

  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range as DashboardTimeRange);
    Sentry.addBreadcrumb({
      category: 'analytics_dashboard',
      message: 'Time range changed',
      level: 'info',
      data: { range },
    });
  }, []);

  const handleInsightPress = useCallback(
    (insightId: string) => {
      onInsightPress?.(insightId);
      eventBus.publish('analytics:insight_read', { userId, insightId });
    },
    [onInsightPress, userId],
  );

  const renderHeatmapSection = () => {
    if (heatmapLoading) {
      return <HeatmapSkeleton />;
    }

    if (heatmapError || !heatmapData) {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Activity Pattern</Text>
          <Text style={styles.infoSubtitle}>We couldn&apos;t load your session pattern right now.</Text>
        </View>
      );
    }

    if (heatmapData.totalSessions < MIN_HEATMAP_SESSIONS) {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Activity Pattern</Text>
          <Text style={styles.infoSubtitle}>Complete more sessions to see your pattern.</Text>
        </View>
      );
    }

    return <Heatmap title="Activity Pattern" subtitle="When you're most active throughout the week" data={heatmapData.buckets} colorScheme="blue" />;
  };

  const renderContent = () => {
    switch (dashboardState) {
      case 'loading':
        return (
          <View style={styles.skeletonContainer}>
            <Skeleton width="60%" height={24} style={styles.skeletonTitle} />
            <View style={styles.skeletonFilters}>
              <Skeleton width={100} height={36} variant="rounded" />
              <Skeleton width={100} height={36} variant="rounded" />
            </View>
            <SkeletonChart height={200} />
            <SkeletonList count={3} />
          </View>
        );
      case 'error':
        return <NetworkError onRetry={error?.recoverable ? error.action : undefined} />;
      case 'empty':
        return (
          <EmptyAnalytics
            onStartSession={() => {
              eventBus.publish('session:created', {
                sessionId: `session_${Date.now()}`,
                userId,
                config: {},
                timestamp: Date.now(),
              });
            }}
          />
        );
      case 'partial':
      case 'ready':
        return (
          <>
            <View style={styles.summaryContainer}>
              {analyticsData?.map((data) => (
                <View key={data.metric} style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatValue(data.summary.total, data.metric)}</Text>
                  <Text style={styles.summaryLabel}>{formatMetricName(data.metric)}</Text>
                  {data.summary.changePercent !== 0 && (
                    <View style={[styles.changeBadge, data.summary.changePercent > 0 ? styles.changePositive : styles.changeNegative]}>
                      <Text style={styles.changeText}>
                        {data.summary.changePercent > 0 ? '+' : ''}
                        {data.summary.changePercent.toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.chartsContainer}>
              {analyticsData?.map((data) => (
                <TimeSeriesChart key={data.metric} data={data} height={200} />
              ))}
            </View>

            {renderHeatmapSection()}

            {insights && insights.length > 0 && (
              <View style={styles.insightsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Insights</Text>
                  {insights.length > 5 && (
                    <Pressable accessibilityLabel="View all insights" accessibilityRole="button" accessibilityHint="Activates this control" style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </Pressable>
                  )}
                </View>

                {insights.slice(0, 5).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} onPress={() => handleInsightPress(insight.id)} />
                ))}
              </View>
            )}

            {dashboardState === 'partial' && (
              <View style={styles.partialWarning}>
                <Text style={styles.partialText}>Some metrics may have limited data for this time period.</Text>
              </View>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerActions}>
          <Pressable style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.8 }]} onPress={onExportPress} accessibilityRole="button" accessibilityLabel="Export button" accessibilityHint="Activates this control">
            <Text style={styles.iconButtonText}>EXP</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.8 }]} onPress={onSettingsPress} accessibilityRole="button" accessibilityLabel="Settings button" accessibilityHint="Activates this control">
            <Text style={styles.iconButtonText}>SET</Text>
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TimeRangeFilter selected={timeRange} onChange={handleTimeRangeChange} />
        <MetricSelector selected={analyticsMetrics} onChange={handleMetricsChange} maxSelection={5} disabled={dashboardState === 'loading'} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={dashboardState === 'loading'} onRefresh={handleRefresh} tintColor="#6366f1" />} showsVerticalScrollIndicator={false}>
        <ErrorBoundary onReset={handleRefresh}>{renderContent()}</ErrorBoundary>
      </ScrollView>
    </View>
  );
}

function HeatmapSkeleton() {
  return (
    <View style={styles.heatmapSkeleton}>
      <Skeleton width="45%" height={20} />
      <Skeleton width="70%" height={14} />
      <SkeletonChart height={180} />
    </View>
  );
}

function timeRangeToWeeks(timeRange: DashboardTimeRange): number {
  switch (timeRange) {
    case 'today':
      return 1;
    case 'last_7_days':
      return 1;
    case 'last_30_days':
      return 4;
    case 'this_month':
      return 4;
  }
}

function formatMetricName(metric: string): string {
  return metric
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatValue(value: number, metric: string): string {
  if (metric.includes('time')) {
    const hours = Math.floor(value / 3600);
    if (hours > 0) {
      return `${hours}h`;
    }

    const minutes = Math.floor(value / 60);
    return `${minutes}m`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return value.toFixed(value % 1 === 0 ? 0 : 1);
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  iconButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: (screenWidth - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  changeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  changePositive: {
    backgroundColor: '#d1fae5',
  },
  changeNegative: {
    backgroundColor: '#fee2e2',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  chartsContainer: {
    marginBottom: 16,
  },
  insightsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  partialWarning: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  partialText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: 16,
    gap: 16,
  },
  skeletonTitle: {
    marginBottom: 8,
  },
  skeletonFilters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  heatmapSkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export * from "./AnalyticsDashboard.types";
export * from "./AnalyticsDashboard.types";
