/**
 * Session Boss Integration
 * Integrates session completion with basic solo boss damage.
 */

import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import { useAuthStore } from '../../store';
import {
  useBasicSoloBossEncounter,
  useApplyBasicSoloBossDamage,
} from './hooks/basic-solo-boss-hooks';
import { calculateBasicSoloBossDamage } from './basic-solo-boss-calculator';
import { useStreak } from '../streaks/hooks';
import { trackBossError } from './analytics';

export function useSessionBossIntegration() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const encounterQuery = useBasicSoloBossEncounter();
  const damageMutation = useApplyBasicSoloBossDamage();
  const { data: streakState } = useStreak(userId);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('session:completed', async (event) => {
      const { sessionId, duration, quality, userId: eventUserId } = event;

      void eventUserId;

      if (!encounterQuery.data || encounterQuery.data.status !== 'ACTIVE') {
        return;
      }

      try {
        const damage = calculateBasicSoloBossDamage({
          sessionDurationMinutes: Math.floor(duration / 60),
          sessionQuality: quality ?? 0,
          streakDays: streakState?.currentDays ?? 0,
        });

        Sentry.addBreadcrumb({
          category: 'boss',
          message: 'Applying damage from session completion',
          data: { sessionId, damage, userId: userId ?? '' },
          level: 'info',
        });

        await damageMutation.mutateAsync({
          encounterId: encounterQuery.data.id,
          sessionId,
          damage,
        });
      } catch (error) {
        trackBossError('sessionBossIntegration', error, userId ?? '');
      }
    });

    return unsubscribe;
  }, [encounterQuery.data, damageMutation, streakState, userId]);
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
