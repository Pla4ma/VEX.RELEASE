/**
 * MotionAccessibility — Re-export barrel
 *
 * Re-exports the canonical motion accessibility system from the shared
 * accessibility layer. All animation types and values use the stub-based
 * interface (Reanimated 3 compatible), not react-native Animated.
 *
 * @deprecated Import directly from '@/accessibility/motion-manager' for new code.
 */

export {
  MotionAccessibilityManager,
  motionAccessibilityManager,
} from "../../src/accessibility/motion-manager";

export {
  type MotionPreferences,
  DEFAULT_MOTION_PREFERENCES,
  type AnimationType,
  type AnimationConfig,
} from "../../src/accessibility/motion-preferences";

export {
  type AnimatedValue,
  type CompositeAnimation,
} from "../../src/accessibility/motion-animation-stubs";
