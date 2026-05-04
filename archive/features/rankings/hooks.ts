/**
 * Rankings Hooks
 *
 * TanStack Query hooks for ranking operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from './service';
import {
  type Leaderboard,
  type LeaderboardEntry,
  type RankTier,
  type UserRanking,
  type SeasonSummary,
  type GetLeaderboardInput,
  LeaderboardScopeSchema,
  LeaderboardTypeSchema,
} from './schemas';

const RANKING_QUERY_KEYS = {
  all: ['rankings'] as const,
  leaderboards: () => [...RANKING_QUERY_KEYS.all, 'leaderboard'] as const,
  leaderboard: (input: GetLeaderboardInput) => [...RANKING_QUERY_KEYS.leaderboards(), input] as const,
  userRank: (userId: string, type: string, scope: string) => [...RANKING_QUERY_KEYS.all, 'rank', userId, type, scope] as const,
  tiers: () => [...RANKING_QUERY_KEYS.all, 'tiers'] as const,
  userTier: (userId: string) => [...RANKING_QUERY_KEYS.all, 'tier', userId] as const,
  userRanking: (userId: string) => [...RANKING_QUERY_KEYS.all, 'user', userId] as const,
  seasonSummary: (userId: string) => [...RANKING_QUERY_KEYS.all, 'season', userId] as const,
  seasonHistory: (userId: string) => [...RANKING_QUERY_KEYS.all, 'season-history', userId] as const,
};

// Leaderboard Hooks
export function useLeaderboard(input: GetLeaderboardInput) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.leaderboard(input),
    queryFn: () => service.getLeaderboard(input),
    staleTime: 60 * 1000,
  });
}

export function useUserRank(userId: string | undefined, type: string, scope: string) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.userRank(userId || '', type, scope),
    queryFn: () => service.getUserRank({
      userId: userId!,
      type: LeaderboardTypeSchema.parse(type),
      scope: LeaderboardScopeSchema.parse(scope),
    }),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useGlobalRank(userId: string | undefined) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.userRank(userId || '', 'XP', 'GLOBAL'),
    queryFn: () => service.getGlobalRank(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useNearbyRanks(userId: string | undefined, type: string, scope: string) {
  return useQuery({
    queryKey: [...RANKING_QUERY_KEYS.userRank(userId || '', type, scope), 'nearby'],
    queryFn: () => service.getNearbyRanks(userId!, type, scope),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

// Tier Hooks
export function useRankTiers() {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.tiers(),
    queryFn: () => service.getRankTiers(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useUserTier(userId: string | undefined) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.userTier(userId || ''),
    queryFn: () => service.getUserTier(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// User Ranking Hooks
export function useUserRanking(userId: string | undefined) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.userRanking(userId || ''),
    queryFn: () => service.getUserRanking(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserRanking(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => service.updateUserRanking(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RANKING_QUERY_KEYS.userRanking(userId) });
      queryClient.invalidateQueries({ queryKey: RANKING_QUERY_KEYS.userRank(userId, 'XP', 'GLOBAL') });
    },
  });
}

// Season Hooks
export function useCurrentSeasonSummary(userId: string | undefined) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.seasonSummary(userId || ''),
    queryFn: () => service.getCurrentSeasonSummary(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeasonHistory(userId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.seasonHistory(userId || ''),
    queryFn: () => service.getSeasonHistory(userId!, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
