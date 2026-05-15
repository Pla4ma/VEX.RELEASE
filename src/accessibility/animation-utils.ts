/**
 * Animation Utilities
 *
 * Core animation creation with accessibility support.
 */

import { Animated, Easing } from 'react-native';
import type { AnimationConfig, AnimationType } from './motion-preferences';
import type { MotionPreferences } from './motion-preferences';

export function adjustAnimationForAccessibility(config: AnimationConfig, preferences: MotionPreferences): AnimationConfig {
  const adjusted = { ...config };

  if (preferences.reducedMotion) {
    switch (config.reducedMotionAlternative) {
      case 'none': adjusted.duration = 0; break;
      case 'instant': adjusted.duration = 50; break;
      case 'fade': adjusted.type = 'fade'; adjusted.duration = 150; break;
      default: adjusted.duration = Math.min(config.duration, 200);
  }
}


  adjusted.duration = Math.round(adjusted.duration * preferences.animationDurationMultiplier);

  if (!preferences.transitionAnimationsEnabled && ['slide', 'scale', 'rotate'].includes(config.type)) {
    adjusted.type = 'fade';
    adjusted.duration = Math.min(adjusted.duration, 200);
  }

  return adjusted;
}

export function parseEasing(easingString: string): (value: number) => number {
  switch (easingString) {
    case 'linear': return Easing.linear;
    case 'ease-in': return Easing.in(Easing.quad);
    case 'ease-out': return Easing.out(Easing.quad);
    case 'ease-in-out': return Easing.inOut(Easing.quad);
    case 'ease-in-quad': return Easing.in(Easing.quad);
    case 'ease-out-quad': return Easing.out(Easing.quad);
    case 'ease-in-out-quad': return Easing.inOut(Easing.quad);
    default: return Easing.out(Easing.quad);
  }
}

export function createAnimationType(
  type: AnimationType,
  animatedValue: Animated.Value,
  adjustedConfig: AnimationConfig
): Animated.CompositeAnimation {
  const easing = adjustedConfig.easing ? parseEasing(adjustedConfig.easing) : Easing.out(Easing.quad);
  const useNativeDriver = adjustedConfig.useNativeDriver !== false;

  switch (type) {
    case 'fade':
    case 'slide':
    case 'scale':
      return Animated.timing(animatedValue, {
        toValue: 1,
        duration: adjustedConfig.duration || 300,
        delay: adjustedConfig.delay || 0,
        easing,
        useNativeDriver,
      });
    case 'spring':
      return Animated.spring(animatedValue, { toValue: 1, tension: 100, friction: 8, useNativeDriver });
    case 'parallax':
      return Animated.timing(animatedValue, { toValue: 1, duration: adjustedConfig.duration || 300, useNativeDriver });
    default:
      return Animated.timing(animatedValue, {
        toValue: 1,
        duration: adjustedConfig.duration || 300,
        delay: adjustedConfig.delay || 0,
        easing,
        useNativeDriver,
      });
  }
}
