import React, { useState, useCallback } from "react";
import { Pressable, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, withSpring, FadeIn } from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
const DAY_WIDTH = (Dimensions.get("window").width - 40) / 7;
export type DayStatus = "completed" | "partial" | "upcoming" | "missed";
export type EventType = "squad_war" | "double_xp" | "challenge_expires" | "season_ends" | "boss_rush";
export interface DayData {
  date: Date;
  status: DayStatus;
  sessionsCompleted: number;
  events: EventType[];
  challengeExpiring?: string;
}
export interface WeeklyCalendarProps { days: DayData[]; selectedDay: Date; onDaySelect: (day: Date) => void; currentStreak: number; }
const EVENT_ICONS: Record<EventType, string> = {
  squad_war: "⚔️",
  double_xp: "🔥",
  challenge_expires: "🏆",
  season_ends: "🌙",
  boss_rush: "👹",
};
const EVENT_LABELS: Record<EventType, string> = {
  squad_war: "Squad War",
  double_xp: "Double XP",
  challenge_expires: "Challenge Ends",
  season_ends: "Season Ends",
  boss_rush: "Boss Rush",
};
function DayCell({ day, isSelected, isToday, onPress, index }: { day: DayData; isSelected: boolean; isToday: boolean; onPress: () => void; index: number }): JSX.Element {
  const { theme } = useTheme();
  const getStatusColor = () => {
    switch (day.status) {
      case "completed":
        return theme.colors.success.DEFAULT;
      case "partial":
        return theme.colors.warning.DEFAULT;
      case "missed":
        return theme.colors.error.DEFAULT;
      default:
        return theme.colors.text.tertiary;
    }
  };
  const getStatusIcon = () => {
    switch (day.status) {
      case "completed":
        return "✓";
      case "partial":
        return "◐";
      case "missed":
        return "✕";
      default:
        return "";
    }
  };
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isSelected ? withSpring(1.1, { damping: 15 }) : 1,
      },
    ],
    backgroundColor: isSelected ? theme.colors.primary[500] : isToday ? `${theme.colors.primary[500]}20` : theme.colors.background.secondary,
    borderColor: isToday ? theme.colors.primary[500] : theme.colors.border.light,
  }));
  const dayName = day.date.toLocaleDateString("en-US", { weekday: "narrow" });
  const dayNum = day.date.getDate();
  return (
    <Animated.View entering={FadeIn.duration(400).delay(index * 50)} style={[{ width: DAY_WIDTH, paddingHorizontal: 2 }, animatedStyle]}>
      <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box alignItems="center" py="sm" borderRadius="lg" borderWidth={1}>
          <Text variant="caption" color={isSelected ? "text.inverse" : isToday ? "primary.500" : "text.tertiary"} fontWeight={isToday ? "700" : "400"}>
            {dayName}
          </Text>
          <Text variant="h4" color={isSelected ? "text.inverse" : "text.primary"} fontWeight={isToday || isSelected ? "700" : "400"}>
            {dayNum}
          </Text>
          {day.status !== "upcoming" && (
            <Text fontSize={12} color={isSelected ? theme.colors.text.inverse : getStatusColor()}>
              {getStatusIcon()}
            </Text>
          )}
          {day.events.length > 0 && (
            <Box flexDirection="row" gap="xs" mt="xs">
              {day.events.slice(0, 2).map((event, i) => (
                <Text key={i} fontSize={8}>
                  {EVENT_ICONS[event]}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
function DayDetailsPopover({ day, onClose }: { day: DayData; onClose: () => void }): JSX.Element {
  const { theme } = useTheme();
  const formattedDate = day.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return (
    <Box p="lg" borderRadius="xl" bg="background.elevated" borderWidth={1} borderColor="border.light" shadow>
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="md">
        <Text variant="h4" color="text.primary">
          {formattedDate}
        </Text>
        <Pressable onPress={onClose} accessibilityLabel="✕ button" accessibilityRole="button" accessibilityHint="Activates this control">
          <Text fontSize={20} color="text.tertiary">
            ✕
          </Text>
        </Pressable>
      </Box>
      <Box mb="md">
        <Text variant="caption" color="text.tertiary" mb="xs">
          SESSIONS
        </Text>
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={24}>{day.status === "completed" ? "✅" : day.status === "partial" ? "◐" : day.status === "missed" ? "❌" : "📅"}</Text>
          <Text variant="body" color="text.primary">
            {day.sessionsCompleted > 0 ? `${day.sessionsCompleted} session${day.sessionsCompleted !== 1 ? "s" : ""}` : "No sessions"}
          </Text>
        </Box>
      </Box>
      {day.events.length > 0 && (
        <Box mb="md">
          <Text variant="caption" color="text.tertiary" mb="xs">
            EVENTS
          </Text>
          {day.events.map((event, i) => (
            <Box key={i} flexDirection="row" alignItems="center" gap="sm" py="xs">
              <Text fontSize={16}>{EVENT_ICONS[event]}</Text>
              <Text variant="body" color="text.primary">
                {EVENT_LABELS[event]}
              </Text>
            </Box>
          ))}
        </Box>
      )}
      {day.challengeExpiring && (
        <Box p="sm" borderRadius="lg" bg={`${theme.colors.warning[500]}15`} borderWidth={1} borderColor="warning.DEFAULT">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>⏰</Text>
            <Text variant="bodySmall" color="warning.DEFAULT">
              Challenge ends: {day.challengeExpiring}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
export function WeeklyCalendar({ days, selectedDay, onDaySelect, currentStreak }: WeeklyCalendarProps): JSX.Element {
  const { theme } = useTheme();
  const [showDetails, setShowDetails] = useState<Date | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const handleDayPress = useCallback((day: Date) => {
    onDaySelect(day);
    setShowDetails(day);
  }, [onDaySelect]);
  const selectedDayData = days.find((d) => d.date.getTime() === showDetails?.getTime());
  return (
    <Box m="lg">
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="md">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={20}>📅</Text>
          <Text variant="h4" color="text.primary">
            This Week
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={16}>🔥</Text>
          <Text variant="body" color="accent.orange" fontWeight="600">
            {currentStreak} day streak
          </Text>
        </Box>
      </Box>
      <Box flexDirection="row" justifyContent="space-between">
        {days.map((day, index) => {
          const dateTime = day.date.getTime();
          const isSelected = selectedDay.getTime() === dateTime;
          const isToday = today.getTime() === dateTime;
          return <DayCell key={dateTime} day={day} isSelected={isSelected} isToday={isToday} onPress={() => handleDayPress(day.date)} index={index} />;
        })}
      </Box>
      {selectedDayData && showDetails && (
        <Box mt="md">
          <DayDetailsPopover day={selectedDayData} onClose={() => setShowDetails(null)} />
        </Box>
      )}
    </Box>
  );
}
export default WeeklyCalendar;
