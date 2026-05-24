/**
 * Companion Analytics
 *
 * Analytics tracking for companion personality responses and interactions.
 */

import { capture } from '../../shared/analytics/analytics-service';
import type { PersonalityEventType } from './CompanionPersonalityEngine';
import type { CompanionPhase, CompanionMood } from './types';

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

/**
 * Track companion growth event
 */
export function trackCompanionGrowth(
  userId: string,
  reason: 'session_completed' | 'streak_maintained' | 'comeback_completed' | 'focus_score_changed' | 'daily_mission_completed',
  previousPhase?: CompanionPhase,
  newPhase?: CompanionPhase,
  previousMood?: CompanionMood,
  newMood?: CompanionMood,
  level?: number,
  sessionId?: string
): void {
  capture('vex_companion_growth', {
    user_id: userId,
    reason,
    previous_phase: previousPhase,
    new_phase: newPhase,
    previous_mood: previousMood,
    new_mood: newMood,
    level,
    session_id: sessionId,
    timestamp: Date.now(),
  });
}

/**
 * Track companion evolution
 */
export function trackCompanionEvolution(
  userId: string,
  previousPhase: CompanionPhase,
  newPhase: CompanionPhase,
  totalFocusMinutes: number,
  evolutionCeremony: boolean
): void {
  capture('vex_companion_evolution', {
    user_id: userId,
    previous_phase: previousPhase,
    new_phase: newPhase,
    total_focus_minutes: totalFocusMinutes,
    evolution_ceremony: evolutionCeremony,
    timestamp: Date.now(),
  });
}

/**
 * Track companion milestone
 */
export function trackCompanionMilestone(
  userId: string,
  milestoneType: 'level' | 'sessions' | 'focus_minutes' | 'perfect_sessions',
  value: number,
  previousValue: number
): void {
  capture('vex_companion_milestone', {
    user_id: userId,
    milestone_type: milestoneType,
    value,
    previous_value: previousValue,
    timestamp: Date.now(),
  });
}
