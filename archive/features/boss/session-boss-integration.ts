/**
 * Session Boss Integration
 * Pure utilities for boss session data — no auto-subscription.
 * The canonical boss damage path is SessionBossIntegration.ts.
 */

import {
  useBasicSoloBossEncounter,
} from './hooks/basic-solo-boss-hooks';
import { calculateBasicSoloBossDamage } from './basic-solo-boss-calculator';

/**
 * Status-only hook for boss presence in session context.
 * Does NOT subscribe to session:completed — canonical path handles that.
 */
export function useSessionBossIntegration() {
  const encounterQuery = useBasicSoloBossEncounter();
  const encounter = encounterQuery.data;
  const isActive = !!encounter && encounter.status === 'ACTIVE';

  return {
    hasActiveBoss: isActive,
    bossHealthPercent: encounter?.percentHealthRemaining ?? 100,
    bossName: encounter?.bossName ?? 'Focus Guardian',
    timeRemaining: encounter?.timeRemaining ?? 0,
    canDamageBoss: isActive,
    encounter,
  };
}

export function calculateBossDamageFromSession(sessionData: {
  durationSeconds: number;
  qualityScore: number;
  streakDays: number;
}): number {
  return calculateBasicSoloBossDamage({
    sessionDurationMinutes: Math.floor(sessionData.durationSeconds / 60),
    sessionQuality: sessionData.qualityScore,
    streakDays: sessionData.streakDays,
  });
}

export function useBossStatusForSession() {
  const encounterQuery = useBasicSoloBossEncounter();
  const encounter = encounterQuery.data;
  const isActive = !!encounter && encounter.status === 'ACTIVE';

  return {
    hasActiveBoss: isActive,
    bossHealthPercent: encounter?.percentHealthRemaining ?? 100,
    bossName: encounter?.bossName ?? 'Focus Guardian',
    timeRemaining: encounter?.timeRemaining ?? 0,
    canDamageBoss: isActive,
  };
}
