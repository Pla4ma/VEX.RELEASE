import { type SharedValue, withSpring, withSequence, withTiming } from "react-native-reanimated";
import * as Sentry from "@sentry/react-native";
import { eventBus } from "@/events";
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
    scale.value = withSequence(withSpring(0.95, { stiffness: 400, damping: 15 }), withSpring(1, { stiffness: 400, damping: 15 }));
    return scale;
  },
  celebration: (translateY: SharedValue<number>, opacity: SharedValue<number>) => {
    translateY.value = withSequence(withSpring(-20, { stiffness: 300, damping: 10 }), withSpring(0, { stiffness: 300, damping: 10 }));
    opacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 500 }));
    return { translateY, opacity };
  },
  streakPulse: (scale: SharedValue<number>) => {
    scale.value = withSequence(withSpring(1.2, { stiffness: 200, damping: 10 }), withSpring(1, { stiffness: 200, damping: 10 }), withSpring(1.1, { stiffness: 200, damping: 10 }), withSpring(1, { stiffness: 200, damping: 10 }));
    return scale;
  },
  damageImpact: (shake: SharedValue<number>) => {
    shake.value = withSequence(withTiming(5, { duration: 50 }), withTiming(-5, { duration: 50 }), withTiming(3, { duration: 50 }), withTiming(-3, { duration: 50 }), withTiming(0, { duration: 50 }));
    return shake;
  },
  countUp: (value: SharedValue<number>, target: number) => {
    value.value = withTiming(target, { duration: 1000, easing: (x: number) => 1 - Math.pow(1 - x, 3) });
    return value;
  },
  progressFill: (progress: SharedValue<number>, target: number) => {
    progress.value = withSpring(target, { stiffness: 50, damping: 15, mass: 1 });
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

export interface FeedbackEvent {
  type: "STREAK_INCREMENT" | "LEVEL_UP" | "BOSS_DEFEAT" | "BOSS_DAMAGE" | "REWARD_EARNED" | "SESSION_COMPLETE" | "SESSION_INTERRUPTED" | "PHASE_CHANGE" | "STREAK_WARNING" | "STREAK_BROKEN";
  intensity: "LOW" | "MEDIUM" | "HIGH";
  metadata?: {
    rarity?: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
    amount?: number;
    isNewRecord?: boolean;
  };
}

export function triggerFeedback(event: FeedbackEvent): void {
  triggerHaptic(event);
  triggerSound(event);
  triggerVisual(event);
}

function triggerHaptic(event: FeedbackEvent): void {
  if (event.type === "REWARD_EARNED") {
    const rarity = event.metadata?.rarity ?? "COMMON";
    HAPTIC_PATTERNS[`REWARD_${rarity}`]();
    return;
  }

  switch (event.type) {
    case "STREAK_INCREMENT":
      HAPTIC_PATTERNS.STREAK_INCREMENT();
      return;
    case "LEVEL_UP":
      HAPTIC_PATTERNS.LEVEL_UP();
      return;
    case "BOSS_DEFEAT":
      HAPTIC_PATTERNS.BOSS_DEFEAT();
      return;
    case "SESSION_INTERRUPTED":
      HAPTIC_PATTERNS.SESSION_INTERRUPTED();
      return;
    case "PHASE_CHANGE":
      HAPTIC_PATTERNS.PHASE_CHANGE();
      return;
    case "STREAK_WARNING":
      HAPTIC_PATTERNS.STREAK_WARNING();
      return;
    case "STREAK_BROKEN":
      HAPTIC_PATTERNS.STREAK_BROKEN();
      return;
    case "BOSS_DAMAGE":
    case "SESSION_COMPLETE":
    default:
      HAPTIC_PATTERNS.BUTTON_PRESS();
  }
}

function triggerSound(event: FeedbackEvent): void {
  const sound = getSoundEffect(event.type);
  if (sound) {
    Sentry.addBreadcrumb({ category: "sound", message: "[Sound Effect] " + sound, level: "debug" });
  }
}

function getSoundEffect(type: FeedbackEvent["type"]): string | null {
  switch (type) {
    case "STREAK_INCREMENT":
      return SOUND_EFFECTS.STREAK_INCREMENT;
    case "LEVEL_UP":
      return SOUND_EFFECTS.LEVEL_UP;
    case "BOSS_DEFEAT":
      return SOUND_EFFECTS.BOSS_DEFEAT;
    case "BOSS_DAMAGE":
      return SOUND_EFFECTS.BOSS_HIT;
    case "REWARD_EARNED":
      return SOUND_EFFECTS.REWARD_COMMON;
    case "SESSION_COMPLETE":
      return SOUND_EFFECTS.SESSION_COMPLETE;
    case "PHASE_CHANGE":
      return SOUND_EFFECTS.PHASE_CHANGE;
    case "STREAK_WARNING":
      return SOUND_EFFECTS.STREAK_WARNING;
    case "SESSION_INTERRUPTED":
    case "STREAK_BROKEN":
      return null;
  }
}

function triggerVisual(event: FeedbackEvent): void {
  const intensityMap = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
  } satisfies Record<FeedbackEvent["intensity"], "low" | "medium" | "high">;

  eventBus.publish("feedback:visual", {
    ...event,
    intensity: intensityMap[event.intensity],
  });
}

export interface LoadingState {
  message: string;
  progress?: number;
  tip?: string;
  estimatedTime?: number;
}

export function getLoadingState(context: "INITIALIZING" | "SYNCING" | "MATCHMAKING"): LoadingState {
  const messages: Record<typeof context, string[]> = {
    INITIALIZING: ["Calibrating focus sensors...", "Loading your mastery data...", "Preparing today's challenges...", "Syncing with the void..."],
    SYNCING: ["Syncing your progress...", "Updating leaderboards...", "Fetching squad status...", "Loading daily dungeon..."],
    MATCHMAKING: ["Finding worthy opponents...", "Scanning for active squads...", "Preparing the arena...", "Summoning raid participants..."],
  };
  const tips = ["Tip: Deep work sessions are 3x more effective in the morning", "Tip: Taking breaks every 90 minutes improves retention", "Tip: Your streak is a commitment to your future self", "Tip: 25 minutes of focus beats 2 hours of distraction"];

  const contextMessages = messages[context] ?? messages.INITIALIZING;
  return {
    message: contextMessages[Math.floor(Math.random() * contextMessages.length)] ?? contextMessages[0]!,
    tip: tips[Math.floor(Math.random() * tips.length)] ?? tips[0]!,
  };
}

export interface ErrorRecovery {
  friendlyMessage: string;
  actionText: string;
  actionType: "RETRY" | "GO_BACK" | "CONTINUE" | "CONTACT_SUPPORT";
  encouragement: string;
}

export function getErrorRecovery(_error: Error, context: string): ErrorRecovery {
  const recoveries: Record<string, ErrorRecovery> = {
    NETWORK_ERROR: { friendlyMessage: "Connection lost - your progress is safe", actionText: "Retry", actionType: "RETRY", encouragement: "Even Focus Masters face interference. Try again!" },
    SESSION_INTERRUPTED: { friendlyMessage: "Session ended early", actionText: "Start Fresh Session", actionType: "CONTINUE", encouragement: "One setback doesn't define your journey. Keep going!" },
    STREAK_BROKEN: { friendlyMessage: "Your streak has ended", actionText: "Begin Comeback", actionType: "CONTINUE", encouragement: "Comebacks are stronger than streaks. Prove it!" },
  };
  return recoveries[context] ?? { friendlyMessage: "Something went wrong", actionText: "Try Again", actionType: "RETRY", encouragement: "Every expert was once a beginner. Keep trying!" };
}
