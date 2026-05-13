import * as Haptics from "expo-haptics";
import { type SharedValue, withSpring, withSequence, withTiming } from "react-native-reanimated";
import * as Sentry from "@sentry/react-native";
import { eventBus } from "@/events";


export const HAPTIC_PATTERNS = {
  // Success states
  STREAK_INCREMENT: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  LEVEL_UP: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  BOSS_DEFEAT: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
  },

  // Action feedback
  BUTTON_PRESS: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  BUTTON_LONG_PRESS: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  SWIPE_COMPLETE: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Warning/Urgency
  STREAK_WARNING: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  PHASE_CHANGE: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Error
  SESSION_INTERRUPTED: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  STREAK_BROKEN: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
  },

  // Rewards (variable intensity based on rarity)
  REWARD_COMMON: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  REWARD_RARE: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 50);
  },
  REWARD_EPIC: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 100);
  },
  REWARD_LEGENDARY: () => {
    // Intense pattern for legendary drops
    const pattern = [0, 50, 100, 150, 200];
    pattern.forEach((delay, i) => {
      setTimeout(() => {
        Haptics.impactAsync(i % 2 === 0 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
      }, delay);
    });
  },
};

export const ANIMATION_PATTERNS = {
  // Button press
  buttonPress: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(0.95, { stiffness: 400, damping: 15 }),
      withSpring(1, { stiffness: 400, damping: 15 })
    );
    return scale;
  },

  // Success celebration
  celebration: (translateY: SharedValue<number>, opacity: SharedValue<number>) => {
    translateY.value = withSequence(
      withSpring(-20, { stiffness: 300, damping: 10 }),
      withSpring(0, { stiffness: 300, damping: 10 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 500 })
    );
    return { translateY, opacity };
  },

  // Streak pulse
  streakPulse: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(1.2, { stiffness: 200, damping: 10 }),
      withSpring(1, { stiffness: 200, damping: 10 }),
      withSpring(1.1, { stiffness: 200, damping: 10 }),
      withSpring(1, { stiffness: 200, damping: 10 })
    );
    return scale;
  },

  // Damage dealt (to boss)
  damageImpact: (shake: SharedValue<number>) => {
    shake.value = withSequence(
      withTiming(5, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    return shake;
  },

  // Number count-up
  countUp: (value: SharedValue<number>, target: number) => {
    value.value = withTiming(target, {
      duration: 1000,
      easing: (x: number) => 1 - Math.pow(1 - x, 3), // Ease out cubic
    });
    return value;
  },

  // Progress bar fill
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
  // These would map to actual audio files
  BUTTON_CLICK: 'button_click.mp3',
  STREAK_INCREMENT: 'coin_collect.mp3',
  LEVEL_UP: 'level_up.mp3',
  BOSS_HIT: 'hit_impact.mp3',
  BOSS_DEFEAT: 'boss_defeat.mp3',
  REWARD_COMMON: 'reward_small.mp3',
  REWARD_RARE: 'reward_medium.mp3',
  REWARD_EPIC: 'reward_large.mp3',
  REWARD_LEGENDARY: 'reward_legendary.mp3',
  PHASE_CHANGE: 'phase_transition.mp3',
  STREAK_WARNING: 'warning_ping.mp3',
  SESSION_COMPLETE: 'success_chime.mp3',
};

export function triggerFeedback(event: FeedbackEvent): void {
  // 1. Haptic (immediate physical feedback)
  triggerHaptic(event);

  // 2. Sound (auditory confirmation)
  triggerSound(event);

  // 3. Visual (animated celebration)
  triggerVisual(event);
}

export function getLoadingState(context: 'INITIALIZING' | 'SYNCING' | 'MATCHMAKING'): LoadingState {
  const messages: Record<string, string[]> = {
    INITIALIZING: [
      'Calibrating focus sensors...',
      'Loading your mastery data...',
      'Preparing today\'s challenges...',
      'Syncing with the void...',
    ],
    SYNCING: [
      'Syncing your progress...',
      'Updating leaderboards...',
      'Fetching squad status...',
      'Loading daily dungeon...',
    ],
    MATCHMAKING: [
      'Finding worthy opponents...',
      'Scanning for active squads...',
      'Preparing the arena...',
      'Summoning raid participants...',
    ],
  };

  const tips = [
    'Tip: Deep work sessions are 3x more effective in the morning',
    'Tip: Taking breaks every 90 minutes improves retention',
    'Tip: Your streak is a commitment to your future self',
    'Tip: 25 minutes of focus beats 2 hours of distraction',
  ];

  return {
    message: messages[context][Math.floor(Math.random() * messages[context].length)],
    tip: tips[Math.floor(Math.random() * tips.length)],
  };
}