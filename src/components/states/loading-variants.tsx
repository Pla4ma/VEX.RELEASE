import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';

export const Spinner: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => {
  return <ActivityIndicator size={size} color={color} />;
};

export const Dots: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);
  const { isReducedMotion } = useReducedMotion();
  useEffect(() => {
    if (isReducedMotion) {
      return;
    }
    dot1.value = withRepeat(
      withTiming(1, { duration: 400, easing: Easing.ease }),
      -1,
      true,
    );
    dot2.value = withRepeat(
      withTiming(1, { duration: 400, easing: Easing.ease }),
      -1,
      true,
    );
    dot3.value = withRepeat(
      withTiming(1, { duration: 400, easing: Easing.ease }),
      -1,
      true,
    );
  }, [dot1, dot2, dot3, isReducedMotion]);
  const dotSize = size / 3;
  const gap = dotSize / 2;
  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1.value }],
    opacity: 0.4 + dot1.value * 0.6,
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2.value }],
    opacity: 0.4 + dot2.value * 0.6,
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3.value }],
    opacity: 0.4 + dot3.value * 0.6,
  }));
  return (
    <View style={[styles.dotsContainer, { gap }]}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
          dot3Style,
        ]}
      />
    </View>
  );
};

export const Pulse: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const { isReducedMotion } = useReducedMotion();
  useEffect(() => {
    if (isReducedMotion) {
      return;
    }
    scale.value = withRepeat(
      withTiming(1.5, { duration: 1000, easing: Easing.ease }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1000, easing: Easing.ease }),
      -1,
      true,
    );
  }, [scale, opacity, isReducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            position: 'absolute',
            top: 0,
            left: 0,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const styles = createSheet({
  fullScreen: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  dotsContainer: { flexDirection: 'row', alignItems: 'center' },
  dot: { backgroundColor: lightColors.text.primary },
  pulse: { opacity: 0.3 },
});
