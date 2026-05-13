/**
 * Haptics Constants
 *
 * Semantic haptic event mappings for consistent tactile feedback.
 * Every critical user action has an associated haptic response.
 *
 * Usage:
 *   import { HapticEvents, triggerHapticEvent } from '@/constants/haptics';
 *   await triggerHapticEvent(HapticEvents.SESSION_START);
 */

import { triggerHaptic, type HapticFeedbackKind } from '../utils/haptics';

// ============================================================================
// Haptic Event Types
// ============================================================================
// ============================================================================
// Haptic Event Constants
// ============================================================================

export const HapticEvents = {
  // Session lifecycle
  SESSION_START: 'SESSION_START',
  SESSION_COMPLETE: 'SESSION_COMPLETE',
  SESSION_PAUSE: 'SESSION_PAUSE',
  SESSION_RESUME: 'SESSION_RESUME',

  // Progression
  LEVEL_UP: 'LEVEL_UP',
  BOSS_HIT: 'BOSS_HIT',
  BOSS_DEFEATED: 'BOSS_DEFEATED',
  STREAK_MILESTONE: 'STREAK_MILESTONE',
  STREAK_BREAK: 'STREAK_BREAK',
  STREAK_SAVED: 'STREAK_SAVED',
  CRITICAL_HIT: 'CRITICAL_HIT',
  RARE_LOOT: 'RARE_LOOT',
  LEGENDARY_LOOT: 'LEGENDARY_LOOT',

  // Rewards & collection
  REWARD_CLAIM: 'REWARD_CLAIM',
  CHEST_OPEN: 'CHEST_OPEN',

  // Purchase & monetization
  PURCHASE_SUCCESS: 'PURCHASE_SUCCESS',
  PURCHASE_ERROR: 'PURCHASE_ERROR',

  // UI interactions
  BUTTON_PRESS: 'BUTTON_PRESS',
  SELECTION_CHANGE: 'SELECTION_CHANGE',

  // Status feedback
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
} as const;

// ============================================================================
// Haptic Event to Feedback Kind Mapping
// ============================================================================

const HAPTIC_EVENT_MAP: Record<HapticEvent, HapticFeedbackKind> = {
  // Session lifecycle — medium impact for state changes
  SESSION_START: 'impactMedium',
  SESSION_COMPLETE: 'success',
  SESSION_PAUSE: 'impactLight',
  SESSION_RESUME: 'impactMedium',

  // Progression — strong feedback for achievements
  LEVEL_UP: 'success',
  BOSS_HIT: 'impactMedium',
  BOSS_DEFEATED: 'success',
  STREAK_MILESTONE: 'success',
  STREAK_BREAK: 'error',
  STREAK_SAVED: 'success',
  CRITICAL_HIT: 'impactHeavy',
  RARE_LOOT: 'impactMedium',
  LEGENDARY_LOOT: 'impactHeavy',

  // Rewards & collection — satisfying feedback
  REWARD_CLAIM: 'success',
  CHEST_OPEN: 'impactMedium',

  // Purchase & monetization — clear transaction feedback
  PURCHASE_SUCCESS: 'success',
  PURCHASE_ERROR: 'error',

  // UI interactions — subtle feedback
  BUTTON_PRESS: 'impactLight',
  SELECTION_CHANGE: 'selection',

  // Status feedback
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  ACHIEVEMENT_UNLOCKED: 'success',
};

// ============================================================================
// Haptic Intensity Levels (for progressive feedback)
// ============================================================================

export const HapticIntensity = {
  SUBTLE: 'impactLight',
  NORMAL: 'impactMedium',
  STRONG: 'impactHeavy',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Trigger haptic feedback for a semantic event
 */
export async function triggerHapticEvent(event: HapticEvent): Promise<void> {
  const kind = HAPTIC_EVENT_MAP[event];
  await triggerHaptic(kind);
}

/**
 * Trigger haptic with custom intensity
 */
export async function triggerHapticIntensity(
  intensity: keyof typeof HapticIntensity
): Promise<void> {
  const kind = HapticIntensity[intensity];
  await triggerHaptic(kind);
}

/**
 * Get the haptic feedback kind for an event (for conditional logic)
 */
export function getHapticKindForEvent(event: HapticEvent): HapticFeedbackKind {
  return HAPTIC_EVENT_MAP[event];
}

// ============================================================================
// Haptic Pattern Triggers (for complex sequences)
// ============================================================================

import { HapticPatterns, triggerHapticPattern } from '../utils/haptics';

/**
 * Trigger haptic feedback for events that need pattern sequences
 * Call this instead of triggerHapticEvent for LEGENDARY_LOOT, LEVEL_UP, BOSS_DEFEATED
 */
export async function triggerHapticPatternEvent(event: HapticEvent): Promise<void> {
  switch (event) {
    case 'LEGENDARY_LOOT':
      await triggerHapticPattern(HapticPatterns.LEGENDARY_SEQUENCE, 120);
      break;
    case 'LEVEL_UP':
      await triggerHapticPattern(HapticPatterns.LEVEL_UP_SEQUENCE, 200);
      break;
    case 'BOSS_DEFEATED':
      await triggerHapticPattern(HapticPatterns.BOSS_DEFEATED_SEQUENCE, 180);
      break;
    default:
      // Fall back to single haptic for other events
      await triggerHapticEvent(event);
  }
}

// ============================================================================
// Legacy Aliases (for backward compatibility)
// ============================================================================

/** @deprecated Use HapticEvents.SESSION_START */
export const HAPTIC_SESSION_START = HapticEvents.SESSION_START;

/** @deprecated Use HapticEvents.SESSION_COMPLETE */
export const HAPTIC_SESSION_COMPLETE = HapticEvents.SESSION_COMPLETE;

/** @deprecated Use HapticEvents.LEVEL_UP */
export const HAPTIC_LEVEL_UP = HapticEvents.LEVEL_UP;

/** @deprecated Use HapticEvents.PURCHASE_SUCCESS */
export const HAPTIC_PURCHASE_SUCCESS = HapticEvents.PURCHASE_SUCCESS;

export * from "./haptics.types";
