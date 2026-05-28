import {
  type SharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/shared/feedback";

export const HAPTIC_PATTERNS = {
  STREAK_INCREMENT: () => haptics.success(),
  LEVEL_UP: () => haptics.success(),
  BOSS_DEFEAT: () => haptics.celebration(),
  BUTTON_PRESS: () => haptics.impact("light"),
  BUTTON_LONG_PRESS: () => haptics.impact("medium"),
  SWIPE_COMPLETE: () => haptics.impact("light"),
  STREAK_WARNING: () => haptics.warning(),
  PHASE_CHANGE: () => haptics.warning(),
  SESSION_INTERRUPTED: () => haptics.error(),
  STREAK_BROKEN: () => haptics.doubleTap("heavy"),
  REWARD_COMMON: () => haptics.impact("light"),
  REWARD_RARE: () => haptics.doubleTap("medium"),
  REWARD_EPIC: () => haptics.celebration(),
  REWARD_LEGENDARY: () => haptics.celebration(),
};

export const ANIMATION_PATTERNS = {
  buttonPress: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(0.95, { stiffness: 400, damping: 15 }),
      withSpring(1, { stiffness: 400, damping: 15 }),
    );
    return scale;
  },
  celebration: (
    translateY: SharedValue<number>,
    opacity: SharedValue<number>,
  ) => {
    translateY.value = withSequence(
      withSpring(-20, { stiffness: 300, damping: 10 }),
      withSpring(0, { stiffness: 300, damping: 10 }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 500 }),
    );
    return { translateY, opacity };
  },
  streakPulse: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(1.2, { stiffness: 200, damping: 10 }),
      withSpring(1, { stiffness: 200, damping: 10 }),
      withSpring(1.1, { stiffness: 200, damping: 10 }),
      withSpring(1, { stiffness: 200, damping: 10 }),
    );
    return scale;
  },
  damageImpact: (shake: SharedValue<number>) => {
    shake.value = withSequence(
      withTiming(5, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    return shake;
  },
  countUp: (value: SharedValue<number>, target: number) => {
    value.value = withTiming(target, {
      duration: 1000,
      easing: (x: number) => 1 - Math.pow(1 - x, 3),
    });
    return value;
  },
  progressFill: (progress: SharedValue<number>, target: number) => {
    progress.value = withSpring(target, {
      stiffness: 50,
      damping: 15,
      mass: 1,
    });
    return progress;
  },
};

export const SOUND_EFFECTS = {
  BUTTON_CLICK: "button_click.mp3",
  STREAK_INCREMENT: "coin_collect.mp3",
  LEVEL_UP: "level_up.mp3",
  BOSS_HIT: "hit_impact.mp3",
  BOSS_DEFEAT: "boss_defeat.mp3",
  REWARD_COMMON: "reward_small.mp3",
  REWARD_RARE: "reward_medium.mp3",
  REWARD_EPIC: "reward_large.mp3",
  REWARD_LEGENDARY: "reward_legendary.mp3",
  PHASE_CHANGE: "phase_transition.mp3",
  STREAK_WARNING: "warning_ping.mp3",
  SESSION_COMPLETE: "success_chime.mp3",
};
