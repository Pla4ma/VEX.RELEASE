/**
 * Motion Accessibility Hooks and Components
 *
 * React hooks and HOCs for motion accessibility integration.
 * Uses Reanimated-compatible interface stubs — no react-native Animated.
 */

import React from 'react';
import type { MotionPreferences, AnimationConfig } from './motion-preferences';
import { motionAccessibilityManager } from './motion-manager';
import type {
  CompositeAnimation,
  AnimatedValue,
} from './motion-animation-stubs';

export function useMotionAccessibility(): MotionPreferences & {
  updatePreferences: (updates: Partial<MotionPreferences>) => void;
  createAnimation: (config: AnimationConfig) => CompositeAnimation;
  triggerHaptic: (
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error',
  ) => void;
} {
  const [preferences, setPreferences] = React.useState<MotionPreferences>(
    () => motionAccessibilityManager.getPreferences(),
  );

  React.useEffect(() => {
    const unsubscribe = motionAccessibilityManager.addListener(() => {
      setPreferences(motionAccessibilityManager.getPreferences());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const updatePreferences = React.useCallback(
    (updates: Partial<MotionPreferences>) => {
      motionAccessibilityManager.updatePreferences(updates);
    },
    [],
  );

  const createAnimation = React.useCallback((config: AnimationConfig) => {
    return motionAccessibilityManager.createAnimation(config);
  }, []);

  const triggerHaptic = React.useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
      motionAccessibilityManager.triggerHapticFeedback(type);
    },
    [],
  );

  return { ...preferences, updatePreferences, createAnimation, triggerHaptic };
}

export function withMotionAccessibility<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  function MotionAccessibleComponent(props: P) {
    const motion = useMotionAccessibility();
    return React.createElement(Component, {
      ...props,
      motionAccessibility: motion,
    } as P);
  }
  MotionAccessibleComponent.displayName = `WithMotionAccessibility(${
    Component.displayName || Component.name
  })`;
  // FC<P> satisfies ComponentType<P> — no cast needed.
  return MotionAccessibleComponent;
}

export const ACCESSIBLE_ANIMATION_PRESETS = {
  SUBTLE: {
    type: 'fade' as const,
    duration: 150,
    useNativeDriver: true,
    reducedMotionAlternative: 'none' as const,
  },
  STANDARD: {
    type: 'fade' as const,
    duration: 300,
    useNativeDriver: true,
    reducedMotionAlternative: 'fade' as const,
  },
  EMPHATIC: {
    type: 'spring' as const,
    duration: 400,
    useNativeDriver: true,
    reducedMotionAlternative: 'fade' as const,
  },
  BACKGROUND: {
    type: 'parallax' as const,
    duration: 500,
    useNativeDriver: true,
    reducedMotionAlternative: 'none' as const,
  },
} as const;

export function createAccessibleAnimation(
  config: AnimationConfig,
): CompositeAnimation {
  return motionAccessibilityManager.createAnimation(config);
}

export function createAccessibleAnimatedValue(
  initialValue?: number,
  key?: string,
): AnimatedValue {
  return motionAccessibilityManager.createAnimatedValue(initialValue, key);
}

export function setReducedMotion(enabled: boolean): void {
  motionAccessibilityManager.setReducedMotion(enabled);
}

export function triggerHapticFeedback(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error',
): void {
  motionAccessibilityManager.triggerHapticFeedback(type);
}

export type AnimationType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'spring'
  | 'parallax'
  | 'transition';
