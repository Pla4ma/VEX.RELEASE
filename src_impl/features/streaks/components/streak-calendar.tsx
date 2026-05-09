/**
 * Streak Calendar Component
 * Visual calendar showing daily focus activity
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStreakCalendar } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

// ============================================================================
// Types
// ============================================================================

interface StreakCalendarProps {
  userId: string;
  month: number;
  year: number;
  previewCompletedDays?: number[];
  previewCurrentStreakDays?: number;
  title?: string;
}

// ============================================================================
// Component
// ============================================================================

export function StreakCalendar({ userId, month, year, previewCompletedDays, previewCurrentStreakDays, title }: StreakCalendarProps) {
  const { data: calendar, isPending, isError } = useStreakCalendar(userId, month, year);

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Building your flame trail...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Couldn't load your streak history</Text>
      </View>
    );
  }

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const completedDaySet = new Set<number>(previewCompletedDays ?? calendar?.days?.map((day) => Number(day)) ?? []);

  const renderDay = (day: number) => {
    const hasSession = completedDaySet.has(day);
    const isToday = day === new Date().getDate() && month === new Date().getMonth() + 1;

    return (
      <View key={day} style={[styles.day, hasSession && styles.dayActive, isToday && styles.dayToday]}>
        <Text style={[styles.dayText, hasSession && styles.dayTextActive]}>{day}</Text>
        {hasSession && <View style={styles.dayDot} />}
      </View>
    );
  };

  const renderEmptyDays = () => {
    return Array.from({ length: firstDayOfMonth }, (_, i) => <View key={`empty-${i}`} style={styles.day} />);
  };

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <Text style={styles.monthName}>{title || `${monthName} ${year}`}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            Current streak: <Text style={styles.statValue}>{previewCurrentStreakDays ?? calendar?.currentStreakDays ?? 0} days</Text>
          </Text>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <Text key={i} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {renderEmptyDays()}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendActive]} />
          <Text style={styles.legendText}>Focus day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendToday]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  header: {
    marginBottom: 16,
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statValue: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  day: {
    width: 36,
    height: 36,
    margin: 2,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayActive: {
    backgroundColor: '#3b82f6',
  },
  dayToday: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  dayText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  dayTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22c55e',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendActive: {
    backgroundColor: '#3b82f6',
  },
  legendToday: {
    backgroundColor: '#fbbf24',
  },
  legendText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
