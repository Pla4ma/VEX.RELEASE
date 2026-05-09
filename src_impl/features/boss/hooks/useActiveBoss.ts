/**
 * useActiveBoss Hook
 *
 * Returns current boss encounter state with damage calculations.
 * Links session duration to boss damage.
 *
 * @phase 3.7
 */

import { useMemo, useCallback } from 'react';
import { useActiveBoss as useActiveBossBase } from '../hooks';

export interface DamageCalculation {
  /** Base damage from session duration */
  baseDamage: number;
  /** Multiplier from purity score */
  purityMultiplier: number;
  /** Multiplier from streak */
  streakMultiplier: number;
  /** Final damage after all multipliers */
  totalDamage: number;
  /** Damage per minute of focus time */
  damagePerMinute: number;
}

export interface KillEstimate {
  /** Whether this session will defeat the boss */
  willDefeat: boolean;
  /** Sessions needed to defeat at current rate */
  sessionsRemaining: number;
  /** Minutes of focus needed at current rate */
  minutesRemaining: number;
  /** Percentage of boss HP this session deals */
  percentDamage: number;
}

export interface ActiveBossState {
  /** Current boss encounter data */
  encounter: {
    id: string;
    bossId: string;
    bossName: string;
    bossAvatarUrl: string | null;
    healthRemaining: number;
    maxHealth: number;
    percentHealthRemaining: number;
    tier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  } | null;
  /** Damage calculation for current session */
  damageThisSession: DamageCalculation;
  /** Kill estimate based on current session */
  estimatedKill: KillEstimate;
  /** Current combat state */
  combatState: 'ENCOUNTER_START' | 'COMBAT_ACTIVE' | 'BOSS_RAGE' | 'NEAR_DEATH' | 'VICTORY';
  /** Whether damage flash should show */
  showDamageFlash: boolean;
  /** Recent damage dealt (for flash animation) */
  recentDamage: number;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Actions */
  actions: {
    /** Calculate damage for elapsed session time */
    calculateDamage: (elapsedMinutes: number, purityScore: number) => DamageCalculation;
    /** Mark damage flash as shown */
    clearDamageFlash: () => void;
    /** Refresh boss data */
    refresh: () => void;
  };
}

/**
 * Calculate base damage from session duration
 * Longer sessions = more damage (with diminishing returns)
 */
function calculateBaseDamage(minutes: number): number {
  // Linear growth with small bonus for longer sessions
  // 15 min = 100 damage, 30 min = 220 damage, 60 min = 480 damage
  const baseRate = 6.67; // ~100 damage per 15 min
  const bonus = Math.max(0, (minutes - 15) * 0.5); // Small bonus for 15+ min
  return Math.floor(minutes * baseRate + bonus);
}

/**
 * Calculate purity multiplier (0.5x to 2x)
 */
function calculatePurityMultiplier(purityScore: number): number {
  // Purity 0-100 maps to 0.5x-2x multiplier
  const minMultiplier = 0.5;
  const maxMultiplier = 2.0;
  return minMultiplier + (purityScore / 100) * (maxMultiplier - minMultiplier);
}

/**
 * Hook for active boss encounter with damage calculations
 *
 * @example
 * const { encounter, damageThisSession, estimatedKill, combatState } = useActiveBoss(userId, sessionId);
 *
 * if (estimatedKill.willDefeat) {
 *   showImminentVictory();
 * }
 */
export function useActiveBoss(
  userId: string | null,
  sessionId: string | null,
  sessionMetrics?: {
    elapsedMinutes: number;
    purityScore: number;
    streakDays: number;
  },
): ActiveBossState {
  const { data: encounter, isLoading, error, refetch } = useActiveBossBase(userId ?? '');

  /**
   * Calculate damage based on session progress
   */
  const calculateDamage = useCallback(
    (elapsedMinutes: number, purityScore: number): DamageCalculation => {
      const baseDamage = calculateBaseDamage(elapsedMinutes);
      const purityMultiplier = calculatePurityMultiplier(purityScore);
      const streakMultiplier = 1 + (sessionMetrics?.streakDays ?? 0) * 0.1; // 10% per streak day

      const totalDamage = Math.floor(baseDamage * purityMultiplier * streakMultiplier);

      return {
        baseDamage,
        purityMultiplier,
        streakMultiplier,
        totalDamage,
        damagePerMinute: totalDamage / Math.max(1, elapsedMinutes),
      };
    },
    [sessionMetrics?.streakDays],
  );

  /**
   * Current session damage calculation
   */
  const damageThisSession = useMemo(() => {
    const elapsedMinutes = sessionMetrics?.elapsedMinutes ?? 0;
    const purityScore = sessionMetrics?.purityScore ?? 80; // Default to good purity
    return calculateDamage(elapsedMinutes, purityScore);
  }, [sessionMetrics, calculateDamage]);

  /**
   * Kill estimate based on current damage rate
   */
  const estimatedKill = useMemo((): KillEstimate => {
    if (!encounter) {
      return {
        willDefeat: false,
        sessionsRemaining: 0,
        minutesRemaining: 0,
        percentDamage: 0,
      };
    }

    const currentDamage = damageThisSession.totalDamage;
    const healthRemaining = encounter.healthRemaining;

    const willDefeat = currentDamage >= healthRemaining;
    const percentDamage = Math.min(100, (currentDamage / encounter.maxHealth) * 100);

    if (willDefeat) {
      return {
        willDefeat: true,
        sessionsRemaining: 1,
        minutesRemaining: sessionMetrics?.elapsedMinutes ?? 0,
        percentDamage,
      };
    }

    // Estimate remaining sessions at current damage rate
    const sessionsRemaining = currentDamage > 0 ? Math.ceil(healthRemaining / currentDamage) : 999;
    const minutesRemaining = sessionsRemaining * (sessionMetrics?.elapsedMinutes ?? 30);

    return {
      willDefeat: false,
      sessionsRemaining,
      minutesRemaining,
      percentDamage,
    };
  }, [encounter, damageThisSession, sessionMetrics?.elapsedMinutes]);

  /**
   * Combat state based on boss health
   */
  const combatState = useMemo((): ActiveBossState['combatState'] => {
    if (!encounter) {
      return 'ENCOUNTER_START';
    }

    const percentHealth = encounter.percentHealthRemaining;

    if (percentHealth <= 0) {
      return 'VICTORY';
    }
    if (percentHealth <= 10) {
      return 'NEAR_DEATH';
    }
    if (percentHealth <= 25) {
      return 'BOSS_RAGE';
    }
    return 'COMBAT_ACTIVE';
  }, [encounter]);

  // Mock flash state - would be triggered by actual damage events
  const showDamageFlash = false;
  const recentDamage = 0;

  return {
    encounter: encounter
      ? {
          id: encounter.id,
          bossId: encounter.bossId,
          bossName: encounter.bossName,
          bossAvatarUrl: encounter.bossAvatarUrl,
          healthRemaining: encounter.healthRemaining,
          maxHealth: encounter.maxHealth,
          percentHealthRemaining: encounter.percentHealthRemaining,
          tier: 'COMMON',
        }
      : null,
    damageThisSession,
    estimatedKill,
    combatState,
    showDamageFlash,
    recentDamage,
    isLoading,
    error: error || null,
    actions: {
      calculateDamage,
      clearDamageFlash: () => {
        // Would clear flash state
      },
      refresh: () => {
        void refetch();
      },
    },
  };
}

export default useActiveBoss;
