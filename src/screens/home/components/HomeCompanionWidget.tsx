import React from "react";
import { View, TouchableOpacity } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { getMoodEmoji } from "../../../features/companion/components/companion-helpers";
import { ELEMENT_THEMES } from "../../../features/companion/types";
import type { CompanionState } from "../../../features/companion/types";
import type { HomeCompanionStatus } from "../hooks/useHomeCompanion";

interface HomeCompanionWidgetProps {
  status: HomeCompanionStatus;
  onRetry: () => void;
  onPress?: () => void;
}

function CompanionCard({
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

function SkeletonCard(): JSX.Element {
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

export function HomeCompanionWidget({
  status,
  onRetry,
  onPress,
}: HomeCompanionWidgetProps): JSX.Element | null {
  const { theme } = useTheme();

  if (status.kind === "loading") {
    return <SkeletonCard />;
  }

  if (status.kind === "empty") {
    return (
      <View style={{ padding: theme.spacing[4], alignItems: "center" }}>
        <Text variant="caption" color="text.secondary">
          Your companion will appear after your first focus session.
        </Text>
      </View>
    );
  }

  if (status.kind === "error") {
    return (
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        accessibilityLabel="Retry loading companion"
        accessibilityRole="button"
      >
        <View
          style={{
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.spacing[4],
            borderWidth: 1,
            borderColor: theme.colors.error.light,
            padding: theme.spacing[4],
            alignItems: "center",
          }}
        >
          <Text variant="body" color="error.DEFAULT">
            Companion did not load.
          </Text>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginTop: theme.spacing[1] }}
          >
            Tap to retry.
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (status.kind === "offline") {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background.elevated,
          borderRadius: theme.spacing[4],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          padding: theme.spacing[4],
          alignItems: "center",
          opacity: 0.7,
        }}
      >
        <Text variant="caption" color="text.secondary">
          Companion data is offline. It will appear when you reconnect.
        </Text>
      </View>
    );
  }

  return <CompanionCard state={status.state} onPress={onPress} />;
}
