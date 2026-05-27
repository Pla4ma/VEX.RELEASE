/**
 * StreakFreezeButton Component
 *
 * Shows freeze button if user can freeze their streak today.
 * One use per day — appears in StreakWidget footer.
 *
 * @phase 2.4
 */

import React from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export interface StreakFreezeButtonProps {
  /** Whether freeze is available today */
  canFreeze: boolean;
  /** Whether user has already frozen today */
  hasFrozenToday: boolean;
  /** Called when user taps to freeze */
  onFreeze: () => void;
  /** Loading state while freezing */
  isFreezing?: boolean;
  /** Compact mode for inline display */
  compact?: boolean;
}

export function StreakFreezeButton({
  canFreeze,
  hasFrozenToday,
  onFreeze,
  isFreezing = false,
  compact = false,
}: StreakFreezeButtonProps): JSX.Element | null {
  const { theme } = useTheme();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: canFreeze
      ? [
          {
            scale: withRepeat(
              withSequence(
                withTiming(1.05, { duration: 1000 }),
                withTiming(1, { duration: 1000 }),
              ),
              -1,
              true,
            ),
          },
        ]
      : [],
  }));

  // Don't show if neither can freeze nor already frozen
  if (!canFreeze && !hasFrozenToday) {
    return null;
  }

  if (hasFrozenToday) {
    return (
      <Animated.View entering={FadeIn}>
        <Box
          flexDirection="row"
          alignItems="center"
          gap="xs"
          px="sm"
          py="xs"
          borderRadius="full"
          bg={theme.colors.background.tertiary}
          opacity={0.7}
        >
          <Text fontSize={12}>🧊</Text>
          <Text variant="caption" color={theme.colors.text.tertiary}>
            Frozen today
          </Text>
        </Box>
      </Animated.View>
    );
  }

  if (compact) {
    return (
      <Animated.View entering={FadeIn} style={pulseStyle}>
        <Pressable
          onPress={onFreeze}
          disabled={isFreezing}
          accessibilityLabel="🧊 button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Box
            flexDirection="row"
            alignItems="center"
            gap="xs"
            px="sm"
            py="xs"
            borderRadius="full"
            bg={`${theme.colors.info.DEFAULT}20`}
            borderWidth={1}
            borderColor={theme.colors.info.DEFAULT}
            opacity={isFreezing ? 0.5 : 1}
          >
            <Text fontSize={12}>🧊</Text>
            <Text
              variant="caption"
              color={theme.colors.info.dark}
              fontWeight="600"
            >
              {isFreezing ? "Freezing..." : "Freeze"}
            </Text>
          </Box>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn} style={pulseStyle}>
      <Pressable
        onPress={onFreeze}
        disabled={isFreezing}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          mx="lg"
          mb="md"
          p="md"
          borderRadius="lg"
          bg={theme.colors.info[50]}
          borderWidth={1}
          borderColor={theme.colors.info.DEFAULT}
          flexDirection="row"
          alignItems="center"
          gap="md"
          opacity={isFreezing ? 0.5 : 1}
        >
          <Box
            width={40}
            height={40}
            borderRadius="full"
            bg={`${theme.colors.info.DEFAULT}20`}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={20}>🧊</Text>
          </Box>

          <Box flex={1}>
            <Text
              variant="body"
              color={theme.colors.text.primary}
              fontWeight="600"
            >
              {isFreezing ? "Freezing streak..." : "Freeze Your Streak"}
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Skip today without breaking your streak
            </Text>
          </Box>

          <Box px="md" py="xs" borderRadius="md" bg={theme.colors.info.DEFAULT}>
            <Text
              variant="caption"
              color={theme.colors.text.inverse}
              fontWeight="700"
            >
              FREEZE
            </Text>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

export default StreakFreezeButton;
