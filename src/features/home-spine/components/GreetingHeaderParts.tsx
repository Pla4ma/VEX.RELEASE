import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSpring,
} from "react-native-reanimated";

import { Avatar } from "../../../components/Avatar";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { CompanionMood } from "../../companion/types";

export function GreetingHeaderSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box flexDirection="row" alignItems="center" px="lg" py="md" gap="md">
      <Box
        width={48}
        height={48}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
      />
      <Box gap="sm">
        <Box
          width={120}
          height={16}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          width={80}
          height={12}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
      </Box>
    </Box>
  );
}

export function ProfileAvatar({
  avatarUrl,
  displayName,
  onPressProfile,
}: {
  avatarUrl?: string;
  displayName: string;
  onPressProfile?: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityHint="Opens your profile."
      accessibilityLabel="Open profile"
      accessibilityRole="button"
      onPress={onPressProfile}
    >
      <Avatar
        source={avatarUrl}
        name={displayName}
        size="lg"
        borderWidth={2}
        borderColor={theme.colors.primary[500]}
      />
    </Pressable>
  );
}

export function CompanionHeaderAvatar({
  mood,
  onPress,
}: {
  mood?: CompanionMood;
  onPress?: () => void;
}): JSX.Element | null {
  const { theme } = useTheme();
  if (!mood) {
    return null;
  }
  return (
    <Pressable
      accessibilityHint="Opens your companion details."
      accessibilityLabel={`Open companion details. Current mood ${mood.toLowerCase()}.`}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minHeight: 44,
        minWidth: 44,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        alignItems="center"
        justifyContent="center"
        width={32}
        height={32}
        borderRadius="full"
        bg={theme.colors.background.secondary}
        borderWidth={1}
        borderColor={theme.colors.primary[400]}
      >
        <Text fontSize={16}>{getCompanionMoodSymbol(mood)}</Text>
      </Box>
    </Pressable>
  );
}

export function StreakIndicator({
  days,
  hoursRemaining,
}: {
  days: number;
  hoursRemaining?: number | null;
}): JSX.Element {
  const { theme } = useTheme();
  const isAtRisk =
    hoursRemaining !== null &&
    hoursRemaining !== undefined &&
    hoursRemaining <= 24;
  const isCritical =
    hoursRemaining !== null &&
    hoursRemaining !== undefined &&
    hoursRemaining <= 6;
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isAtRisk
          ? withRepeat(
              withSpring(1.1, { damping: 2, stiffness: 100 }),
              -1,
              true,
            )
          : 1,
      },
    ],
  }));
  const flameColor = isCritical
    ? theme.colors.error.DEFAULT
    : isAtRisk
      ? theme.colors.warning.DEFAULT
      : theme.colors.accent.orange;
  return (
    <Animated.View style={pulseStyle}>
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        px="sm"
        py="xs"
        borderRadius="full"
        bg={isAtRisk ? `${flameColor}20` : undefined}
        borderWidth={isAtRisk ? 1 : 0}
        borderColor={flameColor}
      >
        <Text fontSize={16}>F</Text>
        <Text
          variant="caption"
          color={isAtRisk ? "error.DEFAULT" : "text.secondary"}
          fontWeight="600"
        >
          {days}
        </Text>
        {isAtRisk && hoursRemaining !== null ? (
          <Text
            variant="caption"
            color={isCritical ? "error.DEFAULT" : "warning.DEFAULT"}
          >
            - {hoursRemaining}h
          </Text>
        ) : null}
      </Box>
    </Animated.View>
  );
}

export function LevelBadge({ level }: { level: number }): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box px="sm" py="xs" borderRadius="full" bg={theme.colors.primary[500]}>
      <Text
        variant="caption"
        color={theme.colors.text.inverse}
        fontWeight="700"
      >
        LVL {level}
      </Text>
    </Box>
  );
}

function getCompanionMoodSymbol(mood: CompanionMood): string {
  const symbols: Record<CompanionMood, string> = {
    SLEEPY: "o",
    CONTENT: "+",
    FOCUSED: "#",
    DETERMINED: "^",
    ECSTATIC: "*",
    STRUGGLING: "~",
    DANGER: "!",
  };
  return symbols[mood];
}
