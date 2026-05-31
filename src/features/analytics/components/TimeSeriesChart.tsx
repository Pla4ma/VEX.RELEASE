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
import { launchColors } from '@theme/tokens/launch-colors';

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
            data.points[data.points.length - 1]!.timestamp,
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
      ? launchColors.hex_10b981
      : highlight === 'negative'
        ? launchColors.hex_ef4444
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
    backgroundColor: launchColors.hex_ffffff,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: launchColors.hex_000,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: launchColors.hex_111827,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    backgroundColor: launchColors.hex_f3f4f6,
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: launchColors.hex_6b7280,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: launchColors.hex_111827,
  },
  dataPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: launchColors.hex_e5e7eb,
  },
  previewText: {
    fontSize: 12,
    color: launchColors.hex_9ca3af,
  },
  emptyText: {
    textAlign: 'center',
    color: launchColors.hex_9ca3af,
    padding: 24,
  },
});
