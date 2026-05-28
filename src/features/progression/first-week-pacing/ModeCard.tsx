import React from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { MotivationProfileType } from "../../onboarding/schemas";

export interface ModeOption {
  key: MotivationProfileType;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
}

export const MODE_OPTIONS: ModeOption[] = [
  {
    key: "calm",
    label: "Calm Companion",
    emoji: "🌿",
    tagline: "Gentle focus, low pressure",
    description:
      "VEX stays quiet and supportive. Sessions feel light. Progress at your pace.",
  },
  {
    key: "student",
    label: "Study Coach",
    emoji: "📚",
    tagline: "Structure and deep learning",
    description:
      "Content mastery, study plans, and AI coaching for real comprehension.",
  },
  {
    key: "game_like",
    label: "Focus Game",
    emoji: "🎮",
    tagline: "Bosses, XP, and unlocks",
    description:
      "Your focus sessions become battles, streaks become achievements. Progress feels like play.",
  },
];

export function ModeCard({
  option,
  isSelected,
  onPress,
  index,
}: {
  option: ModeOption;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 0.97 : 1, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
    backgroundColor: isSelected
      ? theme.colors.primary[500]
      : theme.colors.background.secondary,
    borderColor: isSelected
      ? theme.colors.primary[500]
      : theme.colors.border.light,
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 150)}
      style={{ width: "100%" }}
    >
      <Pressable
        onPress={onPress}
        accessibilityLabel={`${option.label}: ${option.tagline}`}
        accessibilityRole="button"
        accessibilityHint="Selects this focus mode"
      >
        <Animated.View
          style={[
            {
              padding: theme.spacing[5],
              borderRadius: 16,
              borderWidth: 2,
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[3],
            },
            animatedStyle,
          ]}
        >
          <Text fontSize={36}>{option.emoji}</Text>
          <Text
            variant="h3"
            color={isSelected ? "text.inverse" : "text.primary"}
            fontWeight="700"
          >
            {option.label}
          </Text>
          <Text
            variant="bodySmall"
            color={isSelected ? "text.inverse" : "primary.500"}
            fontWeight="600"
          >
            {option.tagline}
          </Text>
          <Text
            variant="body"
            color={isSelected ? "text.inverse" : "text.secondary"}
            textAlign="center"
          >
            {option.description}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
