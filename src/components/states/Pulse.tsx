/**
 * Pulse Loading Animation
 *
 * Pulsing circle loading indicator.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { styles } from './loading-variants.styles';

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
