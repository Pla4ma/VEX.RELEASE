import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { DAY_WIDTH, EVENT_ICONS, type DayData } from "./weekly-calendar-types";
import { buttonTap } from "../../../utils/haptics";

export function DayCell({
  day,
  isSelected,
  isToday,
  onPress,
  index,
}: {
  day: DayData;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
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
    backgroundColor: isSelected
      ? theme.colors.primary[500]
      : isToday
        ? `${theme.colors.primary[500]}20`
        : theme.colors.background.secondary,
    borderColor: isToday
      ? theme.colors.primary[500]
      : theme.colors.border.light,
  }));
  const dayName = day.date.toLocaleDateString("en-US", { weekday: "narrow" });
  const dayNum = day.date.getDate();
  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(index * 50)}
      style={[{ width: DAY_WIDTH, paddingHorizontal: 2 }, animatedStyle]}
    >
      <Pressable
        onPress={() => { buttonTap(); onPress(); }}
        accessibilityLabel={`${dayName} ${dayNum}, ${day.status}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to select this day"
      >
        <Box alignItems="center" py="sm" borderRadius="lg" borderWidth={1}>
          <Text
            variant="caption"
            color={
              isSelected
                ? "text.inverse"
                : isToday
                  ? "primary.500"
                  : "text.tertiary"
            }
            fontWeight={isToday ? "700" : "400"}
          >
            {dayName}
          </Text>
          <Text
            variant="h4"
            color={isSelected ? "text.inverse" : "text.primary"}
            fontWeight={isToday || isSelected ? "700" : "400"}
          >
            {dayNum}
          </Text>
          {day.status !== "upcoming" && (
            <Text
              fontSize={12}
              color={isSelected ? theme.colors.text.inverse : getStatusColor()}
            >
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
