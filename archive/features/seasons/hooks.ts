/**
 * Seasons Feature - TanStack Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';

import * as repository from './repository';
import * as service from './service';
import { useRevenueCat, type PurchasesPackageDisplayInfo } from '../../shared/monetization';
import type {
  CreateSeasonInput,
  UpdateSeasonInput,
  PurchasePremiumInput,
} from './schemas';

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWO_MINUTES_MS = 2 * 60 * 1000;

export const seasonKeys = {
  all: ['seasons'] as const,
  active: () => [...seasonKeys.all, 'active'] as const,
  byId: (id: string) => [...seasonKeys.all, id] as const,
  summary: (id: string) => [...seasonKeys.all, id, 'summary'] as const,
  userProgress: (userId: string) => [...seasonKeys.all, 'progress', userId] as const,
  history: (userId: string) => [...seasonKeys.all, 'history', userId] as const,
  leaderboard: (seasonId: string) => [...seasonKeys.all, seasonId, 'leaderboard'] as const,
};

export function useActiveSeason() {
  return useQuery({
    queryKey: seasonKeys.active(),
    queryFn: () => service.getActiveSeason(),
    staleTime: ONE_HOUR_MS,
  });
}

export function useUpcomingSeasons() {
  return useQuery({
    queryKey: [...seasonKeys.all, 'upcoming'],
    queryFn: () => service.getUpcomingSeasons(),
    staleTime: ONE_HOUR_MS,
  });
}

export function useSeason(seasonId: string) {
  return useQuery({
    queryKey: seasonKeys.byId(seasonId),
    queryFn: () => service.getSeasonById(seasonId),
    enabled: Boolean(seasonId),
    staleTime: ONE_HOUR_MS,
  });
}

export function useSeasonSummary(seasonId: string) {
  return useQuery({
    queryKey: seasonKeys.summary(seasonId),
    queryFn: () => service.getSeasonSummary(seasonId),
    enabled: Boolean(seasonId),
    staleTime: TWO_MINUTES_MS,
  });
}

export function useUserSeasonProgress(userId: string) {
  return useQuery({
    queryKey: seasonKeys.userProgress(userId),
    queryFn: () => service.getUserSeasonProgress(userId),
    enabled: Boolean(userId),
    staleTime: TWO_MINUTES_MS,
    refetchOnWindowFocus: true,
  });
}

export function useUserSeasonHistory(userId: string) {
  return useQuery({
    queryKey: seasonKeys.history(userId),
    queryFn: () => repository.fetchUserSeasonHistory(userId),
    enabled: Boolean(userId),
    staleTime: ONE_HOUR_MS,
  });
}

export function useSeasonLeaderboard(seasonId: string, limit = 100) {
  return useQuery({
    queryKey: seasonKeys.leaderboard(seasonId),
    queryFn: () => repository.fetchSeasonLeaderboard(seasonId, limit),
    enabled: Boolean(seasonId),
    staleTime: TWO_MINUTES_MS,
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSeasonInput) => service.createSeason(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: seasonKeys.all });
    },
  });
}

export function useUpdateSeason(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSeasonInput) => service.updateSeason(seasonId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: seasonKeys.byId(seasonId) });
      void queryClient.invalidateQueries({ queryKey: seasonKeys.active() });
    },
  });
}

export function useAdvanceTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof service.advanceTier>[0]) => service.advanceTier(input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: seasonKeys.userProgress(variables.userId),
      });
    },
  });
}

export function usePurchasePremium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PurchasePremiumInput) => service.purchasePremium(input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: seasonKeys.userProgress(variables.userId),
      });
    },
  });
}

export function useClaimSeasonTierReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; tier: number; isPremium: boolean }) =>
      service.claimTierReward(input.userId, input.tier, input.isPremium),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: seasonKeys.userProgress(variables.userId),
      });
    },
  });
}

export function useClaimTierReward() {
  return useClaimSeasonTierReward();
}

export function useUpgradeToBattlePassPremium() {
  const queryClient = useQueryClient();
  const { purchasePackage } = useRevenueCat();

  return useMutation({
    mutationFn: async (input: { userId: string; packageInfo: PurchasesPackageDisplayInfo }) => {
      try {
        const purchaseResult = await purchasePackage(input.packageInfo);
        if (!purchaseResult.success) {
          throw new Error(purchaseResult.error?.message ?? 'Battle Pass premium purchase failed');
        }

        return service.upgradeToPremiumPass(input.userId);
      } catch (error) {
        Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          tags: { feature: 'seasons', operation: 'useUpgradeToBattlePassPremium' },
          extra: { userId: input.userId, packageId: input.packageInfo.identifier },
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: seasonKeys.userProgress(variables.userId),
      });
      void queryClient.invalidateQueries({ queryKey: seasonKeys.active() });
    },
  });
}
