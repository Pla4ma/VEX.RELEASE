/**
 * useSessionAnimations Hook
 * Manages all animation values and effects for the Active Session screen
 */

import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Circle } from "react-native-svg";
import { useTheme } from "../../../theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface UseSessionAnimationsParams {
  completionPercentage: number;
  purityScore: number;
  isActive: boolean;
  isPaused: boolean;
}

interface UseSessionAnimationsReturn {
  progressValue: SharedValue<number>;
  pulseValue: SharedValue<number>;
  purityColorValue: SharedValue<number>;
  timerAccentColor: string;
  animatedCircleProps: ReturnType<typeof useAnimatedProps>;
  pulseStyle: ReturnType<typeof useAnimatedStyle>;
  RING_SIZE: number;
  STROKE_WIDTH: number;
  RADIUS: number;
  CIRCUMFERENCE: number;
}

export function useSessionAnimations({
  completionPercentage,
  purityScore,
  isActive,
  isPaused,
}: UseSessionAnimationsParams): UseSessionAnimationsReturn {
  const { theme } = useTheme();

  const progressValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const purityColorValue = useSharedValue(100);

  const purityColorMap = {
    elite: theme.colors.success.DEFAULT,
    good: theme.colors.primary[500],
    okay: theme.colors.warning.DEFAULT,
    distracted: theme.colors.error.DEFAULT,
  };

  const targetColor =
    purityScore >= 90
      ? purityColorMap.elite
      : purityScore >= 70
        ? purityColorMap.good
        : purityScore >= 45
          ? purityColorMap.okay
          : purityColorMap.distracted;

  const [timerAccentColor, setTimerAccentColor] = useState(
    purityColorMap.elite,
  );

  useEffect(() => {
    const timeout = setTimeout(() => setTimerAccentColor(targetColor), 1000);
    return () => clearTimeout(timeout);
  }, [targetColor]);

  // Sync progress animation with session
  useEffect(() => {
    progressValue.value = withTiming(completionPercentage / 100, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
  }, [completionPercentage, progressValue]);

  useEffect(() => {
    purityColorValue.value = withTiming(purityScore, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [purityColorValue, purityScore]);

  // Pulse animation when active
  useEffect(() => {
    if (isActive && !isPaused) {
      pulseValue.value = withRepeat(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseValue.value = withSpring(1);
    }
  }, [isActive, isPaused, pulseValue]);

  // Progress ring constants
  const RING_SIZE = 280;
  const STROKE_WIDTH = 10;
  const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Animated stroke-dashoffset via Reanimated
  const animatedStrokeDashoffset = useDerivedValue(() => {
    return CIRCUMFERENCE * (1 - progressValue.value);
  });

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedStrokeDashoffset.value,
  }));

  // Pulse animation style
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
    };
  });

  return {
    progressValue,
    pulseValue,
    purityColorValue,
    timerAccentColor,
    animatedCircleProps,
    pulseStyle,
    RING_SIZE,
    STROKE_WIDTH,
    RADIUS,
    CIRCUMFERENCE,
  };
}

export { AnimatedCircle };
