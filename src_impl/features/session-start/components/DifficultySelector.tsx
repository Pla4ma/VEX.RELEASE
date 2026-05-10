/**
 * DifficultySelector Component
 *
 * Three difficulty options for session stakes:
 * - CASUAL: Unlimited pauses, 50% XP
 * - FOCUSED: 2 max pauses, 100% XP (default)
 * - DEEP_WORK: 0 pauses, 150% XP
 *
 * @phase 4
 */

import React from "react";
import { View, Pressable } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

import { useTheme } from "../../../theme";
import { Text } from "../../../components/primitives/Text";
import { useHaptics } from "../../../utils/haptics";
import { eventBus } from "../../../events";
import * as Sentry from "@sentry/react-native";

export type SessionDifficulty = "CASUAL" | "FOCUSED" | "DEEP_WORK";

interface DifficultyOption {
  id: SessionDifficulty;
  icon: string;
  name: string;
  pauseLimit: string;
  xpMultiplier: string;
  description: string;
  color: string;
}

interface DifficultySelectorProps {
  selected: SessionDifficulty;
  onChange: (difficulty: SessionDifficulty) => void;
  disabled?: boolean;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: "CASUAL",
    icon: "🌿",
    name: "Casual",
    pauseLimit: "Unlimited",
    xpMultiplier: "50%",
    description: "Good for maintenance",
    color: "#22C55E", // Green
  },
  {
    id: "FOCUSED",
    icon: "⚡",
    name: "Focused",
    pauseLimit: "2 max",
    xpMultiplier: "100%",
    description: "Standard mode",
    color: "#3B82F6", // Blue
  },
  {
    id: "DEEP_WORK",
    icon: "🔥",
    name: "Deep Work",
    pauseLimit: "0 pauses",
    xpMultiplier: "150%",
    description: "Maximum impact",
    color: "#EF4444", // Red
  },
];

export function DifficultySelector({ selected, onChange, disabled = false }: DifficultySelectorProps): JSX.Element {
  const { theme } = useTheme();
  const haptics = useHaptics();

  const handleSelect = (difficulty: SessionDifficulty) => {
    if (disabled) {
      return;
    }
    haptics.light();

    // Track analytics
    Sentry.addBreadcrumb({
      category: "session",
      message: "Difficulty selected",
      data: { difficulty, xpMultiplier: DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)?.xpMultiplier },
      level: "info",
    });

    // Publish event for integration
    eventBus.publish("session:difficulty_selected", {
      difficulty,
      timestamp: Date.now(),
    });

    onChange(difficulty);
  };

  const containerStyle = {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  };

  return (
    <View style={containerStyle}>
      {DIFFICULTY_OPTIONS.map((option) => {
        const isSelected = selected === option.id;

        return <DifficultyCard key={option.id} option={option} isSelected={isSelected} disabled={disabled} onPress={() => handleSelect(option.id)} />;
      })}
    </View>
  );
}

interface DifficultyCardProps {
  option: DifficultyOption;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}

function DifficultyCard({ option, isSelected, disabled, onPress }: DifficultyCardProps): JSX.Element {
  const { theme } = useTheme();

  const scale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.05 : 1.0, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
  }));

  const borderColor = isSelected ? option.color : theme.colors.border.light;
  const backgroundColor = isSelected
    ? `${option.color}10` // 10% opacity
    : theme.colors.background.secondary;

  return (
    <Animated.View style={[{ flex: 1 }, scale]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          {
            flex: 1,
            padding: theme.spacing[3],
            borderRadius: theme.borderRadius.lg,
            borderWidth: 2,
            borderColor,
            backgroundColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        accessibilityLabel={`${option.name} difficulty: ${option.pauseLimit} pauses, ${option.xpMultiplier} XP. ${option.description}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={{ fontSize: 24, marginBottom: theme.spacing[2] }}>{option.icon}</Text>

        <Text variant="body" color={theme.colors.text.primary} style={{ marginBottom: theme.spacing[1], fontWeight: "700" }}>
          {option.name}
        </Text>

        <View style={{ marginBottom: theme.spacing[2] }}>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {option.pauseLimit} pauses
          </Text>
          <Text variant="caption" color={option.color} style={{ fontWeight: "600" }}>
            {option.xpMultiplier} XP
          </Text>
        </View>

        <Text variant="caption" color={theme.colors.text.tertiary}>
          {option.description}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
