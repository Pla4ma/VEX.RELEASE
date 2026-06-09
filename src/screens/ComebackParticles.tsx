import React, { useEffect } from 'react';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';
import { useReducedMotion } from '@/hooks';

interface ParticleProps {
  index: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export function Particle({
  index,
  left,
  size,
  duration,
  delay,
  color,
}: ParticleProps): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = isReducedMotion
      ? 1
      : withRepeat(
          withTiming(1, { duration, easing: Easing.linear }),
          -1,
          false,
        );
  }, [duration, progress, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + 0.5 * (1 - progress.value),
    transform: [
      { translateY: 180 - progress.value * 560 },
      { translateX: Math.sin(progress.value * Math.PI * 2 + delay) * 16 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        isReducedMotion ? { opacity: 0.2 } : animatedStyle,
        {
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          bottom: -40 + index * 8,
        },
      ]}
    />
  );
}

const styles = createSheet({
  particle: {
    position: 'absolute',
  },
});
