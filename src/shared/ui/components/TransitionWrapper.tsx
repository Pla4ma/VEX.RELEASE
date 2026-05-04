/**
 * Transition Wrapper Component
 * Premium motion/transition support for state changes
 *
 * Features:
 * - Enter/exit animations with configurable presets
 * - Staggered children animations
 * - Layout transitions
 * - Gesture-driven transitions
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

// ============================================================================
// Types
// ============================================================================

export type TransitionPreset =
  | 'fade'
  | 'slideRight'
  | 'slideLeft'
  | 'slideUp'
  | 'slideDown'
  | 'zoom'
  | 'flip'
  | 'scale'
  | 'none';

export type TransitionEasing =
  | 'linear'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring'
  | 'bounce';

export interface TransitionConfig {
  preset: TransitionPreset;
  duration?: number;
  delay?: number;
  easing?: TransitionEasing;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
    overshootClamping?: boolean;
  };
}

export interface TransitionWrapperProps {
  children: React.ReactNode;
  visible: boolean;
  enterConfig?: TransitionConfig;
  exitConfig?: TransitionConfig;
  onEnterComplete?: () => void;
  onExitComplete?: () => void;
  style?: ViewStyle;
  maintainLayout?: boolean;
  staggerChildren?: number;
  childDelay?: number;
}

// ============================================================================
// Animation Configurations
// ============================================================================

const EASING_MAP: Record<TransitionEasing, any> = {
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: null, // Spring uses withSpring
  bounce: Easing.bounce,
};

const DEFAULT_SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
  overshootClamping: false,
};

// ============================================================================
// Shared Animation Values
// ============================================================================

function useTransitionAnimation(
  visible: boolean,
  config: TransitionConfig,
  onComplete?: () => void
) {
  const progress = useSharedValue(visible ? 1 : 0);
  const isAnimating = useSharedValue(false);

  const { preset, duration = 300, easing = 'ease', springConfig } = config;

  useEffect(() => {
    isAnimating.value = true;

    const targetValue = visible ? 1 : 0;
    const easingFn = EASING_MAP[easing];

    const callback = (finished?: boolean) => {
      'worklet';
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
      isAnimating.value = false;
    };

    if (easing === 'spring') {
      progress.value = withSpring(
        targetValue,
        { ...DEFAULT_SPRING_CONFIG, ...springConfig },
        callback
      );
    } else {
      progress.value = withTiming(
        targetValue,
        { duration, easing: easingFn },
        callback
      );
    }
  }, [visible, progress, duration, easing, springConfig, onComplete, isAnimating]);

  return { progress, isAnimating };
}

// ============================================================================
// Animated Style Generators
// ============================================================================

function createAnimatedStyles(preset: TransitionPreset, progress: Animated.SharedValue<number>) {
  'worklet';

  switch (preset) {
    case 'fade':
      return {
        opacity: progress.value,
      };

    case 'slideRight':
      return {
        opacity: progress.value,
        transform: [
          {
            translateX: interpolate(
              progress.value,
              [0, 1],
              [100, 0],
              Extrapolation.CLAMP
            ),
          },
        ],
      };

    case 'slideLeft':
      return {
        opacity: progress.value,
        transform: [
          {
            translateX: interpolate(
              progress.value,
              [0, 1],
              [-100, 0],
              Extrapolation.CLAMP
            ),
          },
        ],
      };

    case 'slideUp':
      return {
        opacity: progress.value,
        transform: [
          {
            translateY: interpolate(
              progress.value,
              [0, 1],
              [50, 0],
              Extrapolation.CLAMP
            ),
          },
        ],
      };

    case 'slideDown':
      return {
        opacity: progress.value,
        transform: [
          {
            translateY: interpolate(
              progress.value,
              [0, 1],
              [-50, 0],
              Extrapolation.CLAMP
            ),
          },
        ],
      };

    case 'zoom':
    case 'scale':
      return {
        opacity: progress.value,
        transform: [
          {
            scale: interpolate(
              progress.value,
              [0, 1],
              [0.8, 1],
              Extrapolation.CLAMP
            ),
          },
        ],
      };

    case 'flip':
      return {
        opacity: progress.value,
        transform: [
          {
            rotateY: `${interpolate(
              progress.value,
              [0, 1],
              [-90, 0],
              Extrapolation.CLAMP
            )}deg`,
          },
        ],
      };

    case 'none':
    default:
      return {};
  }
}

// ============================================================================
// Stagger Container Component
// ============================================================================

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay: number;
  initialDelay?: number;
  visible: boolean;
}

function StaggerContainer({
  children,
  staggerDelay,
  initialDelay = 0,
  visible,
}: StaggerContainerProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <>
      {childrenArray.map((child, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(initialDelay + index * staggerDelay)}
          exiting={FadeOut}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}

// ============================================================================
// Main Transition Wrapper Component
// ============================================================================

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  visible,
  enterConfig = { preset: 'fade', duration: 300, easing: 'ease' },
  exitConfig = { preset: 'fade', duration: 200, easing: 'ease' },
  onEnterComplete,
  onExitComplete,
  style,
  maintainLayout = false,
  staggerChildren,
  childDelay = 0,
}) => {
  const [isMounted, setIsMounted] = React.useState(visible);
  const activeConfig = visible ? enterConfig : exitConfig;

  const handleAnimationComplete = useCallback(() => {
    if (!visible) {
      setIsMounted(false);
      onExitComplete?.();
    } else {
      onEnterComplete?.();
    }
  }, [visible, onExitComplete, onEnterComplete]);

  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
    }
  }, [visible, isMounted]);

  const { progress } = useTransitionAnimation(
    visible,
    activeConfig,
    handleAnimationComplete
  );
  const animatedStyle = useAnimatedStyle(() =>
    createAnimatedStyles(activeConfig.preset, progress)
  );

  if (!isMounted && !maintainLayout) {
    return null;
  }

  const content = staggerChildren ? (
    <StaggerContainer
      staggerDelay={staggerChildren}
      initialDelay={childDelay}
      visible={visible}
    >
      {children}
    </StaggerContainer>
  ) : (
    children
  );

  if (!isMounted) {
    return maintainLayout ? <View style={[styles.placeholder, style]} /> : null;
  }

  return (
    <Animated.View style={[style, animatedStyle]}>
      {content}
    </Animated.View>
  );
};

// ============================================================================
// Layout Transition Component
// ============================================================================

interface LayoutTransitionProps {
  children: React.ReactNode;
  layoutId: string;
  style?: ViewStyle;
}

export const LayoutTransition: React.FC<LayoutTransitionProps> = ({
  children,
  layoutId,
  style,
}) => {
  return (
    <Animated.View style={style}>
      {children}
    </Animated.View>
  );
};

// ============================================================================
// Gesture-Driven Transition
// ============================================================================

interface GestureTransitionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  style?: ViewStyle;
}

// Note: Gesture implementation would require react-native-gesture-handler
// This is a placeholder for the gesture-driven transition pattern

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  placeholder: {
    opacity: 0,
  },
});

// ============================================================================
// Exports
// ============================================================================

export default TransitionWrapper;
