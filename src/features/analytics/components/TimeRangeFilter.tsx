/**
 * Time Range Filter Component
 * Allows users to select time periods for analytics views
 */

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { TimeRangeSchema } from '../schemas';
import type { z } from 'zod';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';

type TimeRange = z.infer<typeof TimeRangeSchema>;

interface TimeRangeFilterProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

const TIME_RANGES: { value: TimeRange; label: string; shortLabel: string }[] = [
  { value: 'today', label: 'Today', shortLabel: '1D' },
  { value: 'yesterday', label: 'Yesterday', shortLabel: 'YD' },
  { value: 'last_7_days', label: 'Last 7 Days', shortLabel: '7D' },
  { value: 'last_30_days', label: 'Last 30 Days', shortLabel: '30D' },
  { value: 'this_week', label: 'This Week', shortLabel: 'TW' },
  { value: 'last_week', label: 'Last Week', shortLabel: 'LW' },
  { value: 'this_month', label: 'This Month', shortLabel: 'TM' },
  { value: 'last_month', label: 'Last Month', shortLabel: 'LM' },
  { value: 'this_year', label: 'This Year', shortLabel: 'TY' },
  { value: 'all_time', label: 'All Time', shortLabel: 'ALL' },
];

export function TimeRangeFilter({
  selected,
  onChange,
  disabled,
}: TimeRangeFilterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time Period</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TIME_RANGES.map((range) => (
          <Pressable
            key={range.value}
            style={({ pressed }) => [
              styles.chip,
              selected === range.value && styles.chipActive,
              disabled && styles.chipDisabled,
              pressed && !disabled && { opacity: 0.8 },
            ]}
            onPress={() => onChange(range.value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={range.label}
            accessibilityState={{ selected: selected === range.value }}
            accessibilityHint="Double tap to select"
          >
            <Text
              style={[
                styles.chipText,
                selected === range.value && styles.chipTextActive,
                disabled && styles.chipTextDisabled,
              ]}
            >
              {range.shortLabel}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = createSheet({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: launchColors.hex_6b7280,
    marginBottom: 8,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: launchColors.hex_f3f4f6,
    borderWidth: 1,
    borderColor: launchColors.hex_e5e7eb,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: launchColors.hex_6366f1,
    borderColor: launchColors.hex_6366f1,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: launchColors.hex_374151,
  },
  chipTextActive: {
    color: launchColors.hex_ffffff,
  },
  chipTextDisabled: {
    color: launchColors.hex_9ca3af,
  },
});
