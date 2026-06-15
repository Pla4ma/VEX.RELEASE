/**
 * useReducedMotion Hook
 *
 * React Native Accessibility hook for detecting reduced motion preference.
 * Used to disable decorative animations when user has enabled reduced motion
 * in system settings (Settings → Accessibility → Reduce Motion).
 *
 * Phase 7C.3 — Reduce motion support
 *
 * Usage:
 *   const { isReducedMotion, animationConfig } = useReducedMotion();
 *
 *   // In component:
 *   <Animated.View
 *     entering={isReducedMotion ? undefined : FadeIn}
 *   />
 *
 *   // Or with spring config:
 *   const springConfig = isReducedMotion
 *     ? { duration: 0 }
 *     : { damping: 15, stiffness: 300 };
 */

import { useEffect, useState, useMemo } from 'react';
import { AccessibilityInfo} from 'react-native';
import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

interface ReducedMotionResult {
  /** Whether user has enabled reduced motion */
  isReducedMotion: boolean;
  /** Pre-configured animation settings for this preference */
  animationConfig: {
    /** Set duration to 0 for reduced motion, or normal duration */
    duration: number;
    /** Whether to skip decorative animations entirely */
    skipAnimations: boolean;
  };
  /** Spring configuration adjusted for reduced motion */
  springConfig: {
    damping: number;
    stiffness: number;
    mass?: number;
    overshootClamping?: boolean;
  };
  /** Stagger delay - 0 for reduced motion */
  staggerDelay: number;
}

/**
 * Hook to detect and respond to reduced motion preference
 */
export function useReducedMotion(): ReducedMotionResult {
  return useSystemReducedMotion();
}

function useSystemReducedMotion(): ReducedMotionResult {
  // Use Reanimated 3's built-in hook as primary source
  const reanimatedReducedMotion = useReanimatedReducedMotion();

  // Also listen to React Native's AccessibilityInfo for platform consistency
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(
    reanimatedReducedMotion ?? false,
  );

  useEffect(() => {
    // Update from Reanimated's value
    if (reanimatedReducedMotion !== null) {
      setIsReducedMotion(reanimatedReducedMotion);
    }

    // Also subscribe to RN AccessibilityInfo for broader compatibility
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setIsReducedMotion(enabled);
      },
    );

    // Initial check
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setIsReducedMotion(enabled);
    });

    return () => {
      subscription.remove();
    };
  }, [reanimatedReducedMotion]);

  // Memoized animation configurations based on reduced motion preference
  const result = useMemo((): ReducedMotionResult => {
    if (isReducedMotion) {
      return {
        isReducedMotion: true,
        animationConfig: {
          duration: 0, // Instant transitions
          skipAnimations: true,
        },
        springConfig: {
          damping: 50, // Snappy, no bounce
          stiffness: 500, // Very stiff
          mass: 0.1,
          overshootClamping: true,
        },
        staggerDelay: 0, // No staggering
      };
    }

    return {
      isReducedMotion: false,
      animationConfig: {
        duration: 350, // Normal duration
        skipAnimations: false,
      },
      springConfig: {
        damping: 15, // Normal bounce
        stiffness: 300, // Normal spring
        mass: 1,
        overshootClamping: false,
      },
      staggerDelay: 80, // Normal stagger
    };
  }, [isReducedMotion]);

  return result;
}

/**
 * Utility to create enter animation props based on reduced motion
 */
export function useAnimationPreset<T extends { duration?: number }>(
  normalConfig: T,
): T {
  const { isReducedMotion } = useReducedMotion();

  return useMemo(() => {
    if (isReducedMotion) {
      return { ...normalConfig, duration: 0 };
    }
    return normalConfig;
  }, [isReducedMotion, normalConfig]);
}

/**
 * Simple boolean hook for conditional animation rendering
 */
export function useShouldAnimate(): boolean {
  const { isReducedMotion } = useReducedMotion();
  return !isReducedMotion;
}

export default useReducedMotion;
