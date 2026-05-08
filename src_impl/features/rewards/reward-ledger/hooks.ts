/**
 * Reward Ledger Hooks
 *
 * React hooks for accessing reward ledger data and state.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as queries from './queries';
import * as service from './service';
import { useAuth } from '../../../auth/hooks';

// ============================================================================
// Query Keys
// ============================================================================

export const rewardLedgerKeys = {
  all: ['reward-ledger'] as const,
  byUser: (userId: string) => [...rewardLedgerKeys.all, 'user', userId] as const,
  summary: (userId: string) => [...rewardLedgerKeys.byUser(userId), 'summary'] as const,
  pending: (userId: string) => [...rewardLedgerKeys.byUser(userId), 'pending'] as const,
  failed: (userId: string) => [...rewardLedgerKeys.byUser(userId), 'failed'] as const,
};

// ============================================================================
// Read Hooks
// ============================================================================

export function useRewardLedger(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: string;
    state?: 'PENDING' | 'DELIVERED' | 'FAILED' | 'EXPIRED' | 'RETRYING';
  }
) {
  return useQuery({
    queryKey: rewardLedgerKeys.byUser(userId),
    queryFn: () => queries.getRewardLedger(userId, options),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 minutes
  });
}

export function usePendingRewards(userId: string) {
  return useQuery({
    queryKey: rewardLedgerKeys.pending(userId),
    queryFn: () => queries.getPendingRewards(userId),
    enabled: !!userId,
    staleTime: 1000 * 10, // 10 minutes for pending rewards
    refetchInterval: 1000 * 60, // Check every minute
  });
}

export function useRewardSummary(userId: string) {
  return useQuery({
    queryKey: rewardLedgerKeys.summary(userId),
    queryFn: () => queries.getRewardSummary(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCurrentRewardLedger() {
  const { user } = useAuth();
  const userId = user?.id;

  return useRewardLedger(userId || '');
}

export function useCurrentPendingRewards() {
  const { user } = useAuth();
  const userId = user?.id;

  return usePendingRewards(userId || '');
}

export function useCurrentRewardSummary() {
  const { user } = useAuth();
  const userId = user?.id;

  return useRewardSummary(userId || '');
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: service.createRewardEntry,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: rewardLedgerKeys.byUser(variables.userId),
      });
    },
  });
}

export function useDeliverReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: service.deliverReward,
    onSuccess: (data, entryId) => {
      // Extract userId from the result or refetch all
      queryClient.invalidateQueries({
        queryKey: rewardLedgerKeys.all,
      });
    },
  });
}

export function useRetryFailedRewards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => queries.retryFailedRewards(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({
        queryKey: rewardLedgerKeys.byUser(userId),
      });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

export function useRewardStateColor(state: string) {
  const colors = {
    PENDING: '#FFA500',
    DELIVERED: '#4CAF50',
    FAILED: '#F44336',
    EXPIRED: '#9E9E9E',
    RETRYING: '#2196F3',
  };
  return colors[state as keyof typeof colors] || '#9E9E9E';
}

export function useRewardTypeIcon(type: string) {
  const icons = {
    XP: '⭐',
    COINS: '🪙',
    GEMS: '💎',
    ITEM: '📦',
    BADGE: '🏆',
    STREAK_SHIELD: '🛡️',
  };
  return icons[type as keyof typeof icons] || '🎁';
}
