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
// ============================================================================
// Animation Patterns
// ============================================================================
// ============================================================================
// Sound Effects (Audio Cues)
// ============================================================================
// ============================================================================
// Feedback Orchestrator
// ============================================================================

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
// ============================================================================
// Error Recovery (Make failures feel recoverable)
// ============================================================================
export * from "./micro-interactions.types";
export * from "./micro-interactions.part1";
export * from "./micro-interactions.part2";
