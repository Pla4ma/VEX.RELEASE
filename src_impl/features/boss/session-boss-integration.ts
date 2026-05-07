/**
 * Session Boss Integration
 * 
 * Integrates session completion with basic solo boss damage.
 * Listens for session completion events and applies boss damage.
 */

import { eventBus } from "../../events";
import { useBasicSoloBossEncounter, useApplyBasicSoloBossDamage } from "../boss/hooks/basic-solo-boss-hooks";
import { calculateBasicSoloBossDamage } from "../boss/basic-solo-boss-service";
import { useSessionSummary } from "../session/hooks";
import { useStreakData } from "../streaks/hooks";
import { useEffect } from "react";

// ============================================================================
// Session to Boss Damage Integration
// ============================================================================

export function useSessionBossIntegration() {
  const encounterQuery = useBasicSoloBossEncounter();
  const damageMutation = useApplyBasicSoloBossDamage();
  const { data: sessionSummary } = useSessionSummary();
  const { data: streakData } = useStreakData();

  useEffect(() => {
    // Listen for session completion events
    const unsubscribe = eventBus.subscribe('session:completed', async (event) => {
      const { sessionId, duration, quality, userId } = event;

      // Only apply damage if there's an active boss encounter
      if (!encounterQuery.data || encounterQuery.data.status !== 'ACTIVE') {
        return;
      }

      try {
        // Calculate damage based on session performance
        const damage = calculateBasicSoloBossDamage({
          sessionDurationMinutes: Math.floor(duration / 60),
          sessionQuality: quality,
          streakDays: streakData?.currentStreak ?? 0,
        });

        // Apply damage to boss
        await damageMutation.mutateAsync({
          encounterId: encounterQuery.data.id,
          sessionId,
          damage,
        });

        console.log(`Applied ${damage} damage to boss from session ${sessionId}`);
      } catch (error) {
        console.error('Failed to apply boss damage from session:', error);
        // Don't throw - boss damage failure shouldn't break session completion
      }
    });

    return unsubscribe;
  }, [encounterQuery.data, damageMutation, sessionSummary, streakData]);
}

// ============================================================================
// Direct Damage Calculation Helper
// ============================================================================

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

// ============================================================================
// Boss Status for Session Setup
// ============================================================================

export function useBossStatusForSession() {
  const encounterQuery = useBasicSoloBossEncounter();

  return {
    hasActiveBoss: !!encounterQuery.data && encounterQuery.data.status === 'ACTIVE',
    bossHealthPercent: encounterQuery.data?.percentHealthRemaining ?? 100,
    bossName: encounterQuery.data?.bossName ?? 'Focus Guardian',
    timeRemaining: encounterQuery.data?.timeRemaining ?? 0,
    canDamageBoss: !!encounterQuery.data && encounterQuery.data.status === 'ACTIVE',
  };
}