import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { launchColors } from '../../theme/tokens/launch-colors';

interface ShimmerSweepProps {
  color?: string;
  bandWidth?: number;
  periodMs?: number;
  borderRadius?: number;
}

export function ShimmerSweep({
  color = launchColors.rgb_255_255_255_0_18,
  bandWidth = 90,
  periodMs = 4200,
  borderRadius = 0,
}: ShimmerSweepProps): JSX.Element | null {
  const { isReducedMotion } = useReducedMotion();
  const [width, setWidth] = useState(0);
  const clock = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion || width === 0) {
      cancelAnimation(clock);
      clock.value = 0;
      return;
    }
    clock.value = withRepeat(
      withTiming(1, { duration: periodMs, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(clock);
  }, [clock, isReducedMotion, periodMs, width]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          clock.value,
          [0, 0.32, 1],
          [-bandWidth, width + bandWidth, width + bandWidth],
        ),
      },
      { rotate: '18deg' },
    ],
  }));

  const onLayout = (event: LayoutChangeEvent): void => {
    setWidth(event.nativeEvent.layout.width);
  };

  if (isReducedMotion) {
    return null;
  }

  return (
    <View
      onLayout={onLayout}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}
    >
      <Animated.View
        style={[
          { position: 'absolute', top: -20, bottom: -20, width: bandWidth },
          sweepStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', color, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
