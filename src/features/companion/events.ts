/**
 * Companion Events
 *
 * Event definitions and handlers for companion growth and reactions.
 */

import { eventBus } from '../../events/EventBus';
import type { CompanionPhase, CompanionMood, CompanionState } from './types';

interface _CompanionEventPayloads {
  'companion:state_changed': {
    userId: string;
    companionId: string;
    previousPhase?: CompanionPhase;
    newPhase: CompanionPhase;
    previousMood?: CompanionMood;
    newMood: CompanionMood;
    level: number;
    totalFocusMinutes: number;
    sessionCount: number;
    reason:
      | 'session_completed'
      | 'milestone_reached'
      | 'evolution_triggered'
      | 'focus_threshold_passed'
      | 'mood_decay'
      | 'manual_boost';
    sessionId?: string;
    timestamp: number;
  };
  'companion:evolution': {
    userId: string;
    companionId: string;
    previousPhase: CompanionPhase;
    newPhase: CompanionPhase;
    totalFocusMinutes: number;
    evolutionCeremony: boolean;
    timestamp: number;
  };
  'companion:milestone_reached': {
    userId: string;
    companionId: string;
    milestoneType:
      | 'focus_minutes'
      | 'sessions'
      | 'streak_days'
      | 'level'
      | 'phase_advancement';
    value: number;
    previousValue: number;
    timestamp: number;
  };
}

/**
 * Companion state change event handler
 */
export function emitCompanionStateChanged(
  userId: string,
  companionId: string,
  previousState: Partial<CompanionState>,
  newState: CompanionState,
  reason: string,
  sessionId?: string,
): void {
  eventBus.publish('companion:state_changed', {
    userId,
    companionId,
    previousPhase: previousState.phase,
    newPhase: newState.phase,
    previousMood: previousState.currentMood,
    newMood: newState.currentMood,
    level: newState.level,
    totalFocusMinutes: newState.totalFocusMinutes,
    sessionCount: newState.sessionCount,
    reason,
    sessionId,
    timestamp: Date.now(),
  });
}

/**
 * Companion evolution event handler
 */
export function emitCompanionEvolution(
  userId: string,
  companionId: string,
  previousPhase: CompanionPhase,
  newPhase: CompanionPhase,
  totalFocusMinutes: number,
  evolutionCeremony: boolean = true,
): void {
  eventBus.publish('companion:evolution', {
    userId,
    companionId,
    previousPhase,
    newPhase,
    totalFocusMinutes,
    evolutionCeremony,
    timestamp: Date.now(),
  });
}

/**
 * Companion milestone event handler
 */
export function emitCompanionMilestone(
  userId: string,
  companionId: string,
  milestoneType: string,
  value: number,
  previousValue: number,
): void {
  eventBus.publish('companion:milestone_reached', {
    userId,
    companionId,
    milestoneType,
    value,
    previousValue,
    timestamp: Date.now(),
  });
}

/**
 * Subscribe to companion events
 */
export function subscribeToCompanionEvents() {
  return {
    onStateChanged: (callback: (data: Record<string, unknown>) => void) =>
      eventBus.subscribe(
        'companion:state_changed',
        callback as (data: unknown) => void,
      ),

    onEvolution: (callback: (data: Record<string, unknown>) => void) =>
      eventBus.subscribe(
        'companion:evolution',
        callback as (data: unknown) => void,
      ),

    onMilestone: (callback: (data: Record<string, unknown>) => void) =>
      eventBus.subscribe(
        'companion:milestone_reached',
        callback as (data: unknown) => void,
      ),
  };
}
