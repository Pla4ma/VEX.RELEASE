import { useEffect, useRef } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SessionMode } from '../../../session/modes';
import { gradeReveal } from '../../../utils/haptics';

const REVEAL_DURATION_MS = 2000;

export type GradeRevealAnimationProps = {
  gradeLetter: string;
  gradeColor: string;
  onComplete: () => void;
  sessionMode?: SessionMode;
  chainCount?: number;
  creativeMoodLabel?: string | null;
};

export function getModeMessage(
  grade: string,
  mode?: SessionMode,
  chainCount?: number,
  mood?: string | null,
): string | null {
  if (!mode) {
    return null;
  }
  if (mode === SessionMode.DEEP_WORK && grade === 'S') {
    return 'Flawless deep work. Elite.';
  }
  if (mode === SessionMode.DEEP_WORK && grade === 'A') {
    return 'Strong deep work session.';
  }
  if (mode === SessionMode.SPRINT && (chainCount ?? 0) >= 3) {
    return `Sprint chain × ${chainCount}. Momentum is yours.`;
  }
  if (mode === SessionMode.CREATIVE && mood) {
    return `Creative session done. ${mood} energy.`;
  }
  if (mode === SessionMode.LIGHT_FOCUS) {
    return 'Streak protected. Every session counts.';
  }
  return null;
}

export function useGradeRevealSequence(
  props: GradeRevealAnimationProps & {
    height: number;
    isReducedMotion: boolean;
  },
) {
  const {
    chainCount,
    creativeMoodLabel,
    gradeColor,
    gradeLetter,
    height,
    isReducedMotion,
    onComplete,
    sessionMode,
  } = props;

  const completedRef = useRef(false);
  const modeMessage = getModeMessage(
    gradeLetter,
    sessionMode,
    chainCount,
    creativeMoodLabel,
  );

  const flashOpacity = useSharedValue(0);
  const letterScale = useSharedValue(0);
  const letterTranslateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);
  const particleProgress = useSharedValue(0);

  useEffect(() => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    if (isReducedMotion) {
      letterScale.value = 1;
      flashOpacity.value = withTiming(0.18, { duration: 120 });
      overlayOpacity.value = withDelay(
        260,
        withTiming(0, { duration: 120 }, () => runOnJS(onComplete)()),
      );
      return;
    }
    const hapticTimeout = setTimeout(() => {
      void gradeReveal(gradeLetter as 'S' | 'A' | 'B' | 'C' | 'D');
    }, 200);
    const shrinkTimeout = setTimeout(() => {
      letterScale.value = withTiming(0.34, {
        duration: 440,
        easing: Easing.inOut(Easing.cubic),
      });
    }, 1500);
    const completeTimeout = setTimeout(onComplete, REVEAL_DURATION_MS);
    flashOpacity.value = withDelay(
      200,
      withTiming(0.9, { duration: 120 }, () => {
        flashOpacity.value = withDelay(380, withTiming(0, { duration: 400 }));
      }),
    );
    letterScale.value = withDelay(
      200,
      withSpring(1.3, { damping: 8, stiffness: 150 }, () => {
        letterScale.value = withTiming(1, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        });
      }),
    );
    if (gradeLetter === 'S') {
      particleProgress.value = withDelay(
        220,
        withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
      );
    }
    letterTranslateY.value = withDelay(
      1500,
      withTiming(-height * 0.18, {
        duration: 440,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
    overlayOpacity.value = withDelay(
      1750,
      withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) }),
    );
    return () => {
      clearTimeout(hapticTimeout);
      clearTimeout(shrinkTimeout);
      clearTimeout(completeTimeout);
    };
  }, [
    flashOpacity,
    gradeLetter,
    height,
    isReducedMotion,
    letterScale,
    letterTranslateY,
    onComplete,
    overlayOpacity,
    particleProgress,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const letterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: letterTranslateY.value },
      { scale: letterScale.value },
    ],
  }));

  return { overlayStyle, flashStyle, letterStyle, particleProgress, modeMessage };
}
