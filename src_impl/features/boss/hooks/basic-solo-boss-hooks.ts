/**
 * Basic Solo Boss Hooks
 * 
 * React hooks for the simplified boss system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import * as service from '../basic-solo-boss-service';
import type { BossEncounterSummary, BossDamageResult } from '../schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const bossKeys = {
  all: ['boss'] as const,
  basicEncounter: (userId: string) => ['boss', 'basic-encounter', userId] as const,
  status: (userId: string) => ['boss', 'status', userId] as const,
};

// ============================================================================
// Basic Solo Boss Encounter Hook
// ============================================================================

export function useBasicSoloBossEncounter() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: bossKeys.basicEncounter(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) return null;
      return service.getOrCreateBasicSoloBossEncounter(userId);
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Boss Status Hook
// ============================================================================

export function useBasicSoloBossStatus() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: bossKeys.status(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return service.getBasicSoloBossStatus(userId);
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// Damage Application Hook
// ============================================================================

export function useApplyBasicSoloBossDamage() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation({
    mutationFn: ({
      encounterId,
      sessionId,
      damage,
    }: {
      encounterId: string;
      sessionId: string;
      damage: number;
    }) => {
      return service.applyBasicSoloBossDamage(encounterId, sessionId, damage);
    },
    onSuccess: (result, variables) => {
      // Invalidate boss encounter queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bossKeys.basicEncounter(userId) });
        queryClient.invalidateQueries({ queryKey: bossKeys.status(userId) });
      }

      // Emit session completion event with boss damage
      if (result.isDefeated) {
        queryClient.invalidateQueries({ queryKey: ['progression', userId] });
        queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
      }
    },
    onError: (error) => {
      console.error('Failed to apply boss damage:', error);
    },
  });
}

// ============================================================================
// Combined Boss Hook for Home Screen
// ============================================================================

export function useBasicSoloBoss() {
  const encounterQuery = useBasicSoloBossEncounter();
  const statusQuery = useBasicSoloBossStatus();
  const damageMutation = useApplyBasicSoloBossDamage();

  const isLoading = encounterQuery.isLoading || statusQuery.isLoading;
  const error = encounterQuery.error || statusQuery.error;
  const encounter = encounterQuery.data;
  const status = statusQuery.data;

  const hasActiveBoss = status?.hasActiveEncounter ?? false;
  const canStartBoss = status?.canStartNewEncounter ?? false;
  const bossHealthPercent = encounter?.percentHealthRemaining ?? 100;
  const bossTimeRemaining = encounter?.timeRemaining ?? 0;

  return {
    encounter,
    status,
    isLoading,
    error,
    hasActiveBoss,
    canStartBoss,
    bossHealthPercent,
    bossTimeRemaining,
    applyDamage: damageMutation.mutate,
    isApplyingDamage: damageMutation.isPending,
  };
}