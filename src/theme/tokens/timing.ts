/**
 * Animation Timing Tokens
 *
 * Duration and easing values for consistent animations.
 */

import type { AnimationTiming, TimingFunction } from "../types";

/**
 * Animation duration values in milliseconds
 */
export const animationDuration: AnimationTiming = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

/**
 * Animation delay values in milliseconds
 */
export const animationDelay = {
  none: 0,
  short: 100,
  medium: 250,
  long: 500,
};

/**
 * Timing functions
 */
export const timingFunctions: Record<TimingFunction, string> = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  spring: "spring",
};

/**
 * Spring animation configurations for Reanimated
 */
export const springConfigs = {
  default: {
    stiffness: 100,
    damping: 10,
    mass: 1,
  },
  gentle: {
    stiffness: 120,
    damping: 14,
    mass: 1,
  },
  bouncy: {
    stiffness: 400,
    damping: 10,
    mass: 1,
  },
  stiff: {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  slow: {
    stiffness: 50,
    damping: 20,
    mass: 2,
  },
};

/**
 * Stagger animation delays
 */
export const staggerDelays = {
  fast: 30,
  normal: 50,
  slow: 100,
};
