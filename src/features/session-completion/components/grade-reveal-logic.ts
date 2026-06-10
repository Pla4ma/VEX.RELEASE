import { useEffect, useMemo } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface GradeRevealAnimationProps {
  chainCount?: number;
  creativeMoodLabel?: string;
  gradeColor: string;
  gradeLetter: string;
  onComplete: () => void;
  sessionMode?: string;
}

function buildModeMessage(
  sessionMode?: string,
  creativeMoodLabel?: string,
  chainCount?: number,
): string | null {
  if (creativeMoodLabel) {
    return creativeMoodLabel;
  }
  if (chainCount && chainCount > 1) {
    return `${chainCount} session chain`;
  }
  return sessionMode ? `${sessionMode} complete` : null;
}

export function useGradeRevealSequence({
  chainCount,
  creativeMoodLabel,
  height,
  isReducedMotion,
  onComplete,
  sessionMode,
}: GradeRevealAnimationProps & {
  height: number;
  isReducedMotion: boolean;
}) {
  const overlay = useSharedValue(1);
  const flash = useSharedValue(0.28);
  const letterScale = useSharedValue(isReducedMotion ? 1 : 0.82);
  const particleProgress = useSharedValue(0);

  useEffect(() => {
    letterScale.value = withTiming(1, { duration: isReducedMotion ? 0 : 280 });
    flash.value = withTiming(0, { duration: isReducedMotion ? 0 : 520 });
    particleProgress.value = withTiming(1, {
      duration: isReducedMotion ? 0 : 700,
    });
    const timeout = setTimeout(onComplete, isReducedMotion ? 80 : 900);
    return () => clearTimeout(timeout);
  }, [flash, isReducedMotion, letterScale, onComplete, particleProgress]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));
  const letterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterScale.value }],
  }));
  const modeMessage = useMemo(
    () => buildModeMessage(sessionMode, creativeMoodLabel, chainCount),
    [chainCount, creativeMoodLabel, sessionMode],
  );

  return {
    flashStyle,
    letterStyle,
    modeMessage,
    overlayStyle,
    particleProgress,
  };
}
