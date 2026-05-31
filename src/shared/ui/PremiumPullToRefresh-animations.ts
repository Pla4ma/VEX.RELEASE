import { useCallback } from 'react';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

export function useRefreshAnimations(
  pullY: SharedValue<number>,
  indicatorRotation: SharedValue<number>,
  indicatorScale: SharedValue<number>,
  indicatorOpacity: SharedValue<number>,
  pullDistance: number,
  resetHapticTriggered: () => void,
) {
  const animateToRefreshing = useCallback(() => {
    pullY.value = withSpring(pullDistance * 0.6, {
      damping: 16,
      stiffness: 150,
    });
    indicatorOpacity.value = withTiming(1, { duration: 200 });
    indicatorRotation.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [pullY, indicatorRotation, indicatorOpacity, pullDistance]);

  const animateToIdle = useCallback(() => {
    cancelAnimation(indicatorRotation);
    indicatorRotation.value = 0;
    pullY.value = withSpring(0, { damping: 16, stiffness: 150 });
    indicatorOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(resetHapticTriggered)();
    });
  }, [pullY, indicatorRotation, indicatorOpacity, resetHapticTriggered]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${indicatorRotation.value * 360}deg` },
      { scale: indicatorScale.value },
    ],
    opacity: indicatorOpacity.value,
  }));

  const indicatorContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullY.value }],
    height: pullY.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullY.value }],
  }));

  return {
    animateToRefreshing,
    animateToIdle,
    indicatorStyle,
    indicatorContainerStyle,
    contentStyle,
  };
}
