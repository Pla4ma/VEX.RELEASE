/**
 * Motion Preferences Types
 *
 * Ensures animations and transitions respect user preferences.
 */

export interface MotionPreferences {
  reducedMotion: boolean;
  animationDurationMultiplier: number;
  parallaxEnabled: boolean;
  springAnimationsEnabled: boolean;
  transitionAnimationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
}

export const DEFAULT_MOTION_PREFERENCES: MotionPreferences = {
  reducedMotion: false,
  animationDurationMultiplier: 1.0,
  parallaxEnabled: true,
  springAnimationsEnabled: true,
  transitionAnimationsEnabled: true,
  hapticFeedbackEnabled: true,
};

export type AnimationType =
  | "fade"
  | "slide"
  | "scale"
  | "rotate"
  | "spring"
  | "parallax"
  | "transition";

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing?: string;
  useNativeDriver?: boolean;
  reducedMotionAlternative?: "fade" | "none" | "instant";
}
