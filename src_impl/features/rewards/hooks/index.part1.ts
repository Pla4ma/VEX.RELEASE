import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";
import * as service from "../service";
import * as repository from "../repository";
import { getRewardLedger, getTodayRewardSummary, type RewardLedgerEntry } from "../ledger-service";
import { CreateRewardInputSchema, ClaimRewardInputSchema, CalculateRewardInputSchema, type CreateRewardInput, type ClaimRewardInput, type CalculateRewardInput, type RewardCalculation, type Reward } from "../schemas";
import { fetchDailyRewardsState, saveDailyRewardClaim, type UserDailyRewardsState } from "../repository/daily";
import { eventBus } from "../../../events";
import { trackDailyLoginClaimed } from "../analytics";


export const rewardKeys = {
  all: ['rewards'] as const,
  byUser: (userId: string) => [...rewardKeys.all, 'user', userId] as const,
  pending: (userId: string) => [...rewardKeys.byUser(userId), 'pending'] as const,
  history: (userId: string) => [...rewardKeys.byUser(userId), 'history'] as const,
  stats: (userId: string) => [...rewardKeys.byUser(userId), 'stats'] as const,
  byId: (rewardId: string) => [...rewardKeys.all, 'id', rewardId] as const,
};

export function usePendingRewards(userId: string | null) {
  return useQuery({
    queryKey: rewardKeys.pending(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getPendingRewards(userId);
    },
    enabled: !!userId,
    refetchInterval: 1000 * 60, // Refetch every minute for pending rewards
  });
}

export function useRewardHistory(userId: string | null, limit?: number) {
  return useQuery({
    queryKey: rewardKeys.history(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getRewardHistory(userId, limit);
    },
    enabled: !!userId,
  });
}

export function useRewardStats(userId: string | null) {
  return useQuery({
    queryKey: rewardKeys.stats(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getRewardStats(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useReward(rewardId: string | null) {
  return useQuery({
    queryKey: rewardKeys.byId(rewardId || ''),
    queryFn: () => {
      if (!rewardId) {
        throw new Error('Reward ID required');
      }
      return repository.fetchReward(rewardId);
    },
    enabled: !!rewardId,
  });
}

export function useRewards(userId: string) {
  const pendingQuery = usePendingRewards(userId);
  const claimReward = useClaimReward();

  const chests: VaultChest[] = (pendingQuery.data ?? []).map(
    (reward): VaultChest => ({
      id: reward.id,
      tier: reward.type === 'GEMS' ? 'GOLD' : reward.type === 'ITEM' ? 'SILVER' : 'WOOD',
      obtainedAt: reward.createdAt,
      source: reward.triggerType === 'BOSS_DEFEAT' ? 'BOSS' : reward.triggerType === 'DAILY_LOGIN' ? 'DAILY' : reward.triggerType === 'ACHIEVEMENT_UNLOCK' ? 'ACHIEVEMENT' : 'SESSION',
      isOpened: reward.status !== 'PENDING',
    }),
  );

  return {
    chests,
    isLoading: pendingQuery.isLoading,
    openChest: (rewardId: string): Promise<unknown> => claimReward.mutateAsync({ rewardId, userId }),
  };
}

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation<Reward, Error, CreateRewardInput>({
    mutationFn: async (input) => {
      const validated = CreateRewardInputSchema.parse(input);
      return service.createReward(validated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: rewardKeys.byUser(variables.userId),
      });
    },
  });
}

export function useClaimReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ClaimRewardInput) => {
      const validated = ClaimRewardInputSchema.parse(input);
      return service.claimReward(validated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: rewardKeys.byUser(variables.userId),
      });
    },
  });
}

export function useRewardCalculator() {
  return {
    calculate: (input: CalculateRewardInput): RewardCalculation => {
      const validated = CalculateRewardInputSchema.parse(input);
      return service.calculateReward(validated);
    },
  };
}

export function useClaimAllRewards() {
  const queryClient = useQueryClient();
  const claimMutation = useClaimReward();

  return useMutation({
    mutationFn: async (userId: string) => {
      const pending = await service.getPendingRewards(userId);
      const results = await Promise.all(
        pending.map((reward) =>
          claimMutation
            .mutateAsync({
              rewardId: reward.id,
              userId,
            })
            .catch((error) => ({
              success: false,
              rewardId: reward.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            })),
        ),
      );
      return results;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: rewardKeys.byUser(userId),
      });
    },
  });
}

export function useRewardLedger(userId: string) {
  return useInfiniteQuery<RewardLedgerEntry[], Error, { pages: RewardLedgerEntry[][]; pageParams: number[] }, (string | number)[], number>({
    queryKey: ['rewards', 'ledger', userId],
    queryFn: ({ pageParam = 0 }) => getRewardLedger(userId, { limit: 20, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: RewardLedgerEntry[], pages: RewardLedgerEntry[][]) => (lastPage.length === 20 ? pages.length * 20 : undefined),
    enabled: !!userId,
    staleTime: 60_000,
  });
}