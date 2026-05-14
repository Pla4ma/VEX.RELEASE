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
export const BOSS_RAGE_THRESHOLD = 0.25; // 25% health
export const BOSS_NEAR_DEATH_THRESHOLD = 0.10; // 10% health

// Attack thresholds
export const PURE_STRIKE_THRESHOLD = 90; // purity score
export const CRITICAL_FOCUS_DURATION = 120; // 2 minutes of pure focus
export const COMBO_THRESHOLD = 3; // pure strikes in a row

// Damage formulas
export function calculateBaseDamage(sessionDurationMinutes: number): number {
  // Longer sessions = more damage, but with diminishing returns
  return Math.floor(10 + Math.sqrt(sessionDurationMinutes) * 5);
}

export function calculatePurityMultiplier(purityScore: number): number {
  if (purityScore >= 95) {return 2.0;} // Double damage for near-perfect
  if (purityScore >= 80) {return 1.5;}
  if (purityScore >= 60) {return 1.0;}
  if (purityScore >= 40) {return 0.7;}
  return 0.5; // Distracted = weak damage
}

export function calculateComboMultiplier(comboCount: number): number {
  // Each combo hit adds 10% damage, max 3x
  return Math.min(3, 1 + comboCount * 0.1);
}

export function determineAttackType(
  purityScore: number,
  comboCount: number,
  pureFocusDuration: number,
  bossHealthPercent: number
): AttackType {
  if (bossHealthPercent < 0.05 && purityScore > 80) {
    return 'FINISHING_BLOW';
  }
  if (comboCount >= COMBO_THRESHOLD) {
    return 'STREAK_COMBO';
  }
  if (pureFocusDuration >= CRITICAL_FOCUS_DURATION && purityScore > 85) {
    return 'CRITICAL_FOCUS';
  }
  if (purityScore >= PURE_STRIKE_THRESHOLD) {
    return 'PURE_STRIKE';
  }
  return 'NORMAL_FOCUS';
}

export function getAttackVisuals(type: AttackType): {
  color: string;
  size: number;
  shakeIntensity: number;
  particleCount: number;
  message: string;
} {
  switch (type) {
    case 'FINISHING_BLOW':
      return {
        color: '#FF0000',
        size: 3,
        shakeIntensity: 1,
        particleCount: 50,
        message: 'FINISHING BLOW!',
      };
    case 'STREAK_COMBO':
      return {
        color: '#FFD700',
        size: 2.5,
        shakeIntensity: 0.7,
        particleCount: 30,
        message: 'COMBO BREAKER!',
      };
    case 'CRITICAL_FOCUS':
      return {
        color: '#FF6B35',
        size: 2,
        shakeIntensity: 0.5,
        particleCount: 20,
        message: 'CRITICAL HIT!',
      };
    case 'PURE_STRIKE':
      return {
        color: '#00CED1',
        size: 1.5,
        shakeIntensity: 0.3,
        particleCount: 15,
        message: 'PURE STRIKE!',
      };
    default:
      return {
        color: '#FFFFFF',
        size: 1,
        shakeIntensity: 0.1,
        particleCount: 5,
        message: '',
      };
  }
}
