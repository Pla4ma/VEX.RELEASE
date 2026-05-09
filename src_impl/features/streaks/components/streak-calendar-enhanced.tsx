/**
 * Enhanced Streak Calendar Component
 * Beautiful visual calendar showing daily focus activity with intensity
 *
 * Features (Phase 23.3):
 * - 30-day grid with color intensity based on session duration
 * - Today's cell: pulsing outline
 * - Streak days: filled with flame color gradient
 * - Empty days: subtle gray
 * - Boss defeat days: special crown icon
 * - Share-worthy "proof of work" design
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate, Easing } from 'react-native-reanimated';
import { useStreakCalendar } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '@/theme';

// ============================================================================
// Types
// ============================================================================

interface DayData {
  day: number;
  hasSession: boolean;
  durationMinutes: number;
  isBossDefeatDay: boolean;
  isStreakDay: boolean;
}

interface StreakCalendarEnhancedProps {
  userId: string;
  month: number;
  year: number;
  previewCompletedDays?: number[];
  previewDayData?: DayData[];
  previewCurrentStreakDays?: number;
  title?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getIntensityColor(durationMinutes: number, theme: DynamicValue): string {
  // Color intensity based on session duration
  if (durationMinutes === 0) {
    return 'transparent';
  }
  if (durationMinutes < 15) {
    return `${theme.colors.warning[400]}40`;
  } // Light amber
  if (durationMinutes < 30) {
    return `${theme.colors.warning[500]}60`;
  } // Medium amber
  if (durationMinutes < 60) {
    return `${theme.colors.warning[500]}80`;
  } // Strong amber
  if (durationMinutes < 120) {
    return `${theme.colors.error[500]}70`;
  } // Light red (fire)
  return `${theme.colors.error[500]}90`; // Strong fire color
}

function getFlameGradient(durationMinutes: number): [string, string] {
  if (durationMinutes < 30) {
    return ['#fbbf24', '#f59e0b'];
  } // Yellow flame
  if (durationMinutes < 60) {
    return ['#f59e0b', '#ef4444'];
  } // Orange-red flame
  return ['#ef4444', '#dc2626']; // Deep red flame
}

// ============================================================================
// Pulsing Today Indicator
// ============================================================================

function PulsingTodayRing({ children, isToday }: { children: React.ReactNode; isToday: boolean }) {
  const pulseValue = useSharedValue(0);

  React.useEffect(() => {
    if (isToday) {
      pulseValue.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
    }
  }, [isToday, pulseValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pulseValue.value, [0, 1], [1, 1.15]),
      },
    ],
    opacity: interpolate(pulseValue.value, [0, 1], [0.6, 1]),
  }));

  if (!isToday) {
    return <>{children}</>;
  }

  return (
    <View style={styles.todayContainer}>
      <Animated.View style={[styles.pulseRing, animatedStyle]} />
      {children}
    </View>
  );
}

// ============================================================================
// Day Cell Component
// ============================================================================

interface DayCellProps {
  day: number;
  dayData?: DayData;
  isToday: boolean;
  theme: DynamicValue;
}

function DayCell({ day, dayData, isToday, theme }: DayCellProps) {
  const hasSession = dayData?.hasSession ?? false;
  const durationMinutes = dayData?.durationMinutes ?? 0;
  const isBossDefeatDay = dayData?.isBossDefeatDay ?? false;
  const isStreakDay = dayData?.isStreakDay ?? false;

  const intensityColor = useMemo(() => getIntensityColor(durationMinutes, theme), [durationMinutes, theme]);

  const [flameStart, flameEnd] = useMemo(() => getFlameGradient(durationMinutes), [durationMinutes]);

  return (
    <PulsingTodayRing isToday={isToday}>
      <View
        style={[
          styles.day,
          hasSession && { backgroundColor: intensityColor },
          isStreakDay && {
            backgroundColor: flameStart,
            borderWidth: 2,
            borderColor: flameEnd,
          },
          isToday && styles.dayToday,
        ]}
      >
        <Text style={[styles.dayText, hasSession && styles.dayTextActive, isStreakDay && styles.dayTextStreak, isToday && styles.dayTextToday]}>{isBossDefeatDay ? '👑' : day}</Text>
        {hasSession && durationMinutes >= 60 && (
          <View style={styles.fireIndicator}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
        )}
      </View>
    </PulsingTodayRing>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function StreakCalendarEnhanced({ userId, month, year, previewCompletedDays, previewDayData, previewCurrentStreakDays, title }: StreakCalendarEnhancedProps) {
  const theme = useTheme();
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

  // Merge preview data with actual data
  const dayDataMap = useMemo(() => {
    const map = new Map<number, DayData>();

    // Add preview data if available
    if (previewDayData) {
      previewDayData.forEach((d) => map.set(d.day, d));
    } else if (previewCompletedDays) {
      previewCompletedDays.forEach((day) => {
        map.set(day, {
          day,
          hasSession: true,
          durationMinutes: 30, // Default assumption
          isBossDefeatDay: false,
          isStreakDay: false,
        });
      });
    }

    // Add actual data from calendar
    if (calendar?.days) {
      calendar.days.forEach((day, index) => {
        const existing = map.get(Number(day));
        map.set(Number(day), {
          day: Number(day),
          hasSession: true,
          durationMinutes: calendar.durations?.[index] ?? 30,
          isBossDefeatDay: calendar.bossDefeatDays?.includes(Number(day)) ?? false,
          isStreakDay: calendar.streakDays?.includes(Number(day)) ?? false,
        });
      });
    }

    return map;
  }, [calendar, previewCompletedDays, previewDayData]);

  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const renderEmptyDays = () => {
    return Array.from({ length: firstDayOfMonth }, (_, i) => <View key={`empty-${i}`} style={styles.dayEmpty} />);
  };

  const renderDay = (day: number) => {
    const dayData = dayDataMap.get(day);
    const isToday = day === today && month === currentMonth && year === currentYear;

    return <DayCell key={day} day={day} dayData={dayData} isToday={isToday} theme={theme} />;
  };

  const totalFocusDays = dayDataMap.size;
  const longestSession = Math.max(...Array.from(dayDataMap.values()).map((d) => d.durationMinutes), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthName}>{title || `${monthName} ${year}`}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            Current streak: <Text style={styles.statValueHighlight}>{previewCurrentStreakDays ?? calendar?.currentStreakDays ?? 0} days 🔥</Text>
          </Text>
        </View>
        <View style={styles.subStats}>
          <Text style={styles.subStat}>{totalFocusDays} focus days</Text>
          <Text style={styles.subStatSeparator}>•</Text>
          <Text style={styles.subStat}>Longest: {longestSession} min</Text>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
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

      {/* Enhanced Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.legendGradientBox}>
              <View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} />
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            </View>
            <Text style={styles.legendText}>Focus intensity</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>👑</Text>
            <Text style={styles.legendText}>Boss defeated</Text>
          </View>
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
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
  },
  monthName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statValueHighlight: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 16,
  },
  subStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subStat: {
    fontSize: 12,
    color: '#6b7280',
  },
  subStatSeparator: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  day: {
    width: 40,
    height: 40,
    margin: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262642',
  },
  dayEmpty: {
    width: 40,
    height: 40,
    margin: 2,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dayText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dayTextStreak: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  todayContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: 'transparent',
  },
  fireIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  fireEmoji: {
    fontSize: 10,
  },
  legend: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendGradientBox: {
    flexDirection: 'row',
    marginRight: 6,
    gap: 2,
  },
  legendToday: {
    backgroundColor: '#fbbf24',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  legendText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  legendEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
});

export default StreakCalendarEnhanced;
