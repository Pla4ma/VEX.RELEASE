/**
 * useScale Hook
 *
 * React hook for scale animations.
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  type WithTimingConfig,
  type WithSpringConfig,
  type SharedValue,
} from 'react-native-reanimated';

import { durations } from '../timings';
import { gentleSpring } from '../springs';

/**
 * Scale animation options
 */
interface UseScaleOptions {
  initialScale?: number;
  useSpring?: boolean;
  duration?: number;
}

/**
 * Scale animation result
 */
interface UseScaleResult {
  scale: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  scaleTo: (target: number, config?: WithTimingConfig | WithSpringConfig) => void;
  scaleIn: () => void;
  scaleOut: () => void;
  pulse: () => void;
}

/**
 * Hook for scale animations
 */
export function useScale(options: UseScaleOptions = {}): UseScaleResult {
  const {
    initialScale = 1,
    useSpring: useSpringAnimation = false,
    duration = durations.normal,
  } = options;

  const scale = useSharedValue(initialScale);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const scaleTo = useCallback(
    (target: number, config?: WithTimingConfig | WithSpringConfig) => {
      if (useSpringAnimation) {
        scale.value = withSpring(target, (config as WithSpringConfig) ?? gentleSpring);
      } else {
        scale.value = withTiming(target, (config as WithTimingConfig) ?? { duration });
      }
    },
    [scale, useSpringAnimation, duration]
  );

  const scaleIn = useCallback(() => {
    scaleTo(1);
  }, [scaleTo]);

  const scaleOut = useCallback(() => {
    scaleTo(0);
  }, [scaleTo]);

  const pulse = useCallback(() => {
    scale.value = withSpring(1.1, gentleSpring, () => {
      scale.value = withSpring(1, gentleSpring);
    });
  }, [scale]);

  return {
    scale,
    animatedStyle,
    scaleTo,
    scaleIn,
    scaleOut,
    pulse,
  };
}

/**
 * Hook for pressable scale effect
 */
export function usePressableScale(activeScale = 0.95): UseScaleResult {
  const scale = useScale({
    initialScale: 1,
    useSpring: true,
  });

  const onPressIn = useCallback(() => {
    scale.scaleTo(activeScale);
  }, [scale, activeScale]);

  const onPressOut = useCallback(() => {
    scale.scaleTo(1);
  }, [scale]);

  return {
    ...scale,
    onPressIn,
    onPressOut,
  } as UseScaleResult;
}