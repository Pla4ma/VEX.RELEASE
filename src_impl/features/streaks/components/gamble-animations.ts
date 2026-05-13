/**
 * Streak Gamble Animations
 * Reanimated 3 animation hooks for the gamble prompt UI.
 */

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  type SharedValue,
} from 'react-native-reanimated';

// ============================================================================
// Pulse Animation (urgency breathing)
// ============================================================================

export function usePulseAnimation(): ReturnType<typeof useAnimatedStyle> {
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
  }, [pulseOpacity]);

  return useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));
}

// ============================================================================
// Shake Animation (tension indicator)
// ============================================================================

export function useShakeAnimation(): ReturnType<typeof useAnimatedStyle> {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    shakeX.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 100 }),
        withTiming(2, { duration: 100 }),
        withTiming(0, { duration: 100 })
      ),
      -1,
      true
    );
  }, [shakeX]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));
}

// ============================================================================
// Glow Animation (button feedback)
// ============================================================================

export function useGlowAnimation(): {
  glowStyle: ReturnType<typeof useAnimatedStyle>;
  glowScale: SharedValue<number>;
} {
  const glowScale = useSharedValue(1);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  return { glowStyle, glowScale };
}

// ============================================================================
// Countdown Animation (hour counter pulse)
// ============================================================================

export function useCountdownAnimation(): ReturnType<typeof useAnimatedStyle> {
  const countdownScale = useSharedValue(1);

  useEffect(() => {
    countdownScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [countdownScale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
  }));
}
