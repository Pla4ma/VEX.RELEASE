import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';

import {
  DAYS,
  HOURS,
  COLOR_SCHEMES,
  formatHour,
  calculatePeakDay,
  calculatePeakHour,
  calculateTotal,
  type HeatmapData,
  type HeatmapProps,
} from './Heatmap.types';

export type { HeatmapData, HeatmapProps } from './Heatmap.types';

export function Heatmap({
  data,
  title,
  subtitle,
  onCellPress,
  colorScheme = 'blue',
}: HeatmapProps) {
  const colors = COLOR_SCHEMES[colorScheme];
  const getCellValue = (day: string, hour: number): number => {
    const cell = data.find((d) => d.day === day && d.hour === hour);
    return cell?.value ?? 0;
  };
  const getCellColor = (value: number): string => {
    return colors[Math.min(value, 4)] ?? colors[0]!;
  };
  const visibleHours = HOURS.filter((h) => h % 3 === 0);
  return (
    <View style={styles.container}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmap}>
          {}
          <View style={styles.row}>
            <View style={styles.dayLabel} />
            {visibleHours.map((hour) => (
              <Text key={`header-${hour}`} style={styles.hourLabel}>
                {formatHour(hour)}
              </Text>
            ))}
          </View>

          {}
          {DAYS.map((day) => (
            <View key={day} style={styles.row}>
              <Text style={styles.dayLabel}>{day}</Text>
              {HOURS.map((hour) => {
                const value = getCellValue(day, hour);
                const isVisible = visibleHours.includes(hour);
                return (
                  <Pressable
                    key={`${day}-${hour}`}
                    style={({ pressed }) => [
                      styles.cell,
                      { backgroundColor: getCellColor(value) },
                      !isVisible && styles.hiddenCell,
                      value > 0 && styles.activeCell,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => onCellPress?.(day, hour, value)}
                    accessibilityLabel="Heatmap cell"
                    accessibilityRole="button"
                    accessibilityHint="Double tap to select"
                  >
                    {value > 0 && (
                      <View
                        style={[
                          styles.intensityIndicator,
                          { opacity: value * 0.25 },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {colors.map((color, index) => (
          <View
            key={index}
            style={[styles.legendCell, { backgroundColor: color }]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>

      {}
      <View style={styles.stats}>
        <Stat label="Peak Day" value={calculatePeakDay(data)} />
        <Stat label="Peak Hour" value={calculatePeakHour(data)} />
        <Stat label="Total" value={calculateTotal(data).toString()} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = createSheet({
  container: {
    backgroundColor: lightColors.text.inverse,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: lightColors.semantic.backgroundMuted },
  subtitle: { fontSize: 14, color: lightColors.text.muted, marginTop: 4 },
  heatmap: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dayLabel: {
    width: 40,
    fontSize: 12,
    color: lightColors.text.muted,
    fontWeight: '500',
  },
  hourLabel: {
    width: 32,
    fontSize: 10,
    color: lightColors.text.muted,
    textAlign: 'center',
  },
  cell: { width: 12, height: 28, borderRadius: 2, marginHorizontal: 1 },
  hiddenCell: { opacity: 0.3 },
  activeCell: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  intensityIndicator: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    color: lightColors.text.muted,
    marginHorizontal: 8,
  },
  legendCell: { width: 16, height: 16, borderRadius: 4 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: lightColors.surface.button,
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: lightColors.semantic.backgroundMuted,
  },
  statLabel: { fontSize: 12, color: lightColors.text.muted, marginTop: 4 },
});
