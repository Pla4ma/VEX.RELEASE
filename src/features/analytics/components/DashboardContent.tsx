import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { eventBus } from '../../../events/EventBus';
import { EmptyAnalytics, NetworkError } from '../../../shared/ui/primitives/EmptyState';
import { Skeleton, SkeletonChart, SkeletonList } from '../../../shared/ui/primitives/Skeleton';
import type { Insight, TimeSeriesData } from '../types';
import type { SessionHeatmapData } from '../repository';
import type { DashboardError, DashboardState } from './AnalyticsDashboard.types';
import { Heatmap } from './Heatmap';
import { HeatmapSkeleton, formatMetricName, formatValue } from './AnalyticsDashboard.helpers';
import { InsightCard } from './InsightCard';
import { TimeSeriesChart } from './TimeSeriesChart';
import { styles } from './AnalyticsDashboard.styles';

const MIN_HEATMAP_SESSIONS = 5;

function InfoCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoSubtitle}>{subtitle}</Text>
    </View>
  );
}

interface HeatmapSectionProps {
  loading: boolean;
  error: boolean;
  data: SessionHeatmapData | undefined;
}

function HeatmapSection({ loading, error, data }: HeatmapSectionProps): React.JSX.Element {
  if (loading) {return <HeatmapSkeleton />;}
  if (error || !data) {
    return <InfoCard title="Activity Pattern" subtitle="We couldn&apos;t load your session pattern right now." />;
  }
  if (data.totalSessions < MIN_HEATMAP_SESSIONS) {
    return <InfoCard title="Activity Pattern" subtitle="Complete more sessions to see your pattern." />;
  }
  return (
    <Heatmap
      title="Activity Pattern"
      subtitle="When you're most active throughout the week"
      data={data.buckets}
      colorScheme="blue"
    />
  );
}

interface DashboardContentProps {
  state: DashboardState;
  analyticsData: TimeSeriesData[] | undefined;
  heatmapData: SessionHeatmapData | undefined;
  heatmapLoading: boolean;
  heatmapError: boolean;
  error: DashboardError | null;
  insights: Insight[] | undefined;
  userId: string;
  onInsightPress: (insightId: string) => void;
}

export function DashboardContent({
  state, analyticsData, heatmapData, heatmapLoading, heatmapError,
  error, insights, userId, onInsightPress,
}: DashboardContentProps): React.JSX.Element | null {
  switch (state) {
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
              sessionId: `session_${Date.now()}`, userId, config: {}, timestamp: Date.now(),
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
                  <View style={[
                    styles.changeBadge,
                    data.summary.changePercent > 0 ? styles.changePositive : styles.changeNegative,
                  ]}>
                    <Text style={styles.changeText}>
                      {data.summary.changePercent > 0 ? '+' : ''}{data.summary.changePercent.toFixed(1)}%
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
          <HeatmapSection loading={heatmapLoading} error={heatmapError} data={heatmapData} />
          {insights && insights.length > 0 && (
            <View style={styles.insightsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Insights</Text>
                {insights.length > 5 && (
                  <Pressable
                    accessibilityLabel="View all insights"
                    accessibilityRole="button"
                    accessibilityHint="Double tap to select"
                    style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                  </Pressable>
                )}
              </View>
              {insights.slice(0, 5).map((insight) => (
                <InsightCard key={insight.id} insight={insight} onPress={() => onInsightPress(insight.id)} />
              ))}
            </View>
          )}
          {state === 'partial' && (
            <View style={styles.partialWarning}>
              <Text style={styles.partialText}>
                Some metrics may have limited data for this time period.
              </Text>
            </View>
          )}
        </>
      );
    default:
      return null;
  }
}
