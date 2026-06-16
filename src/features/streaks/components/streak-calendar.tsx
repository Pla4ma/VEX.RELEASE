import React from 'react';
import { View, Text } from 'react-native';
import { useStreakCalendar } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';

function EmptyDay({ index }: { index: number }) {
  return <View key={`empty-${index}`} style={styles.day} />;
}

interface StreakCalendarProps {
  userId: string;
  month: number;
  year: number;
  previewCompletedDays?: number[];
  previewCurrentStreakDays?: number;
  title?: string;
}
export function StreakCalendar({
  userId,
  month,
  year,
  previewCompletedDays,
  previewCurrentStreakDays,
  title,
}: StreakCalendarProps) {
  const {
    data: calendar,
    isPending,
    isError,
  } = useStreakCalendar(userId, month, year);
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
  const monthName = new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
  });
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const completedDaySet = new Set<number>(
    previewCompletedDays ?? calendar?.days?.map((day) => Number(day)) ?? [],
  );
  const renderDay = (day: number) => {
    const hasSession = completedDaySet.has(day);
    const isToday =
      day === new Date().getDate() && month === new Date().getMonth() + 1;
    return (
      <View
        key={day}
        style={[
          styles.day,
          hasSession && styles.dayActive,
          isToday && styles.dayToday,
        ]}
      >
        <Text style={[styles.dayText, hasSession && styles.dayTextActive]}>
          {day}
        </Text>
        {hasSession && <View style={styles.dayDot} />}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <Text style={styles.monthName}>{title || `${monthName} ${year}`}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            Current streak:{' '}
            <Text style={styles.statValue}>
              {previewCurrentStreakDays ?? calendar?.currentStreakDays ?? 0}{' '}
              days
            </Text>
          </Text>
        </View>
      </View>

      {}
      <View style={styles.weekdays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <Text key={i} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {}
      <View style={styles.calendar}>
        {Array.from({ length: firstDayOfMonth }, (_, i) => <EmptyDay key={`empty-${i}`} index={i} />)}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </View>

      {}
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
const styles = createSheet({
  container: {
    backgroundColor: lightColors.semantic.background,
    borderRadius: 12,
    padding: 16,
  },
  loadingText: { color: lightColors.text.muted, fontSize: 14 },
  errorText: { color: lightColors.semantic.danger, fontSize: 14 },
  header: { marginBottom: 16 },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColors.surface.button,
    marginBottom: 4,
  },
  stats: { flexDirection: 'row' },
  statText: { fontSize: 12, color: lightColors.text.muted },
  statValue: { color: lightColors.semantic.warning, fontWeight: '600' },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: lightColors.text.muted,
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
  dayActive: { backgroundColor: lightColors.accent.blue },
  dayToday: { borderWidth: 2, borderColor: lightColors.semantic.warning },
  dayText: { fontSize: 14, color: lightColors.text.muted },
  dayTextActive: { color: lightColors.text.inverse, fontWeight: '600' },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.semantic.success,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.text.muted,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendActive: { backgroundColor: lightColors.accent.blue },
  legendToday: { backgroundColor: lightColors.semantic.warning },
  legendText: { fontSize: 12, color: lightColors.text.muted },
});
