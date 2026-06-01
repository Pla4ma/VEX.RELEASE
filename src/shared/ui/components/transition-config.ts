import { useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  Easing,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';

export type TransitionPreset =
  | 'fade' | 'slideRight' | 'slideLeft'
  | 'slideUp' | 'slideDown' | 'zoom'
  | 'flip' | 'scale' | 'none';
export type TransitionEasing =
  | 'linear' | 'ease' | 'easeIn'
  | 'easeOut' | 'easeInOut' | 'spring' | 'bounce';
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
  style?: import('react-native').ViewStyle;
  maintainLayout?: boolean;
  staggerChildren?: number;
  childDelay?: number;
}

type ReanimatedEasingFunction = (value: number) => number;
const EASING_MAP: Record<
  TransitionEasing,
  ReanimatedEasingFunction | undefined
> = {
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: undefined,
  bounce: Easing.bounce,
};
const DEFAULT_SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
  overshootClamping: false,
};

export function useTransitionAnimation(
  visible: boolean,
  config: TransitionConfig,
  onComplete?: () => void,
) {
  const progress = useSharedValue(visible ? 1 : 0);
  const isAnimating = useSharedValue(false);
  const { duration = 300, easing = 'ease', springConfig } = config;
  useEffect(() => {
    isAnimating.value = true;
    const targetValue = visible ? 1 : 0;
    const easingFn = EASING_MAP[easing];
    const callback = (finished?: boolean) => {
      'worklet';
      if (finished && onComplete) {runOnJS(onComplete)();}
      isAnimating.value = false;
    };
    if (easing === 'spring') {
      progress.value = withSpring(
        targetValue,
        { ...DEFAULT_SPRING_CONFIG, ...springConfig },
        callback,
      );
    } else {
      progress.value = withTiming(
        targetValue,
        { duration, easing: easingFn ?? Easing.ease },
        callback,
      );
    }
  }, [visible, progress, duration, easing, springConfig, onComplete, isAnimating]);
  return { progress, isAnimating };
}

const C = Extrapolation.CLAMP;
function lerp(v: number, from: number, to: number): number {
  'worklet';
  return interpolate(v, [0, 1], [from, to], C);
}

export function createAnimatedStyles(
  preset: TransitionPreset,
  progress: SharedValue<number>,
) {
  'worklet';
  const p = progress.value;
  switch (preset) {
    case 'fade':
      return { opacity: p };
    case 'slideRight':
      return { opacity: p, transform: [{ translateX: lerp(p, 100, 0) }] };
    case 'slideLeft':
      return { opacity: p, transform: [{ translateX: lerp(p, -100, 0) }] };
    case 'slideUp':
      return { opacity: p, transform: [{ translateY: lerp(p, 50, 0) }] };
    case 'slideDown':
      return { opacity: p, transform: [{ translateY: lerp(p, -50, 0) }] };
    case 'zoom':
    case 'scale':
      return { opacity: p, transform: [{ scale: lerp(p, 0.8, 1) }] };
    case 'flip':
      return { opacity: p, transform: [{ rotateY: `${lerp(p, -90, 0)}deg` }] };
    case 'none':
    default:
      return {};
  }
}
