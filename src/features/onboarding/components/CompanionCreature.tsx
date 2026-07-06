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
import { useReducedMotion } from '../../../hooks/useReducedMotion';

/**
 * Animated companion creature with personality
 */

// Static shape for the glow halo behind the companion — only `backgroundColor`
// is theme-dependent, the rest is constant.
const GLOW_HALO_BASE_STYLE = {
  position: 'absolute' as const,
  width: 180,
  height: 180,
  borderRadius: 90,
};

// Static shape for the main companion orb — only color tokens are theme-dependent.
const COMPANION_ORB_BASE_STYLE = {
  width: 120,
  height: 120,
  borderRadius: 60,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  borderWidth: 3,
};

// Three sparkle slots with stable, position-encoded keys (not array index).
// Each entry has only the position props it actually uses; the render layer
// spreads them conditionally to keep the ViewStyle type narrow.
type SparklePosition = {
  key: string;
  delay: number;
  fontSize: number;
  glyph: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

const SPARKLE_POSITIONS: readonly SparklePosition[] = [
  { key: 'sparkle-tr', top: 20, right: 40, fontSize: 20, glyph: '✨', delay: 400 },
  { key: 'sparkle-bl', bottom: 30, left: 35, fontSize: 16, glyph: '⭐', delay: 600 },
  { key: 'sparkle-tl', top: 40, left: 30, fontSize: 18, glyph: '💫', delay: 800 },
];

export function CompanionCreature(): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  // Breathing animation
  const breatheStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isReducedMotion
          ? 1
          : withRepeat(withTiming(1.05, { duration: 3000 }), -1, true),
      },
    ],
  }));

  // Glow effect
  const glowStyle = useAnimatedStyle(() => ({
    opacity: isReducedMotion
      ? 0.6
      : withRepeat(withTiming(0.6, { duration: 2000 }), -1, true),
    transform: [
      {
        scale: isReducedMotion
          ? 1.2
          : withRepeat(withTiming(1.2, { duration: 2000 }), -1, true),
      },
    ],
  }));

  return (
    <Box justifyContent="center" alignItems="center" height={200}>
      {/* Glow effect behind companion */}
      <Animated.View
        style={[
          GLOW_HALO_BASE_STYLE,
          { backgroundColor: `${theme.colors.primary[500]}20` },
          glowStyle,
        ]}
      />

      {/* Companion creature */}
      <Animated.View
        style={[
          COMPANION_ORB_BASE_STYLE,
          {
            backgroundColor: theme.colors.primary[500],
            borderColor: `${theme.colors.primary[600]}50`,
            boxShadow: `0px 8px 16px ${theme.colors.primary}[500] / 0.3`,
          },
          breatheStyle,
        ]}
      >
        <Text fontSize={48}>🔥</Text>
      </Animated.View>

      {/* Sparkles around companion — stable position-encoded keys. */}
      {SPARKLE_POSITIONS.map((sparkle) => (
        <Animated.View
          key={sparkle.key}
          entering={isReducedMotion ? undefined : FadeIn.duration(600).delay(sparkle.delay)}
          style={{
            position: 'absolute',
            top: sparkle.top,
            right: sparkle.right,
            bottom: sparkle.bottom,
            left: sparkle.left,
          }}
        >
          <Text fontSize={sparkle.fontSize}>{sparkle.glyph}</Text>
        </Animated.View>
      ))}
    </Box>
  );
}
