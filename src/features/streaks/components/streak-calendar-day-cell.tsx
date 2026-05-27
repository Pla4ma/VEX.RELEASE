import React, { useMemo } from "react";
import { View, Text } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { Theme } from "@/theme";
import type { StreakCalendarStyles } from "./streak-calendar-styles";

export interface DayData {
  day: number;
  hasSession: boolean;
  durationMinutes: number;
  isBossDefeatDay: boolean;
  isStreakDay: boolean;
}

function getIntensityColor(durationMinutes: number, theme: Theme): string {
  if (durationMinutes === 0) {
    return "transparent";
  }
  if (durationMinutes < 15) {
    return `${theme.colors.warning[500]}40`;
  }
  if (durationMinutes < 30) {
    return `${theme.colors.warning[500]}60`;
  }
  if (durationMinutes < 60) {
    return `${theme.colors.warning[500]}80`;
  }
  if (durationMinutes < 120) {
    return `${theme.colors.error[500]}70`;
  }
  return `${theme.colors.error[500]}90`;
}

function getFlameGradient(
  durationMinutes: number,
  theme: Theme,
): [string, string] {
  const w = theme.colors.warning;
  const e = theme.colors.error;
  if (durationMinutes < 30) {
    return [w.DEFAULT, w[500]];
  }
  if (durationMinutes < 60) {
    return [w[500], e.dark];
  }
  return [e.dark, e.DEFAULT];
}

function PulsingTodayRing({
  children,
  isToday,
  styles,
}: {
  children: React.ReactNode;
  isToday: boolean;
  styles: StreakCalendarStyles;
}) {
  const pulseValue = useSharedValue(0);

  React.useEffect(() => {
    if (isToday) {
      pulseValue.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }
  }, [isToday, pulseValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulseValue.value, [0, 1], [1, 1.15]) }],
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

interface DayCellProps {
  day: number;
  dayData?: DayData;
  isToday: boolean;
  theme: Theme;
  styles: StreakCalendarStyles;
}

export function DayCell({
  day,
  dayData,
  isToday,
  theme,
  styles,
}: DayCellProps) {
  const hasSession = dayData?.hasSession ?? false;
  const durationMinutes = dayData?.durationMinutes ?? 0;
  const isBossDefeatDay = dayData?.isBossDefeatDay ?? false;
  const isStreakDay = dayData?.isStreakDay ?? false;
  const intensityColor = useMemo(
    () => getIntensityColor(durationMinutes, theme),
    [durationMinutes, theme],
  );
  const [flameStart, flameEnd] = useMemo(
    () => getFlameGradient(durationMinutes, theme),
    [durationMinutes, theme],
  );

  return (
    <PulsingTodayRing isToday={isToday} styles={styles}>
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
        <Text
          style={[
            styles.dayText,
            hasSession && styles.dayTextActive,
            isStreakDay && styles.dayTextStreak,
            isToday && styles.dayTextToday,
          ]}
        >
          {isBossDefeatDay ? "Crown" : day}
        </Text>
        {hasSession && durationMinutes >= 60 && (
          <View style={styles.fireIndicator}>
            <Text style={styles.fireEmoji}>Fire</Text>
          </View>
        )}
      </View>
    </PulsingTodayRing>
  );
}
