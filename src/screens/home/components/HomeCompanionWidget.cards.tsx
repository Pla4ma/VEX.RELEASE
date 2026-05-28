import React from "react";
import { View, TouchableOpacity } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { getMoodEmoji } from "../../../features/companion/components/companion-helpers";
import { ELEMENT_THEMES } from "../../../features/companion/types";
import type { CompanionState } from "../../../features/companion/types";

export function CompanionCard({
  state,
  onPress,
}: {
  state: CompanionState;
  onPress?: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const elementTheme = ELEMENT_THEMES[state.element];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel="Companion status card"
      accessibilityRole="button"
      accessibilityHint="View companion details"
    >
      <Animated.View
        entering={FadeInUp.duration(300)}
        style={{
          backgroundColor: theme.colors.background.elevated,
          borderRadius: theme.spacing[4],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          padding: theme.spacing[4],
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing[4],
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: elementTheme.primary + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="h3" style={{ fontSize: 24 }}>
            {getMoodEmoji(state.currentMood)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            variant="body"
            color="text.primary"
            style={{ fontWeight: "700" }}
          >
            {state.element} {state.phase}
          </Text>
          <Text variant="caption" color="text.secondary">
            Level {state.level} · {Math.floor(state.totalFocusMinutes)}m focused
          </Text>
        </View>

        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: elementTheme.primary,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export function SkeletonCard(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.background.elevated,
        borderRadius: theme.spacing[4],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        padding: theme.spacing[4],
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing[4],
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: theme.colors.background.tertiary,
        }}
      />
      <View style={{ flex: 1, gap: theme.spacing[2] }}>
        <View
          style={{
            height: 16,
            width: 120,
            borderRadius: theme.spacing[1],
            backgroundColor: theme.colors.background.tertiary,
          }}
        />
        <View
          style={{
            height: 12,
            width: 180,
            borderRadius: theme.spacing[1],
            backgroundColor: theme.colors.background.tertiary,
          }}
        />
      </View>
    </View>
  );
}
