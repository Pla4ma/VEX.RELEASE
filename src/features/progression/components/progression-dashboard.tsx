import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { ErrorState } from "../../../components/states/ErrorState";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { useTheme } from "../../../theme";
import { useStreakMultiplier, useStreakSummary } from "../../streaks/hooks";
import { useProgressionSummary } from "../hooks";
import { ProgressionStatCard } from "./progression-stat-card";

interface ProgressionDashboardProps {
  userId: string;
  onStartSession?: () => void;
}

export function ProgressionDashboard({
  userId,
  onStartSession,
}: ProgressionDashboardProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakSummary(userId);
  const multiplierQuery = useStreakMultiplier(userId);
  const progressPercent = progressionQuery.data?.progressPercent ?? 0;
  const progressStyle = useAnimatedStyle(() => ({
    width: isReducedMotion
      ? `${progressPercent}%`
      : withSpring(`${progressPercent}%`, { damping: 15, stiffness: 120 }),
  }));

  if (progressionQuery.isPending) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          gap: theme.spacing[3],
          padding: theme.spacing[4],
        }}
      >
        <Skeleton
          width="35%"
          height={16}
          borderRadius={theme.borderRadius.sm}
        />
        <Skeleton
          width="65%"
          height={28}
          borderRadius={theme.borderRadius.md}
        />
        <Skeleton
          width="100%"
          height={10}
          borderRadius={theme.borderRadius.sm}
        />
        <View style={{ flexDirection: "row", gap: theme.spacing[3] }}>
          <Skeleton
            width="48%"
            height={72}
            borderRadius={theme.borderRadius.md}
          />
          <Skeleton
            width="48%"
            height={72}
            borderRadius={theme.borderRadius.md}
          />
        </View>
      </View>
    );
  }

  if (progressionQuery.isError || !progressionQuery.data) {
    return (
      <ErrorState
        title="Progress needs a sync"
        description="Your earned momentum is still safe. Retry to refresh the current level and next milestone."
        retryLabel="Retry progress"
        onRetry={() => void progressionQuery.refetch()}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          minHeight: 220,
        }}
      />
    );
  }

  const progression = progressionQuery.data;
  const streak = streakQuery.data;
  const multiplier = multiplierQuery.data?.multiplier ?? 1;
  const remainingXp = Math.max(
    0,
    progression.nextLevelThreshold - progression.xp,
  );

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        gap: theme.spacing[4],
        padding: theme.spacing[4],
      }}
    >
      <View style={{ gap: theme.spacing[1] }}>
        <Text variant="label" color={theme.colors.primary[500]}>
          Progression
        </Text>
        <Text variant="h3" color={theme.colors.text.primary}>
          Level {progression.level}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {remainingXp.toLocaleString()} XP to Level {progression.level + 1}
        </Text>
      </View>

      <View style={{ gap: theme.spacing[2] }}>
        <View
          accessibilityLabel={`Level progress ${progression.progressPercent} percent`}
          accessibilityRole="progressbar"
          style={{
            backgroundColor: theme.colors.surface.pressed,
            borderRadius: theme.borderRadius.sm,
            height: 10,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: theme.colors.primary[500],
                borderRadius: theme.borderRadius.sm,
                height: "100%",
              },
              progressStyle,
            ]}
          />
        </View>
        <Text variant="caption" color={theme.colors.text.tertiary}>
          {progression.xp.toLocaleString()} /{" "}
          {progression.nextLevelThreshold.toLocaleString()} XP
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing[3],
        }}
      >
        <ProgressionStatCard
          label="Current streak"
          value={`${streak?.currentDays ?? 0} days`}
          detail={
            streak?.isAtRisk ? "Needs a session today" : "Protected by focus"
          }
          tone={streak?.isAtRisk ? "warning" : "default"}
        />
        <ProgressionStatCard
          label="XP multiplier"
          value={`x${multiplier.toFixed(2)}`}
          detail={
            multiplier > 1 ? "Streak bonus active" : "Build a 3-day streak"
          }
          tone={multiplier > 1 ? "success" : "default"}
        />
      </View>

      {onStartSession ? (
        <Button
          variant="outline"
          onPress={onStartSession}
          accessibilityLabel="Start a focus session"
          accessibilityRole="button"
          accessibilityHint="Starts a session to earn XP and protect today's progress"
        >
          Earn progress now
        </Button>
      ) : null}
    </View>
  );
}
