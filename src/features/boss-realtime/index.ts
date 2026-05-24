/**
 * Real-time Boss Combat System - Barrel Export
 *
 * Transforms boss battles from post-session math into visceral,
 * real-time combat that unfolds DURING the focus session.
 */

export { RealTimeBossService, createBossEncounter } from './service';
export { RealTimeBossCombat } from './components/RealTimeBossCombat';
export type {
  RealTimeBossEncounter,
  CombatEvent,
  BossCombatState,
  AttackType,
  DamageCalculation,
} from './types';
export {
  BOSS_RAGE_THRESHOLD,
  BOSS_NEAR_DEATH_THRESHOLD,
  calculateBaseDamage,
  calculatePurityMultiplier,
  calculateComboMultiplier,
  determineAttackType,
  getAttackVisuals,
} from './types';
