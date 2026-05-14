/**
 * Micro-Interaction Engine
 * Makes every user action feel satisfying through haptics, sounds, and animations
 */

import * as Haptics from 'expo-haptics';
import {
  type SharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';
import { eventBus } from '@/events';

// ============================================================================
// Haptic Feedback Patterns
// ============================================================================

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

// ============================================================================
// Animation Patterns
// ============================================================================

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

// ============================================================================
// Sound Effects (Audio Cues)
// ============================================================================

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

// ============================================================================
// Feedback Orchestrator
// ============================================================================

export interface FeedbackEvent {
  type:
    | 'STREAK_INCREMENT'
    | 'LEVEL_UP'
    | 'BOSS_DEFEAT'
    | 'BOSS_DAMAGE'
    | 'REWARD_EARNED'
    | 'SESSION_COMPLETE'
    | 'SESSION_INTERRUPTED'
    | 'PHASE_CHANGE'
    | 'STREAK_WARNING'
    | 'STREAK_BROKEN';
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: {
    rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    amount?: number;
    isNewRecord?: boolean;
  };
}

export function triggerFeedback(event: FeedbackEvent): void {
  // 1. Haptic (immediate physical feedback)
  triggerHaptic(event);

  // 2. Sound (auditory confirmation)
  triggerSound(event);

  // 3. Visual (animated celebration)
  triggerVisual(event);
}

function triggerHaptic(event: FeedbackEvent): void {
  switch (event.type) {
    case 'STREAK_INCREMENT':
      HAPTIC_PATTERNS.STREAK_INCREMENT();
      break;
    case 'LEVEL_UP':
      HAPTIC_PATTERNS.LEVEL_UP();
      break;
    case 'BOSS_DEFEAT':
      HAPTIC_PATTERNS.BOSS_DEFEAT();
      break;
    case 'REWARD_EARNED':
      const rarity = event.metadata?.rarity || 'COMMON';
      HAPTIC_PATTERNS[`REWARD_${rarity}`]();
      break;
    case 'STREAK_WARNING':
      HAPTIC_PATTERNS.STREAK_WARNING();
      break;
    case 'STREAK_BROKEN':
      HAPTIC_PATTERNS.STREAK_BROKEN();
      break;
    case 'PHASE_CHANGE':
      HAPTIC_PATTERNS.PHASE_CHANGE();
      break;
    default:
      HAPTIC_PATTERNS.BUTTON_PRESS();
  }
}

function triggerSound(event: FeedbackEvent): void {
  // In production, play actual sound files
  // For now, log the sound that would play
  const sound = SOUND_EFFECTS[event.type as keyof typeof SOUND_EFFECTS];
  if (sound) {
    Sentry.addBreadcrumb({ category: 'sound', message: '[Sound Effect] ' + sound, level: 'debug' });
  }
}

function triggerVisual(event: FeedbackEvent): void {
  // This would trigger React Native animations
  // The components would listen for these events
  const intensityMap = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  } satisfies Record<NonNullable<FeedbackEvent['intensity']>, 'low' | 'medium' | 'high'>;

  eventBus.publish('feedback:visual', {
    ...event,
    intensity: event.intensity ? intensityMap[event.intensity] : undefined,
  });
}

// ============================================================================
// Loading States (Make waiting feel productive)
// ============================================================================

export interface LoadingState {
  message: string;
  progress?: number;
  tip?: string;
  estimatedTime?: number;
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

// ============================================================================
// Error Recovery (Make failures feel recoverable)
// ============================================================================

export interface ErrorRecovery {
  friendlyMessage: string;
  actionText: string;
  actionType: 'RETRY' | 'GO_BACK' | 'CONTINUE' | 'CONTACT_SUPPORT';
  encouragement: string;
}

export function getErrorRecovery(error: Error, context: string): ErrorRecovery {
  const recoveries: Record<string, ErrorRecovery> = {
    NETWORK_ERROR: {
      friendlyMessage: 'Connection lost - your progress is safe',
      actionText: 'Retry',
      actionType: 'RETRY',
      encouragement: 'Even Focus Masters face interference. Try again!',
    },
    SESSION_INTERRUPTED: {
      friendlyMessage: 'Session ended early',
      actionText: 'Start Fresh Session',
      actionType: 'CONTINUE',
      encouragement: 'One setback doesn\'t define your journey. Keep going!',
    },
    STREAK_BROKEN: {
      friendlyMessage: 'Your streak has ended',
      actionText: 'Begin Comeback',
      actionType: 'CONTINUE',
      encouragement: 'Comebacks are stronger than streaks. Prove it!',
    },
  };

  return recoveries[context] || {
    friendlyMessage: 'Something went wrong',
    actionText: 'Try Again',
    actionType: 'RETRY',
    encouragement: 'Every expert was once a beginner. Keep trying!',
  };
}
