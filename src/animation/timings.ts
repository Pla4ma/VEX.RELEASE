/**
 * Animation Timing Functions
 *
 * Predefined timing functions and durations for animations.
 */

import { Easing } from 'react-native-reanimated';

/**
 * Easing functions from Reanimated
 */
export const easings: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  ease: Easing.bezier(0.25, 0.1, 0.25, 1) as unknown as EasingFunction,
  easeIn: Easing.in(Easing.ease) as unknown as EasingFunction,
  easeOut: Easing.out(Easing.ease) as unknown as EasingFunction,
  easeInOut: Easing.inOut(Easing.ease) as unknown as EasingFunction,

  // Quadratic
  quadIn: Easing.in(Easing.quad) as unknown as EasingFunction,
  quadOut: Easing.out(Easing.quad) as unknown as EasingFunction,
  quadInOut: Easing.inOut(Easing.quad) as unknown as EasingFunction,

  // Cubic
  cubicIn: Easing.in(Easing.cubic) as unknown as EasingFunction,
  cubicOut: Easing.out(Easing.cubic) as unknown as EasingFunction,
  cubicInOut: Easing.inOut(Easing.cubic) as unknown as EasingFunction,

  // Quartic (using poly as quart doesn't exist in Reanimated 3)
  quartIn: Easing.in(Easing.poly(4)) as unknown as EasingFunction,
  quartOut: Easing.out(Easing.poly(4)) as unknown as EasingFunction,
  quartInOut: Easing.inOut(Easing.poly(4)) as unknown as EasingFunction,

  // Quintic (using poly as quint doesn't exist in Reanimated 3)
  quintIn: Easing.in(Easing.poly(5)) as unknown as EasingFunction,
  quintOut: Easing.out(Easing.poly(5)) as unknown as EasingFunction,
  quintInOut: Easing.inOut(Easing.poly(5)) as unknown as EasingFunction,

  // Special
  bounce: Easing.bounce as unknown as EasingFunction,
  elastic: Easing.elastic(1) as unknown as EasingFunction,
  back: Easing.back(1.7) as unknown as EasingFunction,

  // iOS-style
  iosSpring: Easing.bezier(0.5, 1.2, 0.3, 1) as unknown as EasingFunction,
  material: Easing.bezier(0.4, 0, 0.2, 1) as unknown as EasingFunction,
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
export type EasingFunction = (t: number) => number;

export interface TimingConfig {
  duration: number;
  easing: EasingFunction;
}

export function createTiming(
  duration: number,
  easing: EasingFunction = easings.ease
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
