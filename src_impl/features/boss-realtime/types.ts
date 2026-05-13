/**
 * Real-time Boss Combat System
 *
 * Transforms boss battles from post-session math into visceral,
 * real-time combat that unfolds DURING the focus session.
 *
 * Users SEE their focus translating to damage in real-time.
 * Near-death moments, critical hits, and victory happen IMMEDIATELY.
 */

export type BossCombatState =
  | 'ENCOUNTER_START'
  | 'COMBAT_ACTIVE'
  | 'BOSS_RAGE' // Boss becomes more dangerous below 25%
  | 'NEAR_DEATH' // Boss below 10%
  | 'VICTORY'
  | 'TIMEOUT_WARNING'
  | 'DEFEAT';

export type AttackType =
  | 'NORMAL_FOCUS'      // Standard damage per minute
  | 'PURE_STRIKE'       // High purity moment
  | 'CRITICAL_FOCUS'    // Extended perfect focus
  | 'STREAK_COMBO'      // Multiple pure strikes in a row
  | 'FINISHING_BLOW';   // Final hit

export interface RealTimeBossEncounter {
  id: string;
  bossId: string;
  userId: string;

  // Boss stats
  bossName: string;
  bossAvatar: string;
  maxHealth: number;
  currentHealth: number;

  // Combat state
  combatState: BossCombatState;

  // Real-time damage tracking
  damageDealtThisSession: number;
  attacksLanded: number;
  criticalHits: number;
  longestCombo: number;
  currentCombo: number;

  // Session linkage
  sessionId: string;
  sessionStartTime: number;
  sessionDuration: number; // expected duration in seconds

  // Time pressure
  timeLimit: number; // seconds to defeat boss
  timeRemaining: number;

  // Visual state (for animations)
  lastAttackTime: number | null;
  lastAttackDamage: number;
  lastAttackType: AttackType | null;
  bossIsFlashing: boolean;
  bossIsShaking: boolean;

  // Rewards (calculated in real-time)
  xpReward: number;
  coinReward: number;
  gemReward: number;

  createdAt: number;
}

export interface CombatEvent {
  type: 'ATTACK_LANDED' | 'COMBO_BONUS' | 'BOSS_RAGE_MODE' | 'NEAR_DEATH' | 'VICTORY' | 'DAMAGE_TAKEN' | 'PHASE_CHANGE';
  timestamp: number;
  data: {
    damage?: number;
    attackType?: AttackType;
    comboCount?: number;
    message?: string;
    healthPercent?: number;
    intensity?: number; // 0-1 for visual effect
    soundEffect?: string;
  };
}

export interface DamageCalculation {
  baseDamage: number;
  purityMultiplier: number;
  comboMultiplier: number;
  streakMultiplier: number;
  criticalChance: number;
  isCritical: boolean;
  totalDamage: number;
}

// Boss rage mode threshold
// Attack thresholds
// Damage formulas
export * from "./types.part1";
