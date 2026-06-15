import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { timingPresets } from '../../../theme/tokens/motion';
import { borderRadius } from '../../../theme/tokens/radius';

export function GlowParticle({
  color,
  index,
}: {
  color: string;
  index: number;
}): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const size = 6 + (index % 3) * 3;
  const angle = (index * 72 + 15) * (Math.PI / 180);
  const distance = 40 + index * 12;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance;

  const particleX = useSharedValue(0);
  const particleY = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const particleScale = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      particleOpacity.value = 0;
      return;
    }
    particleOpacity.value = withDelay(
      200 + index * 120,
      withSequence(
        withTiming(0.9, {
          duration: timingPresets.enter.duration,
          easing: Easing.bezier(...timingPresets.enter.easing),
        }),
        withTiming(0, {
          duration: 1800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ),
    );
    particleX.value = withDelay(
      200 + index * 100,
      withTiming(tx, {
        duration: 2000,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      }),
    );
    particleY.value = withDelay(
      200 + index * 100,
      withTiming(ty - 20, {
        duration: 2000,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }),
    );
    particleScale.value = withDelay(
      200 + index * 120,
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 1400 }),
      ),
    );
  }, [isReducedMotion, particleOpacity, particleX, particleY, particleScale, index, tx, ty]);

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
    transform: [
      { translateX: particleX.value },
      { translateY: particleY.value },
      { scale: particleScale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: color,
          borderRadius: borderRadius.full,
          height: size,
          position: 'absolute',
          width: size,
        },
        particleStyle,
      ]}
    />
  );
}
