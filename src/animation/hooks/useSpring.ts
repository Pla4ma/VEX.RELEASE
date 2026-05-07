/**
 * useSpring Hook
 *
 * React hook for spring animations with Reanimated.
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type WithSpringConfig,
  type SharedValue,
} from 'react-native-reanimated';

import { defaultSpring } from '../springs';

/**
 * Spring animation options
 */
interface UseSpringOptions {
  initialValue?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  overshootClamping?: boolean;
}

/**
 * Spring animation result
 */
interface UseSpringResult {
  value: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  setValue: (target: number, config?: WithSpringConfig) => void;
  reset: () => void;
}

/**
 * Hook for spring animations
 */
export function useSpring(options: UseSpringOptions = {}): UseSpringResult {
  const { initialValue = 0, ...springConfig } = options;
  const config = { ...defaultSpring, ...springConfig };

  const value = useSharedValue(initialValue);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: value.value }],
    };
  });

  const setValue = useCallback(
    (target: number, overrideConfig?: WithSpringConfig) => {
      const finalConfig = overrideConfig ? { ...config, ...overrideConfig } : config;
      value.value = withSpring(target, finalConfig as WithSpringConfig);
    },
    [value, config]
  );

  const reset = useCallback(() => {
    value.value = withSpring(initialValue, config as WithSpringConfig);
  }, [value, initialValue, config]);

  return {
    value,
    animatedStyle,
    setValue,
    reset,
  };
}

/**
 * Hook for spring with custom animated style
 */
export function useSpringStyle(
  styleFactory: (val: SharedValue<number>) => ReturnType<typeof useAnimatedStyle>,
  options: UseSpringOptions = {}
): UseSpringResult {
  const { initialValue = 0, ...springConfig } = options;
  const config = { ...defaultSpring, ...springConfig };

  const value = useSharedValue(initialValue);
  const animatedStyle = useAnimatedStyle(() => styleFactory(value));

  const setValue = useCallback(
    (target: number, overrideConfig?: WithSpringConfig) => {
      const finalConfig = overrideConfig ? { ...config, ...overrideConfig } : config;
      value.value = withSpring(target, finalConfig as WithSpringConfig);
    },
    [value, config]
  );

  const reset = useCallback(() => {
    value.value = withSpring(initialValue, config as WithSpringConfig);
  }, [value, initialValue, config]);

  return {
    value,
    animatedStyle,
    setValue,
    reset,
  };
}