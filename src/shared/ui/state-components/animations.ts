import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

export type AnimatedStyle = StyleProp<ViewStyle> | ReturnType<typeof useAnimatedStyle<ViewStyle>>;

export function usePulseStyle(enabled = true): AnimatedStyle {
  const opacity = useSharedValue(enabled ? 0.5 : 1);
  useEffect(() => {
    if (!enabled) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [enabled, opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export function useFadeStyle(visible: boolean, duration = 300): AnimatedStyle {
  const opacity = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration });
  }, [duration, opacity, visible]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export function useScaleInStyle(
  initialScale: number,
  spring = true,
): AnimatedStyle {
  const scale = useSharedValue(initialScale);
  useEffect(() => {
    scale.value = spring
      ? withSpring(1, { damping: 10, stiffness: 120 })
      : withTiming(1, { duration: 200 });
  }, [scale, spring]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

export function useShakeStyle(): AnimatedStyle {
  const translateX = useSharedValue(0);
  useEffect(() => {
    translateX.value = withSequence(
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );
  }, [translateX]);
  return useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
}
