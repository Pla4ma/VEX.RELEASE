/**
 * Battle Pass Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '../service';
import * as repository from '../repository';
import type {
  AddBattlePassXpInput,
  ClaimTierInput,
  PurchasePremiumInput,
} from '../schemas';

export const battlePassKeys = {
  all: ['battle-pass'] as const,
  bySeason: (seasonId: string) => [...battlePassKeys.all, seasonId] as const,
  userProgress: (userId: string, seasonId: string) =>
    [...battlePassKeys.bySeason(seasonId), 'progress', userId] as const,
  userSummary: (userId: string, seasonId: string) =>
    [...battlePassKeys.bySeason(seasonId), 'summary', userId] as const,
  display: (userId: string, seasonId: string) =>
    [...battlePassKeys.bySeason(seasonId), 'display', userId] as const,
  tiers: (seasonId: string) => [...battlePassKeys.bySeason(seasonId), 'tiers'] as const,
};

export function useBattlePassBySeason(seasonId: string) {
  return useQuery({
    queryKey: battlePassKeys.bySeason(seasonId),
    queryFn: () => repository.fetchBattlePassBySeason(seasonId),
    enabled: Boolean(seasonId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBattlePassTiers(seasonId: string) {
  return useQuery({
    queryKey: battlePassKeys.tiers(seasonId),
    queryFn: () => repository.fetchBattlePassTiers(seasonId),
    enabled: Boolean(seasonId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserBattlePass(userId: string, seasonId: string) {
  return useQuery({
    queryKey: battlePassKeys.userProgress(userId, seasonId),
    queryFn: () => service.getOrCreateUserBattlePass(userId, seasonId),
    enabled: Boolean(userId) && Boolean(seasonId),
    staleTime: 1000 * 30,
  });
}

export function useUserBattlePassSummary(userId: string, seasonId: string) {
  return useQuery({
    queryKey: battlePassKeys.userSummary(userId, seasonId),
    queryFn: () => service.getUserBattlePassSummary(userId, seasonId),
    enabled: Boolean(userId) && Boolean(seasonId),
    staleTime: 1000 * 30,
  });
}

export function useBattlePassDisplay(userId: string, seasonId: string) {
  return useQuery({
    queryKey: battlePassKeys.display(userId, seasonId),
    queryFn: () => service.getBattlePassDisplay(userId, seasonId),
    enabled: Boolean(userId) && Boolean(seasonId),
    staleTime: 1000 * 30,
  });
}

export function useAddBattlePassXp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddBattlePassXpInput) => service.addBattlePassXp(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userProgress(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userSummary(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.display(variables.userId, variables.seasonId),
      });
    },
  });
}

export function useClaimTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ClaimTierInput) => service.claimTier(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userProgress(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userSummary(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.display(variables.userId, variables.seasonId),
      });
    },
  });
}

export function usePurchasePremium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PurchasePremiumInput) => service.purchasePremium(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userProgress(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userSummary(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.display(variables.userId, variables.seasonId),
      });
    },
  });
}

export function useClaimAllTiers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, seasonId }: { userId: string; seasonId: string }) =>
      service.claimAllAvailable(userId, seasonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userProgress(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.userSummary(variables.userId, variables.seasonId),
      });
      queryClient.invalidateQueries({
        queryKey: battlePassKeys.display(variables.userId, variables.seasonId),
      });
    },
  });
}
