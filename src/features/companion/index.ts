/**
 * Living Companion System - Barrel Export
 *
 * A living entity that evolves in real-time during focus sessions,
 * providing immediate visual feedback and emotional connection.
 */

export { CompanionService, getCompanionService, clearCompanionService } from './service';
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

// Analytics
export * as analytics from './analytics';
