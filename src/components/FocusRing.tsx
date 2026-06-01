import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from './primitives/Text';
import { useTheme } from '../theme';
import { createSheet } from '@/shared/ui/create-sheet';
import { useReducedMotion } from '@/hooks';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type FocusRingProps = {
  progressPercent: number;
  focusMinutes: number;
  size?: number;
  gradientColors?: readonly [string, string];
};

export function FocusRing({
  progressPercent,
  focusMinutes,
  size = 148,
  gradientColors,
}: FocusRingProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const clamped = Math.max(0, Math.min(100, progressPercent));

  useEffect(() => {
    progress.value = isReducedMotion
      ? clamped
      : withTiming(clamped, {
          duration: 900,
          easing: Easing.out(Easing.cubic),
        });
  }, [clamped, progress, isReducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (circumference * progress.value) / 100,
  }));

  return (
    <View
      accessibilityLabel={`Daily goal progress ${focusMinutes} minutes, ${Math.round(clamped)} percent`}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="focus-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop
              offset="0%"
              stopColor={gradientColors?.[0] ?? theme.colors.primary[500]}
            />
            <Stop
              offset="100%"
              stopColor={gradientColors?.[1] ?? theme.colors.primary[300]}
            />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.border.light}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#focus-ring)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
          fill="none"
        />
      </Svg>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.center]}
      >
        <Text fontSize={32} fontWeight="800" color={theme.colors.text.primary}>
          {Math.round(clamped)}%
        </Text>
      </View>
    </View>
  );
}

const styles = createSheet({
  center: { alignItems: 'center', justifyContent: 'center' },
});
