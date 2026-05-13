/**
 * Living Companion System — Emotional Anchor
 *
 * 3 emotional systems:
 * 1. Bond — memory, trust, relationship progression
 * 2. Recovery — failure → understanding, not punishment
 * 3. Identity — "You've focused 50 hours. You're someone who shows up."
 */

// Service
export { CompanionService, getCompanionService, resetCompanionService } from './service';
export {
  getCompanion, feedCompanion, petCompanion, levelUpCompanion,
  processSessionEvent, getCompanionBonuses, canUseSpecialAbility, useSpecialAbility,
} from './service';

// Bond system
export {
  loadBond, recordSessionBond, recordStreakBond, recordEvolutionBond,
  getBondLabel, getBondBonus, getTrustLabel,
} from './bond';
export type { BondState, CompanionMemory, MemoryType } from './bond';

// Recovery system
export {
  generateRecoveryResponse, detectBurnout, detectComebackOpportunity, emitRecoveryEvent,
} from './recovery';
export type { RecoveryScenario, RecoveryResponse, RecoveryBonus } from './recovery';

// Identity system
export {
  loadIdentity, recordSessionIdentity, recordStreakIdentity,
  getIdentityLabel, getIdentitySummary,
} from './identity';
export type { IdentityProfile, IdentityLevel, IdentityReflection } from './identity';

// Growth
export { CompanionGrowthService } from './growth-service';

// Types
export type {
  CompanionState, CompanionPhase, CompanionMood, CompanionElement,
  CompanionSessionEvent, CompanionVisualConfig,
} from './types';
export { EVOLUTION_THRESHOLDS, MOOD_RULES, ELEMENT_THEMES } from './types';

// Events
export { emitCompanionStateChanged, emitCompanionEvolution, emitCompanionMilestone } from './events';
