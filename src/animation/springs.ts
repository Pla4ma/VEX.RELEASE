/**
 * Spring Configurations
 *
 * Predefined spring animation configurations for Reanimated.
 */

import type { WithSpringConfig } from 'react-native-reanimated';

/**
 * Default spring configuration
 */
export const defaultSpring: WithSpringConfig = {
  stiffness: 100,
  damping: 10,
  mass: 1,
  overshootClamping: false,
};

/**
 * Gentle spring - smooth and subtle
 */
export const gentleSpring: WithSpringConfig = {
  stiffness: 120,
  damping: 14,
  mass: 1,
  overshootClamping: false,
};

/**
 * Bouncy spring - playful and energetic
 */
export const bouncySpring: WithSpringConfig = {
  stiffness: 400,
  damping: 10,
  mass: 1,
  overshootClamping: false,
};

/**
 * Stiff spring - quick and snappy
 */
export const stiffSpring: WithSpringConfig = {
  stiffness: 500,
  damping: 30,
  mass: 1,
  overshootClamping: false,
};

/**
 * Slow spring - deliberate and smooth
 */
export const slowSpring: WithSpringConfig = {
  stiffness: 50,
  damping: 20,
  mass: 2,
  overshootClamping: false,
};

/**
 * Wobbly spring - elastic and fun
 */
export const wobblySpring: WithSpringConfig = {
  stiffness: 200,
  damping: 5,
  mass: 1,
  overshootClamping: false,
};

/**
 * No bounce spring - stops exactly at target
 */
export const noBounceSpring: WithSpringConfig = {
  stiffness: 500,
  damping: 50,
  mass: 1,
  overshootClamping: true,
};

/**
 * Keyboard spring - matches iOS keyboard
 */
export const keyboardSpring: WithSpringConfig = {
  stiffness: 500,
  damping: 30,
  mass: 1,
  overshootClamping: true,
};

/**
 * Scroll spring - for scroll momentum
 */
export const scrollSpring: WithSpringConfig = {
  stiffness: 150,
  damping: 15,
  mass: 1,
  overshootClamping: false,
};

/**
 * Collection of all spring configs
 */
export const springs = {
  default: defaultSpring,
  gentle: gentleSpring,
  bouncy: bouncySpring,
  stiff: stiffSpring,
  slow: slowSpring,
  wobbly: wobblySpring,
  noBounce: noBounceSpring,
  keyboard: keyboardSpring,
  scroll: scrollSpring,
};
