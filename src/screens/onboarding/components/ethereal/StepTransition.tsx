/**
 * StepTransition — shared-axis slide wrapper for onboarding steps.
 * Outgoing translates -40 + opacity 0; incoming translates 40 → 0.
 */
import React, { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type StepTransitionProps = {
  /** Stable key per step (drives the entrance). */
  stepKey: string | number;
  children: React.ReactNode;
  /** Optional override for delay (ms). */
  delayMs?: number;
  style?: ViewStyle;
};

const DURATION = 380;

export function StepTransition({
  stepKey,
  children,
  delayMs = 0,
  style,
}: StepTransitionProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const progress = useSharedValue(isReducedMotion ? 1 : 0);

  useEffect(() => {
    progress.value = 0;
    if (isReducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delayMs,
      withTiming(1, {
        duration: DURATION,
        easing: Easing.bezier(...timingPresets.cinematicReveal.easing),
      }),
    );
  }, [progress, stepKey, delayMs, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * 40 }],
  }));

  return (
    <Animated.View style={[style, { flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
