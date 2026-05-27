/**
 * Animation Timing Functions
 *
 * Predefined timing functions and durations for animations.
 */

import {
  Easing,
  type EasingFunction,
  type EasingFunctionFactory,
} from "react-native-reanimated";

/**
 * Easing functions from Reanimated
 */
export const easings = {
  linear: (t: number) => t,
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Quadratic
  quadIn: Easing.in(Easing.quad),
  quadOut: Easing.out(Easing.quad),
  quadInOut: Easing.inOut(Easing.quad),

  // Cubic
  cubicIn: Easing.in(Easing.cubic),
  cubicOut: Easing.out(Easing.cubic),
  cubicInOut: Easing.inOut(Easing.cubic),

  // Quartic (using poly as quart doesn't exist in Reanimated 3)
  quartIn: Easing.in(Easing.poly(4)),
  quartOut: Easing.out(Easing.poly(4)),
  quartInOut: Easing.inOut(Easing.poly(4)),

  // Quintic (using poly as quint doesn't exist in Reanimated 3)
  quintIn: Easing.in(Easing.poly(5)),
  quintOut: Easing.out(Easing.poly(5)),
  quintInOut: Easing.inOut(Easing.poly(5)),

  // Special
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  back: Easing.back(1.7),

  // iOS-style
  iosSpring: Easing.bezier(0.5, 1.2, 0.3, 1),
  material: Easing.bezier(0.4, 0, 0.2, 1),
};

/**
 * Duration presets (in milliseconds)
 */
export const durations = {
  instant: 0,
  fastest: 100,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
};

/**
 * Create a timing configuration
 */
export interface TimingConfig {
  duration: number;
  easing: EasingFunction | EasingFunctionFactory;
}

export function createTiming(
  duration: number,
  easing: EasingFunction | EasingFunctionFactory = easings.ease,
): TimingConfig {
  return {
    duration,
    easing,
  };
}

/**
 * Common timing configurations
 */
export const timings = {
  instant: createTiming(durations.instant),
  fastest: createTiming(durations.fastest),
  fast: createTiming(durations.fast),
  normal: createTiming(durations.normal),
  slow: createTiming(durations.slow),
  slower: createTiming(durations.slower),
  slowest: createTiming(durations.slowest),

  // Ease out (decelerate) - good for enter animations
  easeOut: createTiming(durations.normal, easings.easeOut),
  easeOutFast: createTiming(durations.fast, easings.easeOut),

  // Ease in (accelerate) - good for exit animations
  easeIn: createTiming(durations.normal, easings.easeIn),
  easeInFast: createTiming(durations.fast, easings.easeIn),

  // Bounce - for playful animations
  bounce: createTiming(durations.normal, easings.bounce),

  // Spring-like with easing
  springLike: createTiming(durations.normal, easings.iosSpring),
};
