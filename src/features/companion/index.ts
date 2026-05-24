/**
 * Living Companion System - Barrel Export
 *
 * A living entity that evolves in real-time during focus sessions,
 * providing immediate visual feedback and emotional connection.
 */

export { CompanionService } from './service';
export { getCompanionService, clearCompanionService } from './service-instance';
export { getCompanion, levelUpCompanion, feedCompanion, getCompanionBonus } from './profile-service';
export { LivingCompanion } from './components/LivingCompanion';
export { CompanionEvolutionCeremony } from './components/CompanionEvolutionCeremony';
export {
  getCompanionPersonalityEngine,
  resetCompanionPersonalityEngine,
} from './CompanionPersonalityEngine';
export { useCompanionPersonality } from './hooks/useCompanionPersonality';
export type {
  CompanionState,
  CompanionPhase,
  CompanionMood,
  CompanionElement,
  CompanionSessionEvent,
  CompanionVisualConfig,
} from './types';
export { EVOLUTION_THRESHOLDS, MOOD_RULES, ELEMENT_THEMES } from './types';
export type { PersonalityEventType } from './CompanionPersonalityEngine';
export { useCompanionMemories } from './memory-hooks';
export { checkAndRecordSessionMemories, getCompanionMemories, maybeCreateMemory } from './memory-service';
export type { CompanionMemory, CompanionMemoryType } from './memory-types';

// Analytics
export * as analytics from './analytics';

// Events
export {
  emitCompanionStateChanged,
  emitCompanionEvolution,
  emitCompanionMilestone,
  subscribeToCompanionEvents,
} from './events';
