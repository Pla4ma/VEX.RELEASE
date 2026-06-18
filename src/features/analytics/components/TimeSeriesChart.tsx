/**
 * Time Series Chart Component (Placeholder)
 * Full implementation requires react-native-chart-kit or similar
 * This is a simplified stats display version
 */

import React from 'react';
import { View, Text } from 'react-native';
import { z } from 'zod';
import { TimeSeriesDataSchema } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


type TimeSeriesData = z.infer<typeof TimeSeriesDataSchema>;

interface TimeSeriesChartProps {
  data: TimeSeriesData;
  height?: number;
}

export function TimeSeriesChart({ data, height = 220 }: TimeSeriesChartProps) {
  if (data.points.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No data available for this period</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.title}>{formatMetricName(data.metric)}</Text>

      <View style={styles.stats}>
        <StatBox
          label="Total"
          value={formatValue(data.summary.total, data.metric)}
        />
        <StatBox
          label="Average"
          value={formatValue(data.summary.average, data.metric)}
        />
        <StatBox
          label="Peak"
          value={formatValue(data.summary.max, data.metric)}
        />
        {data.summary.changePercent !== 0 && (
          <StatBox
            label="Change"
            value={`${data.summary.changePercent > 0 ? '+' : ''}${data.summary.changePercent.toFixed(1)}%`}
            highlight={data.summary.changePercent > 0 ? 'positive' : 'negative'}
          />
        )}
      </View>

      <View style={styles.dataPreview}>
        <Text style={styles.previewText}>
          {data.points.length} data points • Last updated{' '}
          {new Date(
            data.points[data.points.length - 1]?.timestamp ?? 0,
          ).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'positive' | 'negative';
}) {
  const highlightColor =
    highlight === 'positive'
      ? lightColors.accent.green
      : highlight === 'negative'
        ? lightColors.semantic.danger
        : undefined;

  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          highlightColor ? { color: highlightColor } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatMetricName(metric: string): string {
  return metric
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatValue(value: number, metric: string): string {
  if (metric.includes('time') || metric.includes('duration')) {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}

const styles = createSheet({
  container: {
    backgroundColor: lightColors.text.inverse,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.semantic.backgroundMuted,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    backgroundColor: lightColors.surface.button,
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: lightColors.text.muted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: lightColors.semantic.backgroundMuted,
  },
  dataPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border.light,
  },
  previewText: {
    fontSize: 12,
    color: lightColors.text.muted,
  },
  emptyText: {
    textAlign: 'center',
    color: lightColors.text.muted,
    padding: 24,
  },
});
