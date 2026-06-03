import React, { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const EASE_EDITORIAL = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * Staged entrance — a small wrapper that fades and lifts a child section
 * in at a specific delay. Used to choreograph the login composition so
 * the wordmark, the glass card, the CTA, and the colophon enter in order.
 */
export function Stage({
  delay,
  children,
  isReducedMotion,
}: {
  delay: number;
  children: React.ReactNode;
  isReducedMotion: boolean;
}): React.JSX.Element {
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const ty = useSharedValue(isReducedMotion ? 0 : 22);
  useEffect(() => {
    if (isReducedMotion) { return; }
    op.value = withDelay(delay, withTiming(1, { duration: 900, easing: EASE_EDITORIAL }));
    ty.value = withDelay(delay, withTiming(0, { duration: 900, easing: EASE_EDITORIAL }));
    return () => {
      cancelAnimation(op);
      cancelAnimation(ty);
    };
  }, [op, ty, delay, isReducedMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}
