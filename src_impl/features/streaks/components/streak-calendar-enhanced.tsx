import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useStreakCalendar } from "../hooks";
import { useTheme } from "@/theme";
import { DayCell, type DayData } from "./streak-calendar-day-cell";
import { getStyles } from "./streak-calendar-styles";

interface StreakCalendarEnhancedProps {
  userId: string;
  month: number;
  year: number;
  previewCompletedDays?: number[];
  previewDayData?: DayData[];
  previewCurrentStreakDays?: number;
  title?: string;
}

export function StreakCalendarEnhanced({
  userId,
  month,
  year,
  previewCompletedDays,
  previewDayData,
  previewCurrentStreakDays,
  title,
}: StreakCalendarEnhancedProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const {
    data: calendar,
    isPending,
    isError,
  } = useStreakCalendar(userId, month, year);

  const dayDataMap = useMemo(() => {
    const map = new Map<number, DayData>();
    if (previewDayData) {
      previewDayData.forEach((d) => map.set(d.day, d));
    } else if (previewCompletedDays) {
      previewCompletedDays.forEach((day) => {
        map.set(day, {
          day,
          hasSession: true,
          durationMinutes: 30,
          isBossDefeatDay: false,
          isStreakDay: false,
        });
      });
    }
    if (calendar?.days) {
      calendar.days.forEach((day, index) => {
        const existing = map.get(Number(day));
        map.set(Number(day), {
          day: Number(day),
          hasSession: true,
          durationMinutes:
            calendar.durations?.[index] ?? existing?.durationMinutes ?? 30,
          isBossDefeatDay:
            calendar.bossDefeatDays?.includes(Number(day)) ??
            existing?.isBossDefeatDay ??
            false,
          isStreakDay:
            calendar.streakDays?.includes(Number(day)) ??
            existing?.isStreakDay ??
            false,
        });
      });
    }
    return map;
  }, [
    calendar?.bossDefeatDays,
    calendar?.days,
    calendar?.durations,
    calendar?.streakDays,
    previewCompletedDays,
    previewDayData,
  ]);

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

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const totalFocusDays = dayDataMap.size;
  const longestSession = Math.max(
    ...Array.from(dayDataMap.values()).map((d) => d.durationMinutes),
    0,
  );

  const renderEmptyDays = () =>
    Array.from({ length: firstDayOfMonth }, (_, i) => (
      <View key={`empty-${i}`} style={styles.dayEmpty} />
    ));

  const renderDay = (day: number) => {
    const isToday =
      day === today && month === currentMonth && year === currentYear;
    return (
      <DayCell
        key={day}
        day={day}
        dayData={dayDataMap.get(day)}
        isToday={isToday}
        theme={theme}
        styles={styles}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthName}>{title || `${monthName} ${year}`}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            Current streak:{" "}
            <Text style={styles.statValueHighlight}>
              {previewCurrentStreakDays ?? calendar?.currentStreakDays ?? 0} days
            </Text>
          </Text>
        </View>
        <View style={styles.subStats}>
          <Text style={styles.subStat}>{totalFocusDays} focus days</Text>
          <Text style={styles.subStatSeparator}>-</Text>
          <Text style={styles.subStat}>Longest: {longestSession} min</Text>
        </View>
      </View>
      <View style={styles.weekdays}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendar}>
        {renderEmptyDays()}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.legendGradientBox}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.warning.DEFAULT },
                ]}
              />
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.error.dark },
                ]}
              />
            </View>
            <Text style={styles.legendText}>Focus intensity</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>Crown</Text>
            <Text style={styles.legendText}>Boss defeated</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default StreakCalendarEnhanced;
