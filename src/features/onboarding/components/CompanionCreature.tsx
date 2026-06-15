/**
 * CompanionCreature Component
 *
 * Animated companion creature with personality for companion reveal screen.
 * Shows breathing animation, glow effects, and sparkles.
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
 * Animated companion creature with personality
 */
export function CompanionCreature(): React.ReactNode {
  const { theme } = useTheme();

  // Breathing animation
  const breatheStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withTiming(1.05, { duration: 3000 }), -1, true),
      },
    ],
  }));

  // Glow effect
  const glowStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(withTiming(0.6, { duration: 2000 }), -1, true),
    transform: [
      {
        scale: withRepeat(withTiming(1.2, { duration: 2000 }), -1, true),
      },
    ],
  }));

  return (
    <Box justifyContent="center" alignItems="center" height={200}>
      {/* Glow effect behind companion */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: `${theme.colors.primary[500]}20`,
          },
          glowStyle,
        ]}
      />

      {/* Companion creature */}
      <Animated.View
        style={[
          breatheStyle,
          {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.primary[500],
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: `${theme.colors.primary[600]}50`,
            boxShadow: `0px 8px 16px ${theme.colors.primary}[500] / 0.3`,
          },
        ]}
      >
        <Text fontSize={48}>🔥</Text>
      </Animated.View>

      {/* Sparkles around companion */}
      <Animated.View
        entering={FadeIn.duration(600).delay(400)}
        style={{
          position: 'absolute',
          top: 20,
          right: 40,
        }}
      >
        <Text fontSize={20}>✨</Text>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(600).delay(600)}
        style={{
          position: 'absolute',
          bottom: 30,
          left: 35,
        }}
      >
        <Text fontSize={16}>⭐</Text>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(600).delay(800)}
        style={{
          position: 'absolute',
          top: 40,
          left: 30,
        }}
      >
        <Text fontSize={18}>💫</Text>
      </Animated.View>
    </Box>
  );
}

export default CompanionCreature;