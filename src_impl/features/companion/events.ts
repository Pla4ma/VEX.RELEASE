import { eventBus } from '../../events';
import type { CompanionState } from './types';
export function emitCompanionStateChanged(userId: string, companionId: string, _previous: CompanionState, current: CompanionState, reason: string, sessionId?: string): void {
  eventBus.publish('companion:state_changed', { userId, companionId, currentState: current, reason, sessionId, timestamp: Date.now() });
}
export function emitCompanionEvolution(userId: string, companionId: string, previousPhase: string, newPhase: string, totalFocusMinutes: number, _isNatural: boolean): void {
  eventBus.publish('companion:evolved', { userId, companionId, previousPhase, newPhase, totalFocusMinutes, timestamp: Date.now() });
}

export function emitCompanionMilestone(userId: string, companionId: string, milestone: string, _current: number = 0, _previous: number = 0): void {
  eventBus.publish('companion:milestone', { userId, companionId, milestone, timestamp: Date.now() });
}
export function subscribeToCompanionEvents(userId: string, callback: (event: unknown) => void): () => void {
  return eventBus.subscribe('companion:state_changed', () => {});
}