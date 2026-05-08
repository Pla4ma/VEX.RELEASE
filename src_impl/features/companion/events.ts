/**
 * Companion Events
 *
 * Event definitions and handlers for companion growth and reactions.
 */

import { eventBus } from '../../events/EventBus';
import type { CompanionPhase, CompanionMood, CompanionState } from './types';
import type { EmotionRetentionEventDefinitions } from '../../events/types/emotion-retention';

/**
 * Companion state change event handler
 */
export function emitCompanionStateChanged(
  userId: string,
  companionId: string,
  previousState: Partial<CompanionState>,
  newState: CompanionState,
  reason: EmotionRetentionEventDefinitions['companion:state_changed']['reason'],
  sessionId?: string
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
  evolutionCeremony: boolean = true
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
  milestoneType: EmotionRetentionEventDefinitions['companion:milestone_reached']['milestoneType'],
  value: number,
  previousValue: number
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
  // These can be used by other systems to react to companion changes
  return {
    onStateChanged: (callback: (data: EmotionRetentionEventDefinitions['companion:state_changed']) => void) =>
      eventBus.subscribe('companion:state_changed', callback),

    onEvolution: (callback: (data: EmotionRetentionEventDefinitions['companion:evolution']) => void) =>
      eventBus.subscribe('companion:evolution', callback),

    onMilestone: (callback: (data: EmotionRetentionEventDefinitions['companion:milestone_reached']) => void) =>
      eventBus.subscribe('companion:milestone_reached', callback),
  };
}
