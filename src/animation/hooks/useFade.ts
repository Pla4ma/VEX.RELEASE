/**
 * useFade Hook
 *
 * React hook for fade in/out animations.
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  type WithTimingConfig,
  type SharedValue,
} from 'react-native-reanimated';

import { durations } from '../timings';

/**
 * Fade animation options
 */
interface UseFadeOptions {
  initialOpacity?: number;
  duration?: number;
  delay?: number;
}

/**
 * Fade animation result
 */
interface UseFadeResult {
  opacity: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  fadeIn: (config?: WithTimingConfig) => void;
  fadeOut: (config?: WithTimingConfig) => void;
  setOpacity: (value: number, config?: WithTimingConfig) => void;
}

/**
 * Hook for fade animations
 */
export function useFade(options: UseFadeOptions = {}): UseFadeResult {
  const {
    initialOpacity = 0,
    duration = durations.normal,
    delay = 0,
  } = options;

  const opacity = useSharedValue(initialOpacity);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const setOpacity = useCallback(
    (value: number, config?: WithTimingConfig) => {
      // Provide a default easing if not specified (fixes web compatibility)
      const timingConfig = {
        duration: config?.duration ?? duration,
        easing: config?.easing ?? Easing.inOut(Easing.ease),
      };

      // Skip animations on web platform to avoid reanimated issues
      if (Platform.OS === 'web') {
        opacity.value = value;
        return;
      }

      if (delay > 0 && !config?.duration) {
        opacity.value = withDelay(delay, withTiming(value, timingConfig));
      } else {
        opacity.value = withTiming(value, timingConfig);
      }
    },
    [opacity, duration, delay],
  );

  const fadeIn = useCallback(
    (config?: WithTimingConfig) => {
      setOpacity(1, config);
    },
    [setOpacity],
  );

  const fadeOut = useCallback(
    (config?: WithTimingConfig) => {
      setOpacity(0, config);
    },
    [setOpacity],
  );

  return {
    opacity,
    animatedStyle,
    fadeIn,
    fadeOut,
    setOpacity,
  };
}

/**
 * Hook for auto-fading in on mount
 */
export function useAutoFade(
  visible: boolean,
  options: Omit<UseFadeOptions, 'initialOpacity'> = {},
): UseFadeResult {
  const fade = useFade({
    initialOpacity: visible ? 1 : 0,
    ...options,
  });

  return fade;
}
