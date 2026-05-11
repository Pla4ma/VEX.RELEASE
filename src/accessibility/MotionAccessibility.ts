/**
 * Motion Accessibility System
 *
 * Ensures animations and transitions respect user preferences
 * and provide alternatives for users with vestibular disorders.
 *
 * This file re-exports from modular files for backward compatibility.
 * New code should import directly from the modular files.
 */

export type { AnimationType } from './motion-preferences';
export { DEFAULT_MOTION_PREFERENCES } from './motion-preferences';
export type { MotionPreferences, AnimationConfig } from './motion-preferences';
export { motionAccessibilityManager } from './motion-manager';
export {
  useMotionAccessibility,
  withMotionAccessibility,
  ACCESSIBLE_ANIMATION_PRESETS,
  createAccessibleAnimation,
  createAccessibleAnimatedValue,
  setReducedMotion,
  triggerHapticFeedback,
} from './motion-hooks';
