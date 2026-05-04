/**
 * Companion Analytics
 *
 * Analytics tracking for companion personality responses and interactions.
 */

import { capture } from '../../shared/analytics/analytics-service';
import type { PersonalityEventType } from './CompanionPersonalityEngine';

/**
 * Track personality response triggered
 */
export function trackPersonalityResponse(
  userId: string,
  eventType: PersonalityEventType,
  animation: string,
  dialogueLength: number
): void {
  capture('companion_personality_response', {
    user_id: userId,
    event_type: eventType,
    animation,
    dialogue_lines: dialogueLength,
    timestamp: Date.now(),
  });
}

/**
 * Track companion dialogue viewed
 */
export function trackDialogueViewed(
  userId: string,
  dialogueIndex: number,
  totalDialogues: number
): void {
  capture('companion_dialogue_viewed', {
    user_id: userId,
    dialogue_index: dialogueIndex,
    total_dialogues: totalDialogues,
  });
}

/**
 * Track companion animation completed
 */
export function trackAnimationCompleted(
  userId: string,
  animation: string,
  duration: number
): void {
  capture('companion_animation_completed', {
    user_id: userId,
    animation,
    duration_ms: duration,
  });
}

/**
 * Track companion mood change
 */
export function trackMoodChange(
  userId: string,
  previousMood: string,
  newMood: string,
  reason: string
): void {
  capture('companion_mood_change', {
    user_id: userId,
    previous_mood: previousMood,
    new_mood: newMood,
    reason,
  });
}

/**
 * Set companion user properties
 */
export function setCompanionUserProperties(
  userId: string,
  companionPhase: string,
  currentMood: string,
  responseCount: number
): void {
  // Set user properties for segmentation
  // This would typically call an analytics identify method
}
