/**
 * Basic Solo Boss Hooks
 * React hooks for the simplified boss system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import * as service from '../basic-solo-boss-service';
import { trackBossError } from '../analytics';

export const bossKeys = {
  all: ['boss'] as const,
  basicEncounter: (userId: string) => ['boss', 'basic-encounter', userId] as const,
  status: (userId: string) => ['boss', 'status', userId] as const,
};

export function useBasicSoloBossEncounter() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  return useQuery({
    queryKey: bossKeys.basicEncounter(userId ?? 'no-user'),
    queryFn: () => userId ? service.getOrCreateBasicSoloBossEncounter(userId) : null,
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useBasicSoloBossStatus() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  return useQuery({
    queryKey: bossKeys.status(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return service.getBasicSoloBossStatus(userId);
    },
    enabled: !!userId,
    staleTime: 60000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useApplyBasicSoloBossDamage() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  return useMutation({
    mutationFn: ({
      encounterId, sessionId, damage,
    }: {
      encounterId: string; sessionId: string; damage: number;
    }) => service.applyBasicSoloBossDamage(encounterId, sessionId, damage),
    onSuccess: (result) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bossKeys.basicEncounter(userId) });
        queryClient.invalidateQueries({ queryKey: bossKeys.status(userId) });
        if (result.isDefeated) {
          queryClient.invalidateQueries({ queryKey: ['progression', userId] });
          queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
        }
      }
    },
    onError: (error) => {
      trackBossError('applyBasicSoloBossDamage', error, userId ?? undefined);
    },
  });
}

export function useBasicSoloBoss() {
  const encounterQuery = useBasicSoloBossEncounter();
  const statusQuery = useBasicSoloBossStatus();
  const damageMutation = useApplyBasicSoloBossDamage();
  const encounter = encounterQuery.data;
  const status = statusQuery.data;

  return {
    encounter,
    status,
    isLoading: encounterQuery.isLoading || statusQuery.isLoading,
    error: encounterQuery.error || statusQuery.error,
    hasActiveBoss: status?.hasActiveEncounter ?? false,
    canStartBoss: status?.canStartNewEncounter ?? false,
    bossHealthPercent: encounter?.percentHealthRemaining ?? 100,
    bossTimeRemaining: encounter?.timeRemaining ?? 0,
    applyDamage: damageMutation.mutate,
    isApplyingDamage: damageMutation.isPending,
  };
}
