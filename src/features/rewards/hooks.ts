/**
 * Rewards Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { z } from 'zod';
import * as service from './service';
import * as repository from './repository';
import { getRewardLedger, getTodayRewardSummary, type RewardLedgerEntry } from './ledger-service';
import {
  CreateRewardInputSchema,
  ClaimRewardInputSchema,
  CalculateRewardInputSchema,
  type CreateRewardInput,
  type ClaimRewardInput,
  type CalculateRewardInput,
  type RewardCalculation,
  type Reward,
} from './schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const rewardKeys = {
  all: ['rewards'] as const,
  byUser: (userId: string) => [...rewardKeys.all, 'user', userId] as const,
  pending: (userId: string) => [...rewardKeys.byUser(userId), 'pending'] as const,
  history: (userId: string) => [...rewardKeys.byUser(userId), 'history'] as const,
  stats: (userId: string) => [...rewardKeys.byUser(userId), 'stats'] as const,
  byId: (rewardId: string) => [...rewardKeys.all, 'id', rewardId] as const,
};

// ============================================================================
// Read Hooks
// ============================================================================

export function usePendingRewards(userId: string | null) {
  return useQuery({
    queryKey: rewardKeys.pending(userId || ''),
    queryFn: () => {
      if (!userId) {throw new Error('User ID required');}
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
      if (!userId) {throw new Error('User ID required');}
      return service.getRewardHistory(userId, limit);
    },
    enabled: !!userId,
  });
}

export function useRewardStats(userId: string | null) {
  return useQuery({
    queryKey: rewardKeys.stats(userId || ''),
    queryFn: () => {
      if (!userId) {throw new Error('User ID required');}
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
      if (!rewardId) {throw new Error('Reward ID required');}
      return repository.fetchReward(rewardId);
    },
    enabled: !!rewardId,
  });
}

type VaultChest = {
  id: string;
  tier: 'WOOD' | 'SILVER' | 'GOLD' | 'LEGENDARY';
  obtainedAt: number;
  source: 'SESSION' | 'BOSS' | 'DAILY' | 'ACHIEVEMENT';
  isOpened: boolean;
};

export function useRewards(userId: string) {
  const pendingQuery = usePendingRewards(userId);
  const claimReward = useClaimReward();

  const chests: VaultChest[] = (pendingQuery.data ?? []).map((reward): VaultChest => ({
    id: reward.id,
    tier: reward.type === 'GEMS' ? 'GOLD' : reward.type === 'ITEM' ? 'SILVER' : 'WOOD',
    obtainedAt: reward.createdAt,
    source: reward.triggerType === 'BOSS_DEFEAT'
      ? 'BOSS'
      : reward.triggerType === 'DAILY_LOGIN'
        ? 'DAILY'
        : reward.triggerType === 'ACHIEVEMENT_UNLOCK'
          ? 'ACHIEVEMENT'
          : 'SESSION',
    isOpened: reward.status !== 'PENDING',
  }));

  return {
    chests,
    isLoading: pendingQuery.isLoading,
    openChest: (rewardId: string): Promise<unknown> => claimReward.mutateAsync({ rewardId, userId }),
  };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

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

// ============================================================================
// Calculator Hook
// ============================================================================

export function useRewardCalculator() {
  return {
    calculate: (input: CalculateRewardInput): RewardCalculation => {
      const validated = CalculateRewardInputSchema.parse(input);
      return service.calculateReward(validated);
    },
  };
}

// ============================================================================
// Batch Claim Hook
// ============================================================================

export function useClaimAllRewards() {
  const queryClient = useQueryClient();
  const claimMutation = useClaimReward();

  return useMutation({
    mutationFn: async (userId: string) => {
      const pending = await service.getPendingRewards(userId);
      const results = await Promise.all(
        pending.map(reward =>
          claimMutation.mutateAsync({
            rewardId: reward.id,
            userId,
          }).catch(error => ({
            success: false,
            rewardId: reward.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          }))
        )
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

// ============================================================================
// Ledger Hooks
// ============================================================================

export function useRewardLedger(userId: string) {
  return useInfiniteQuery<RewardLedgerEntry[], Error, { pages: RewardLedgerEntry[][]; pageParams: number[] }, (string | number)[], number>({
    queryKey: ['rewards', 'ledger', userId],
    queryFn: ({ pageParam = 0 }) => getRewardLedger(userId, { limit: 20, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: RewardLedgerEntry[], pages: RewardLedgerEntry[][]) =>
      lastPage.length === 20 ? pages.length * 20 : undefined,
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useTodayRewardSummary(userId: string) {
  return useQuery({
    queryKey: ['rewards', 'today-summary', userId],
    queryFn: () => getTodayRewardSummary(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

// ============================================================================
// Daily Login Hook
// ============================================================================

import { fetchDailyRewardsState, saveDailyRewardClaim, type UserDailyRewardsState } from './repository-daily';
import { eventBus } from '../../events';
import { trackDailyLoginClaimed } from './analytics';

const dailyLoginKeys = {
  all: ['daily-login'] as const,
  byUser: (userId: string) => [...dailyLoginKeys.all, 'user', userId] as const,
};

export interface DailyLoginReward {
  dayNumber: number;
  type: 'COINS' | 'GEMS' | 'XP_BOOST' | 'STREAK_SHIELD' | 'CHEST';
  amount: number;
  label: string;
  icon: string;
}

export function useDailyLoginReward(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dailyLoginKeys.byUser(userId || ''),
    queryFn: async (): Promise<UserDailyRewardsState | null> => {
      if (!userId) {return null;}
      const { data, error } = await fetchDailyRewardsState(userId);
      if (error) {throw error;}
      return data;
    },
    enabled: !!userId,
    staleTime: 60_000, // 1 minute - reward status changes slowly
  });

  const claimMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!userId || !query.data) {throw new Error('User ID required');}

      const dayNumber = query.data.last_claimed_day + 1;
      if (dayNumber > 7) {dayNumber === 1;}

      // Determine reward based on day
      const rewardMap: Record<number, { type: 'COINS' | 'GEMS' | 'XP_BOOST' | 'STREAK_SHIELD' | 'CHEST'; amount: number }> = {
        1: { type: 'COINS', amount: 100 },
        2: { type: 'COINS', amount: 200 },
        3: { type: 'GEMS', amount: 10 },
        4: { type: 'COINS', amount: 300 },
        5: { type: 'XP_BOOST', amount: 1 },
        6: { type: 'GEMS', amount: 25 },
        7: { type: 'CHEST', amount: 1 },
      };

      const reward = rewardMap[dayNumber];

      const claim = {
        id: crypto.randomUUID(),
        user_id: userId,
        day: dayNumber,
        tier: `DAY_${dayNumber}` as const,
        items: [{ type: reward.type, amount: reward.amount }],
        is_premium: false,
        claimed_at: Date.now(),
        streak_at_claim: query.data.current_streak + 1,
      };

      const { error } = await saveDailyRewardClaim(claim as any);
      if (error) {throw error;}

      // Track analytics
      trackDailyLoginClaimed(userId, dayNumber, reward.type, reward.amount, query.data.current_streak + 1);

      // Emit event for integration
      (eventBus as any).publish('rewards:daily_login_claimed', {
        userId,
        dayNumber,
        reward: { type: reward.type, amount: reward.amount },
        timestamp: Date.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLoginKeys.byUser(userId || '') });
    },
  });

  const canClaim = query.data?.can_claim_today ?? false;
  const dayNumber = query.data?.last_claimed_day ?? 0;

  // Build current reward
  const nextDay = dayNumber >= 7 ? 1 : dayNumber + 1;
  const rewardMap: Record<number, { type: 'COINS' | 'GEMS' | 'XP_BOOST' | 'STREAK_SHIELD' | 'CHEST'; amount: number; label: string; icon: string }> = {
    1: { type: 'COINS', amount: 100, label: '100 Coins', icon: '🪙' },
    2: { type: 'COINS', amount: 200, label: '200 Coins', icon: '🪙' },
    3: { type: 'GEMS', amount: 10, label: '10 Gems', icon: '💎' },
    4: { type: 'COINS', amount: 300, label: '300 Coins', icon: '🪙' },
    5: { type: 'XP_BOOST', amount: 1, label: 'XP Boost', icon: '⚡' },
    6: { type: 'GEMS', amount: 25, label: '25 Gems', icon: '💎' },
    7: { type: 'CHEST', amount: 1, label: 'Premium Chest', icon: '🎁' },
  };

  const currentReward: DailyLoginReward | null = canClaim ? {
    dayNumber: nextDay,
    ...rewardMap[nextDay],
  } : null;

  return {
    canClaim,
    reward: currentReward,
    dayNumber: nextDay,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    claim: claimMutation.mutateAsync,
    isClaiming: claimMutation.isPending,
    claimError: claimMutation.error,
    refetch: query.refetch,
  };
}
