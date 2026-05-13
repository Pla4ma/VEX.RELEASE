/**
 * Enter Animation Component
 * Consistent enter animations for cards, screens, and UI elements
 *
 * Features:
 * - Staggered reveals for lists
 * - Consistent fade + slide patterns
 * - Configurable delays and durations
 * - Reduced motion support
 */

import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';

import { createSheet } from '@/shared/ui/create-sheet';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Animation Presets
// ============================================================================

const SPEED_CONFIGS: Record<EnterSpeed, { duration: number; easing: typeof Easing.ease }> = {
  instant: { duration: 0, easing: Easing.ease },
  fast: { duration: 200, easing: Easing.out(Easing.quad) },
  normal: { duration: 350, easing: Easing.out(Easing.cubic) },
  slow: { duration: 500, easing: Easing.out(Easing.cubic) },
};

const getEnterAnimation = (
  direction: EnterDirection,
  speed: EnterSpeed,
  delay: number,
  distance: number,
  reducedMotion: boolean
) => {
  const config = SPEED_CONFIGS[speed];

  if (reducedMotion || speed === 'instant') {
    return FadeIn.duration(0).delay(0);
  }

  const baseDelay = delay;

  switch (direction) {
    case 'up':
      return FadeInUp.duration(config.duration).delay(baseDelay).easing(config.easing);
    case 'down':
      return FadeInDown.duration(config.duration).delay(baseDelay).easing(config.easing);
    case 'left':
      return FadeInLeft.duration(config.duration).delay(baseDelay).easing(config.easing);
    case 'right':
      return FadeInRight.duration(config.duration).delay(baseDelay).easing(config.easing);
    case 'fade':
    default:
      return FadeIn.duration(config.duration).delay(baseDelay).easing(config.easing);
  }
};

// ============================================================================
// Individual Enter Animation
// ============================================================================
// ============================================================================
// Staggered List Animation
// ============================================================================
// ============================================================================
// Card Enter Animation (optimized for cards)
// ============================================================================
// ============================================================================
// Screen Enter Animation
// ============================================================================
// ============================================================================
// Hero Enter Animation (for prominent elements)
// ============================================================================
// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  staggerContainer: {
    gap: 0, // No gap, children handle spacing
  },
  staggerItem: {
    // Individual items
  },
  screenContainer: {
    flex: 1,
  },
});

export default EnterAnimation;

export * from "./EnterAnimation.types";
export * from "./EnterAnimation.part1";
