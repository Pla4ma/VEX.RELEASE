import { useEffect, useRef, useState } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import type { ComboTierConfig } from './combo-meter-types';
import { getMilestoneMessage } from './combo-meter-helpers';

interface UseComboAnimationsOptions {
  comboMinutes: number;
  isPaused: boolean;
  isIdle: boolean;
  tier: ComboTierConfig;
  tierProgress: number;
  onMilestoneReached?: (milestone: number, multiplier: number) => void;
  onComboBroken?: (finalCombo: number) => void;
}

export function useComboAnimations({
  comboMinutes,
  isPaused,
  isIdle,
  tier,
  tierProgress,
  onMilestoneReached,
  onComboBroken,
}: UseComboAnimationsOptions) {
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState('');
  const lastMilestoneRef = useRef(0);
  const [showComboBroken, setShowComboBroken] = useState(false);
  const previousComboRef = useRef(comboMinutes);
  const wasPausedRef = useRef(isPaused);

  const progressWidth = useSharedValue(0);
  const glowIntensity = useSharedValue(0.5);
  const scale = useSharedValue(1);
  const fireIntensity = useSharedValue(0);
  const shakeRotation = useSharedValue(0);

  useEffect(() => {
    return () => {
      cancelAnimation(progressWidth);
      cancelAnimation(glowIntensity);
      cancelAnimation(scale);
      cancelAnimation(fireIntensity);
      cancelAnimation(shakeRotation);
    };
  }, [fireIntensity, glowIntensity, progressWidth, scale, shakeRotation]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const milestones = [5, 10, 15, 20, 25, 30, 45, 60];
    for (const milestone of milestones) {
      if (comboMinutes === milestone && milestone > lastMilestoneRef.current) {
        lastMilestoneRef.current = milestone;
        setMilestoneMessage(getMilestoneMessage(milestone));
        setShowMilestone(true);
        scale.value = withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 15 }),
        );
        onMilestoneReached?.(milestone, tier.multiplier);
        timer = setTimeout(() => {
          setShowMilestone(false);
        }, 3000);
        break;
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [comboMinutes, tier.multiplier, onMilestoneReached, scale]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (
      (isPaused || isIdle) &&
      previousComboRef.current > 0 &&
      !wasPausedRef.current
    ) {
      if (previousComboRef.current >= 5) {
        setShowComboBroken(true);
        onComboBroken?.(previousComboRef.current);
        timer = setTimeout(() => {
          setShowComboBroken(false);
        }, 2000);
      }
    }
    previousComboRef.current = comboMinutes;
    wasPausedRef.current = isPaused || isIdle;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPaused, isIdle, comboMinutes, onComboBroken]);

  useEffect(() => {
    progressWidth.value = withTiming(tierProgress, { duration: 500 });
  }, [tierProgress, progressWidth]);

  useEffect(() => {
    if (comboMinutes >= 10 && !isPaused && !isIdle) {
      fireIntensity.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true,
      );
    } else {
      fireIntensity.value = withTiming(0, { duration: 300 });
    }
  }, [comboMinutes, isPaused, isIdle, fireIntensity]);

  useEffect(() => {
    if (comboMinutes >= 15 && !isPaused && !isIdle) {
      shakeRotation.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 50 }),
          withTiming(1, { duration: 50 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(shakeRotation);
      shakeRotation.value = 0;
    }
  }, [comboMinutes, isPaused, isIdle, shakeRotation]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
    backgroundColor: tier.color,
  }));

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowIntensity.value, [0.5, 1], [0.3, 0.6]),
    transform: [
      { scale: interpolate(glowIntensity.value, [0.5, 1], [1, 1.1]) },
    ],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${shakeRotation.value}deg` },
    ],
  }));

  const fireStyle = useAnimatedStyle(() => ({ opacity: fireIntensity.value }));

  return {
    progressStyle,
    glowAnimStyle,
    animatedContainerStyle,
    fireStyle,
    showMilestone,
    milestoneMessage,
    showComboBroken,
    previousComboRef,
  };
}
