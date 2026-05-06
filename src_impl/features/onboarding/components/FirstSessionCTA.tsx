/**
 * FirstSessionCTA Component
 *
 * Final onboarding screen before first session.
 * "Let's do your first session, [name]."
 * Shows chosen duration pre-selected. Single button to start.
 *
 * @phase 2.6
 */

import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, withRepeat, withSpring, withTiming } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import type { FocusDuration, FocusGoal } from "../schemas";
import { DURATION_OPTIONS, GOAL_OPTIONS } from "../service";

interface FirstSessionCTAProps {
  userName: string | null;
  duration: FocusDuration | null;
  goal: FocusGoal | null;
  onStartSession: () => void;
  onBack: () => void;
}

/**
 * Pulsing circle animation for excitement
 */
function PulseRing(): JSX.Element {
  const { theme } = useTheme();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withTiming(1.3, { duration: 1500 }), -1, true),
      },
    ],
    opacity: withRepeat(withTiming(0.3, { duration: 1500 }), -1, true),
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: `${theme.colors.success[500]}40`,
        },
        pulseStyle,
      ]}
    />
  );
}

/**
 * Session preview card
 */
function SessionPreview({ duration, goal }: { duration: FocusDuration | null; goal: FocusGoal | null }): JSX.Element {
  const { theme } = useTheme();

  const durationOption = DURATION_OPTIONS.find((d) => d.value === duration);
  const goalOption = GOAL_OPTIONS.find((g) => g.key === goal);

  return (
    <Box p="lg" borderRadius="xl" bg="background.secondary" borderWidth={1} borderColor="border.light" alignItems="center" gap="md">
      {/* Duration Display */}
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={40}>{durationOption?.emoji ?? "🍅"}</Text>
        <Text variant="h2" color="text.primary" fontWeight="700">
          {durationOption?.label ?? "25 min"}
        </Text>
      </Box>

      {/* Goal tag (if selected) */}
      {goalOption && (
        <Box flexDirection="row" alignItems="center" gap="xs" px="md" py="sm" borderRadius="full" bg={`${theme.colors.primary[500]}15`}>
          <Text fontSize={14}>{goalOption.emoji}</Text>
          <Text variant="caption" color="primary.500" fontWeight="600">
            {goalOption.label}
          </Text>
        </Box>
      )}

      {/* XP hint */}
      <Text variant="bodySmall" color="text.tertiary">
        Estimated: {Math.round((duration ?? 25) * 2)} XP
      </Text>
    </Box>
  );
}

/**
 * First session CTA screen
 */
export function FirstSessionCTA({ userName, duration, goal, onStartSession, onBack }: FirstSessionCTAProps): JSX.Element {
  const { theme } = useTheme();
  const displayName = userName || "there";
  const durationOption = DURATION_OPTIONS.find((d) => d.value === duration);

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="lg">
          <Text variant="label" color="success.DEFAULT">
            Step 4 of 4
          </Text>
          <Text variant="h2" color="text.primary">
            Let's do your first session, {displayName}.
          </Text>
          <Text variant="body" color="text.secondary">
            You're ready to start. One session is all it takes to begin your streak.
          </Text>
        </Box>
      </Animated.View>

      {/* Session Preview */}
      <Animated.View entering={FadeInUp.duration(500).delay(200)} style={{ width: "100%" }}>
        <Box alignItems="center" py="xl">
          {/* Pulse animation behind */}
          <Box justifyContent="center" alignItems="center" height={200}>
            <PulseRing />
            <Box width={120} height={120} borderRadius="full" bg="success.DEFAULT" justifyContent="center" alignItems="center" zIndex={1}>
              <Text fontSize={48}>🎯</Text>
            </Box>
          </Box>

          {/* Config preview */}
          <Box mt="lg" width="100%">
            <SessionPreview duration={duration} goal={goal} />
          </Box>
        </Box>
      </Animated.View>

      {/* Benefits list */}
      <Animated.View entering={FadeIn.duration(400).delay(400)}>
        <Box gap="sm" mt="md">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>🔥</Text>
            <Text variant="body" color="text.secondary">
              Start your streak today
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>⚡</Text>
            <Text variant="body" color="text.secondary">
              Earn XP and level up
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>👹</Text>
            <Text variant="body" color="text.secondary">
              Defeat your first boss
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {/* Spacer */}
      <Box flex={1} minHeight={20} />

      {/* CTA Button */}
      <Animated.View entering={FadeInUp.duration(400).delay(600)} style={{ width: "100%" }}>
        <Button variant="primary" size="lg" fullWidth onPress={onStartSession} accessibilityLabel="focus session →`} button" accessibilityRole="button" accessibilityHint="Activates this control">
          {`Start ${durationOption?.label ?? "25-minute"} focus session →`}
        </Button>
      </Animated.View>

      {/* Back Option */}
      <Animated.View entering={FadeIn.duration(400).delay(700)} style={{ marginTop: "auto" }}>
        <Pressable onPress={onBack} accessibilityLabel="← Go back button" accessibilityRole="button" accessibilityHint="Activates this control">
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">
              ← Go back
            </Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}

export default FirstSessionCTA;
