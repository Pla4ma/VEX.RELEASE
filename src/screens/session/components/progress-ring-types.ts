import { useAnimatedProps, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { PurityLabel } from '../utils/active-session';

export type ActiveSessionProgressRingProps = {
  CIRCUMFERENCE: number;
  RADIUS: number;
  RING_SIZE: number;
  STROKE_WIDTH: number;
  animatedCircleProps: ReturnType<typeof useAnimatedProps>;
  completionPercentage: number;
  glowStyle: {
    elevation: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
  };
  outerStrokeDashoffset: number;
  perfectFocusActive: boolean;
  perfectFocusBurst: SharedValue<number>;
  phaseAccent: string;
  pulseStyle: ReturnType<typeof useAnimatedStyle>;
  purityLabel: PurityLabel;
  purityScore: number;
  remainingSeconds: number;
  rotatingPerfectFocusStyle: ReturnType<typeof useAnimatedStyle>;
  showPurityScore: boolean;
  streakMultiplier: number;
  themeColors: { inverse: string; primary300: string; warning: string };
  withAlpha: (color: string, alpha: number) => string;
};

export const USE_SAFE_PROGRESS_RING = true;
