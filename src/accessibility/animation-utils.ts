/**
 * Animation Utilities
 *
 * Core animation creation with accessibility support.
 * Uses Reanimated-compatible interface stubs — no react-native Animated.
 */

import {
  createAnimatedValue as stubCreateAnimatedValue,
  createTiming as stubCreateTiming,
  easingOut as stubEasingOut,
  type AnimatedValue,
  type CompositeAnimation,
} from './motion-animation-stubs';
import type { AnimationConfig, AnimationType } from './motion-preferences';
import type { MotionPreferences } from './motion-preferences';

type EasingFn = (value: number) => number;

function easeLinear(t: number): number {
  return t;
}

function easeInQuad(t: number): number {
  return t * t;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function adjustAnimationForAccessibility(
  config: AnimationConfig,
  preferences: MotionPreferences,
): AnimationConfig {
  const adjusted = { ...config };

  if (preferences.reducedMotion) {
    switch (config.reducedMotionAlternative) {
      case 'none':
        adjusted.duration = 0;
        break;
      case 'instant':
        adjusted.duration = 50;
        break;
      case 'fade':
        adjusted.type = 'fade';
        adjusted.duration = 150;
        break;
      default:
        adjusted.duration = Math.min(config.duration, 200);
    }
  }

  adjusted.duration = Math.round(
    adjusted.duration * preferences.animationDurationMultiplier,
  );

  if (
    !preferences.transitionAnimationsEnabled &&
    ['slide', 'scale', 'rotate'].includes(config.type)
  ) {
    adjusted.type = 'fade';
    adjusted.duration = Math.min(adjusted.duration, 200);
  }

  return adjusted;
}

export function parseEasing(easingString: string): EasingFn {
  switch (easingString) {
    case 'linear':
      return easeLinear;
    case 'ease-in':
      return easeInQuad;
    case 'ease-out':
      return easeOutQuad;
    case 'ease-in-out':
      return easeInOutQuad;
    case 'ease-in-quad':
      return easeInQuad;
    case 'ease-out-quad':
      return easeOutQuad;
    case 'ease-in-out-quad':
      return easeInOutQuad;
    default:
      return easeOutQuad;
  }
}

export function createAnimationType(
  type: AnimationType,
  animatedValue: AnimatedValue,
  adjustedConfig: AnimationConfig,
): CompositeAnimation {
  const easing = adjustedConfig.easing
    ? parseEasing(adjustedConfig.easing)
    : easeOutQuad;
  const useNativeDriver = adjustedConfig.useNativeDriver !== false;

  switch (type) {
    case 'fade':
    case 'slide':
    case 'scale':
      return stubCreateTiming(animatedValue, {
        toValue: 1,
        duration: adjustedConfig.duration || 300,
        delay: adjustedConfig.delay || 0,
        easing,
        useNativeDriver,
      });
    case 'spring':
      return stubCreateTiming(animatedValue, {
        toValue: 1,
        duration: adjustedConfig.duration || 300,
        useNativeDriver,
      });
    case 'parallax':
      return stubCreateTiming(animatedValue, {
        toValue: 1,
        duration: adjustedConfig.duration || 300,
        useNativeDriver,
      });
    default:
      return stubCreateTiming(animatedValue, {
        toValue: 1,
        duration: adjustedConfig.duration || 300,
        delay: adjustedConfig.delay || 0,
        easing,
        useNativeDriver,
      });
  }
}
