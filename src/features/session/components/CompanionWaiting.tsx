/**
 * CompanionWaiting Component
 *
 * Animated companion with waiting state behavior for starter sessions.
 * Shows gentle breathing animation and progress sparkles.
 *
 * @phase 4
 */

import React from "react";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

interface CompanionWaitingProps {
  progress: number; // 0-1
}

/**
 * Animated companion with waiting state behavior
 */
export function CompanionWaiting({
  progress,
}: CompanionWaitingProps): JSX.Element {
  const { theme } = useTheme();

  // Gentle breathing animation
  const breatheStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withTiming(1.03, { duration: 2500 }), -1, true),
      },
    ],
  }));

  // Encouraging glow effect
  const glowStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(withTiming(0.4, { duration: 3000 }), -1, true),
    transform: [
      {
        scale: withRepeat(withTiming(1.1, { duration: 3000 }), -1, true),
      },
    ],
  }));

  return (
    <Box justifyContent="center" alignItems="center" height={120}>
      {/* Gentle glow effect */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: `${theme.colors.primary[500]}15`,
          },
          glowStyle,
        ]}
      />

      {/* Companion creature */}
      <Animated.View
        style={[
          breatheStyle,
          {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primary[500],
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: `${theme.colors.primary[600]}30`,
          },
        ]}
      >
        <Text fontSize={28}>🔥</Text>
      </Animated.View>

      {/* Progress sparkles */}
      {progress > 0.25 && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            position: "absolute",
            top: 10,
            right: 15,
          }}
        >
          <Text fontSize={16}>✨</Text>
        </Animated.View>
      )}

      {progress > 0.5 && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            position: "absolute",
            bottom: 15,
            left: 10,
          }}
        >
          <Text fontSize={14}>⭐</Text>
        </Animated.View>
      )}

      {progress > 0.75 && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            position: "absolute",
            top: 15,
            left: 15,
          }}
        >
          <Text fontSize={16}>💫</Text>
        </Animated.View>
      )}
    </Box>
  );
}

export default CompanionWaiting;
