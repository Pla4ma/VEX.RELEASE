/**
 * SuccessCelebration Component
 *
 * Animated success celebration for first result screen.
 * Shows celebration icon with glow effects and sparkles.
 *
 * @phase 4
 */

import React from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

/**
 * Animated success celebration
 */
export function SuccessCelebration(): React.ReactNode {
  const { theme } = useTheme();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withTiming(1.1, { duration: 1000 }), -1, true),
      },
    ],
    opacity: withRepeat(withTiming(0.7, { duration: 1000 }), -1, true),
  }));

  return (
    <Box justifyContent="center" alignItems="center" height={180}>
      {/* Glow effect */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: `${theme.colors.success[500]}30`,
          },
          pulseStyle,
        ]}
      />

      {/* Success icon */}
      <Box
        width={100}
        height={100}
        borderRadius="full"
        bg="success.DEFAULT"
        justifyContent="center"
        alignItems="center"
        borderWidth={3}
        borderColor={`${theme.colors.success.DEFAULT}50`}
      >
        <Text fontSize={48}>🎉</Text>
      </Box>

      {/* Floating sparkles */}
      <Animated.View
        entering={FadeIn.duration(600).delay(400)}
        style={{
          position: 'absolute',
          top: 20,
          right: 30,
        }}
      >
        <Text fontSize={20}>✨</Text>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(600).delay(600)}
        style={{
          position: 'absolute',
          bottom: 25,
          left: 25,
        }}
      >
        <Text fontSize={18}>⭐</Text>
      </Animated.View>
    </Box>
  );
}
