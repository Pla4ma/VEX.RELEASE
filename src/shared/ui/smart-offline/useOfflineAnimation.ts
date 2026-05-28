import { useCallback, useEffect, useRef } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface UseOfflineAnimationOptions {
  hiddenOffset: number;
  animationNormal: number;
  animationFast: number;
  animationVerySlow: number;
  isConnected: boolean;
  syncQueueLength: number;
  lastSyncTime: number | null;
}

export function useOfflineAnimation({
  hiddenOffset,
  animationNormal,
  animationFast,
  animationVerySlow,
  isConnected,
  syncQueueLength,
  lastSyncTime,
}: UseOfflineAnimationOptions) {
  const { isReducedMotion } = useReducedMotion();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useSharedValue(hiddenOffset);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const animateIn = useCallback(() => {
    clearHideTimer();
    translateY.value = isReducedMotion
      ? 0
      : withSpring(0, { damping: 18, stiffness: 260 });
    opacity.value = withTiming(1, {
      duration: isReducedMotion ? 0 : animationNormal,
    });
  }, [clearHideTimer, isReducedMotion, opacity, animationNormal, translateY]);

  const animateOut = useCallback(() => {
    translateY.value = withTiming(hiddenOffset, {
      duration: isReducedMotion ? 0 : animationFast,
    });
    opacity.value = withTiming(0, {
      duration: isReducedMotion ? 0 : animationFast,
    });
  }, [hiddenOffset, isReducedMotion, opacity, animationFast, translateY]);

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  useEffect(() => {
    if (!isConnected || syncQueueLength > 0) {
      animateIn();
      return;
    }
    if (lastSyncTime) {
      animateIn();
      hideTimer.current = setTimeout(animateOut, animationVerySlow);
    }
  }, [animateIn, animateOut, isConnected, lastSyncTime, syncQueueLength, animationVerySlow]);

  const handleScale = useCallback(() => {
    scale.value = isReducedMotion
      ? 1
      : withSpring(1, { damping: 16, stiffness: 300 });
  }, [isReducedMotion, scale]);

  return {
    animatedStyle,
    contentStyle,
    animateIn,
    animateOut,
    handleScale,
  };
}
