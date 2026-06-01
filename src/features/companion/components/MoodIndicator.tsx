import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import { glow } from '../../../theme/tokens/elevation';
import { ambientLoop } from '../../../theme/tokens/motion';
import type { CompanionMood } from '../types';
import { getMoodVisual, resolveMoodColor } from './mood-visual';

interface MoodIndicatorProps {
  mood: CompanionMood;
  size?: number;
  showLabel?: boolean;
}

export function MoodIndicator({
  mood,
  size = 24,
  showLabel = true,
}: MoodIndicatorProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const phase = useSharedValue(0);
  const visual = getMoodVisual(mood);
  const color = resolveMoodColor(mood, theme.colors.semantic);

  const animated = visual.shape === 'pulse' || visual.shape === 'radiant';
  const restOpacity = visual.shape === 'dim' ? 0.45 : 0.85;

  useEffect(() => {
    if (isReducedMotion || !animated) {
      cancelAnimation(phase);
      phase.value = 0.5;
      return;
    }
    phase.value = withRepeat(
      withTiming(1, {
        duration: visual.shape === 'radiant' ? 1800 : ambientLoop.breathing,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(phase);
  }, [animated, isReducedMotion, phase, visual.shape]);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: animated
      ? interpolate(phase.value, [0, 1], [restOpacity * 0.7, 1])
      : restOpacity,
    transform: [
      { scale: animated ? interpolate(phase.value, [0, 1], [0.9, 1.12]) : 1 },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity:
      visual.shape === 'alert' || visual.shape === 'radiant'
        ? interpolate(phase.value, [0, 1], [0.2, 0.55])
        : 0.28,
    transform: [{ scale: interpolate(phase.value, [0, 1], [1.2, 1.7]) }],
  }));

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}
      accessibilityLabel={`Companion mood: ${visual.label}`}
    >
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1.5,
              borderColor: color,
            },
            ringStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: size * 0.62,
              height: size * 0.62,
              borderRadius: size * 0.31,
              backgroundColor: color,
              ...glow(color, visual.glowTier),
            },
            orbStyle,
          ]}
        />
      </View>
      {showLabel ? (
        <Text variant="label" style={{ color }}>
          {visual.label}
        </Text>
      ) : null}
    </View>
  );
}
