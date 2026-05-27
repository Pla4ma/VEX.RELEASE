/**
 * useSlide Hook
 *
 * React hook for slide animations.
 */

import { useCallback } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  type SharedValue,
} from "react-native-reanimated";

import { durations } from "../timings";
import { defaultSpring } from "../springs";

/**
 * Slide direction
 */
export type SlideDirection = "up" | "down" | "left" | "right";

/**
 * Slide animation options
 */
interface UseSlideOptions {
  direction?: SlideDirection;
  distance?: number;
  useSpring?: boolean;
  duration?: number;
  delay?: number;
}

/**
 * Slide animation result
 */
interface UseSlideResult {
  translate: SharedValue<{ x: number; y: number }>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  slideIn: () => void;
  slideOut: () => void;
  slideTo: (x: number, y: number) => void;
}

/**
 * Get initial offset based on direction
 */
function getInitialOffset(
  direction: SlideDirection,
  distance: number,
): { x: number; y: number } {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Hook for slide animations
 */
export function useSlide(options: UseSlideOptions = {}): UseSlideResult {
  const {
    direction = "up",
    distance = 100,
    useSpring: useSpringAnimation = false,
    duration = durations.normal,
    delay = 0,
  } = options;

  const initialOffset = getInitialOffset(direction, distance);
  const translate = useSharedValue(initialOffset);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translate.value.x },
        { translateY: translate.value.y },
      ],
    };
  });

  const animateTranslate = useCallback(
    (target: { x: number; y: number }) => {
      const animation = useSpringAnimation
        ? withSpring(target, defaultSpring)
        : withTiming(target, { duration });

      translate.value = delay > 0 ? withDelay(delay, animation) : animation;
    },
    [translate, useSpringAnimation, duration, delay],
  );

  const slideIn = useCallback(() => {
    animateTranslate({ x: 0, y: 0 });
  }, [animateTranslate]);

  const slideOut = useCallback(() => {
    animateTranslate(initialOffset);
  }, [animateTranslate, initialOffset]);

  const slideTo = useCallback(
    (x: number, y: number) => {
      animateTranslate({ x, y });
    },
    [animateTranslate],
  );

  return {
    translate,
    animatedStyle,
    slideIn,
    slideOut,
    slideTo,
  };
}
