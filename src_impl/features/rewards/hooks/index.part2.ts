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


export function useTodayRewardSummary(userId: string) {
  return useQuery({
    queryKey: ['rewards', 'today-summary', userId],
    queryFn: () => getTodayRewardSummary(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useDailyLoginReward(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dailyLoginKeys.byUser(userId || ''),
    queryFn: async (): Promise<UserDailyRewardsState | null> => {
      if (!userId) {
        return null;
      }
      const { data, error } = await fetchDailyRewardsState(userId);
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!userId,
    staleTime: 60_000, // 1 minute - reward status changes slowly
  });

  const claimMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!userId || !query.data) {
        throw new Error('User ID required');
      }

      const dayNumber = query.data.last_claimed_day + 1;
      if (dayNumber > 7) {
        dayNumber === 1;
      }

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
      if (error) {
        throw error;
      }

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

  const currentReward: DailyLoginReward | null = canClaim
    ? {
        dayNumber: nextDay,
        ...rewardMap[nextDay],
      }
    : null;

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