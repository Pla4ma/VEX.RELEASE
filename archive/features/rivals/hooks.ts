/**
 * Rivals Hooks
 *
 * TanStack Query hooks for rival system UI consumption.
 * Provides: loading, error, empty states for all rival operations.
 *
 * @phase 7
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as repository from './repository';
import * as service from './service';
import { useRivalsStore } from './store';
import { buildGhostRivals } from './GhostRivalSystem';
import type {
  RivalProfile,
  RivalRelationship,
  CurrentRival,
  RivalHistoryEntry,
  RivalMatchResult,
} from './schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const rivalKeys = {
  all: ['rivals'] as const,
  byUser: (userId: string) => [...rivalKeys.all, 'user', userId] as const,
  myRivals: (userId: string) => [...rivalKeys.byUser(userId), 'myRivals'] as const,
  suggestions: (userId: string) => [...rivalKeys.byUser(userId), 'suggestions'] as const,
  challenges: (userId: string) => [...rivalKeys.byUser(userId), 'challenges'] as const,
  challenge: (challengeId: string) => [...rivalKeys.all, 'challenge', challengeId] as const,
  history: (userId: string) => [...rivalKeys.byUser(userId), 'history'] as const,
  active: (userId: string) => [...rivalKeys.byUser(userId), 'active'] as const,
};

// ============================================================================
// Types for Hook Results
// ============================================================================

export interface RivalsHookResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => void;
}

export interface RivalChallenge {
  id: string;
  challengerId: string;
  challengedId: string;
  challengerName: string;
  challengedName: string;
  challengerAvatar?: string;
  challengedAvatar?: string;
  type: 'FOCUS_TIME_24H' | 'SESSION_QUALITY_TODAY' | 'FIRST_BOSS_DEFEAT';
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DECLINED';
  challengerScore: number;
  challengedScore: number;
  startedAt?: number;
  endsAt?: number;
  winnerId?: string | null;
  rewardXp: number;
}

const rivalChallengeStore = new Map<string, RivalChallenge>();

function getChallengesForUser(userId: string): RivalChallenge[] {
  return Array.from(rivalChallengeStore.values()).filter(
    (challenge) => challenge.challengerId === userId || challenge.challengedId === userId
  );
}

// ============================================================================
// 7.1 — Rivals hooks
// ============================================================================

/**
 * useMyRivals — Returns list of active rivals with their stats
 * Includes loading, error, and empty states
 */
export function useMyRivals(userId: string | null): RivalsHookResult<CurrentRival[]> {
  const storeRival = useRivalsStore((state) => state.currentRival);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: rivalKeys.myRivals(userId || ''),
    queryFn: async () => {
      if (!userId) {throw new Error('User ID required');}

      const weekStart = service.getWeekStart();
      const relationship = await repository.getCurrentRival(userId, weekStart);

      if (!relationship) {
        const baseline = await repository.fetchRivalBaselineStats(userId);
        return buildGhostRivals({ userId, realRivalCount: 0, ...baseline });
      }

      // Determine which side of the relationship the user is on
      const isChallenger = relationship.challengerId === userId;
      const rivalUserId = isChallenger ? relationship.challengedId : relationship.challengerId;

      // Fetch rival profile from candidates (or ideally a direct profile lookup)
      // For now, we'll construct a minimal profile
      const rivalProfile: RivalProfile = {
        userId: rivalUserId,
        name: isChallenger ? 'Rival' : 'Rival', // Would be fetched from profiles table
        level: 1, // Would be fetched from profiles table
        sessionsPerWeek: 3, // Would be fetched from profiles table
        avgSessionDuration: 25, // Would be fetched from profiles table
      };

      const myScore = isChallenger ? relationship.challengerScore : relationship.challengedScore;
      const theirScore = isChallenger ? relationship.challengedScore : relationship.challengerScore;

      const currentRival: CurrentRival = {
        profile: rivalProfile,
        weeklyScore: {
          mine: myScore,
          theirs: theirScore,
          lastUpdated: Date.now(),
        },
        relationshipId: relationship.id,
        weekStart: relationship.weekStart,
        daysRemaining: service.getDaysRemainingInWeek(),
      };

      const baseline = await repository.fetchRivalBaselineStats(userId);
      return [
        currentRival,
        ...buildGhostRivals({ userId, realRivalCount: 1, ...baseline }),
      ];
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Merge with store data for real-time updates
  const mergedData = data?.map((rival) => {
    if (storeRival && storeRival.relationshipId === rival.relationshipId) {
      return {
        ...rival,
        weeklyScore: storeRival.weeklyScore,
      };
    }
    return rival;
  }) || data;

  return {
    data: mergedData || null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    isEmpty: !isLoading && !isError && (!mergedData || mergedData.length === 0),
    refetch,
  };
}

/**
 * useRivalSuggestions — Returns suggested rivals from leaderboard
 * Filters: similar level, nearby XP
 */
export function useRivalSuggestions(
  userId: string | null,
  myLevel: number,
  mySessionsPerWeek: number,
  myAvgSessionDuration: number
): RivalsHookResult<RivalMatchResult[]> {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: rivalKeys.suggestions(userId || ''),
    queryFn: async () => {
      if (!userId) {throw new Error('User ID required');}

      // Fetch candidates from repository
      const candidates = await repository.fetchRivalCandidates(
        userId,
        Math.max(1, myLevel - 3),
        myLevel + 3
      );

      // Create match criteria
      const criteria = service.createMatchCriteria(
        myLevel,
        mySessionsPerWeek,
        myAvgSessionDuration
      );

      // Score and filter candidates
      const bestMatch = service.findBestRivalMatch(criteria, candidates);

      // Return top suggestions (we'll return up to 5)
      // For now, return the single best match or empty
      return bestMatch ? [bestMatch] : [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    isEmpty: !isLoading && !isError && (!data || data.length === 0),
    refetch,
  };
}

/**
 * useRivalChallenge — Returns a specific rival challenge detail
 */
export function useRivalChallenge(
  challengeId: string | null
): RivalsHookResult<RivalChallenge> {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: rivalKeys.challenge(challengeId || ''),
    queryFn: async () => {
      if (!challengeId) {throw new Error('Challenge ID required');}

      return rivalChallengeStore.get(challengeId) ?? null;
    },
    enabled: !!challengeId,
    staleTime: 1000 * 10, // 10 seconds for live updates
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    isEmpty: false, // Challenge either exists or doesn't
    refetch,
  };
}

/**
 * useActiveChallenges — Returns all pending and active challenges for user
 */
export function useActiveChallenges(
  userId: string | null
): RivalsHookResult<RivalChallenge[]> {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: rivalKeys.challenges(userId || ''),
    queryFn: async () => {
      if (!userId) {throw new Error('User ID required');}

      return getChallengesForUser(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    isEmpty: !isLoading && !isError && (!data || data.length === 0),
    refetch,
  };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * useSendRivalChallenge — Mutation to send a 24h focus duel to a rival
 */
export function useSendRivalChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      challengerId: string;
      challengedId: string;
      type: RivalChallenge['type'];
    }) => {
      // Create the challenge
      const weekStart = service.getWeekStart();

      // Create or update rival relationship
      const relationship = await repository.createRivalRelationship(
        input.challengerId,
        input.challengedId,
        weekStart
      );

      if (!relationship) {
        throw new Error('Failed to create rival challenge');
      }

      const challenge: RivalChallenge = {
        id: relationship.id,
        challengerId: input.challengerId,
        challengedId: input.challengedId,
        challengerName: 'Challenger',
        challengedName: 'Challenged',
        type: input.type,
        status: 'PENDING',
        challengerScore: 0,
        challengedScore: 0,
        rewardXp: 100,
      };
      rivalChallengeStore.set(challenge.id, challenge);

      return relationship;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: rivalKeys.myRivals(variables.challengerId),
      });
      queryClient.invalidateQueries({
        queryKey: rivalKeys.challenges(variables.challengerId),
      });
    },
  });
}

/**
 * useAcceptRivalChallenge — Mutation to accept a received challenge
 */
export function useAcceptRivalChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      challengeId: string;
      userId: string;
    }) => {
      const challenge = rivalChallengeStore.get(input.challengeId);
      if (!challenge) {
        throw new Error('Rival challenge not found');
      }
      const startedAt = Date.now();
      rivalChallengeStore.set(input.challengeId, {
        ...challenge,
        status: 'ACTIVE',
        startedAt,
        endsAt: startedAt + 24 * 60 * 60 * 1000,
      });
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: rivalKeys.challenge(variables.challengeId),
      });
      queryClient.invalidateQueries({
        queryKey: rivalKeys.challenges(variables.userId),
      });
    },
  });
}

/**
 * useDeclineRivalChallenge — Mutation to decline a received challenge
 */
export function useDeclineRivalChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      challengeId: string;
      userId: string;
    }) => {
      const challenge = rivalChallengeStore.get(input.challengeId);
      if (!challenge) {
        throw new Error('Rival challenge not found');
      }
      rivalChallengeStore.set(input.challengeId, {
        ...challenge,
        status: 'DECLINED',
      });
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: rivalKeys.challenge(variables.challengeId),
      });
      queryClient.invalidateQueries({
        queryKey: rivalKeys.challenges(variables.userId),
      });
    },
  });
}

/**
 * useUpdateRivalScores — Mutation to update scores after session completion
 */
export function useUpdateRivalScores() {
  const queryClient = useQueryClient();
  const { currentRival } = useRivalsStore();

  return useMutation({
    mutationFn: async (input: {
      relationshipId: string;
      challengerScore: number;
      challengedScore: number;
    }) => {
      const success = await repository.updateRivalScores(
        input.relationshipId,
        input.challengerScore,
        input.challengedScore
      );

      if (!success) {
        throw new Error('Failed to update rival scores');
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate all rival queries
      queryClient.invalidateQueries({
        queryKey: rivalKeys.all,
      });
    },
  });
}

// ============================================================================
// History & Stats Hooks
// ============================================================================

/**
 * useRivalHistory — Returns completed rival history for user
 */
export function useRivalHistory(
  userId: string | null,
  limit: number = 10
): RivalsHookResult<RivalHistoryEntry[]> {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...rivalKeys.history(userId || ''), limit],
    queryFn: async () => {
      if (!userId) {throw new Error('User ID required');}
      return repository.getRivalHistory(userId, limit);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    isEmpty: !isLoading && !isError && (!data || data.length === 0),
    refetch,
  };
}

// ============================================================================
// Real-time Subscription Hook
// ============================================================================

/**
 * useRivalRealtime — Subscribe to live rival score updates
 */
export function useRivalRealtime(
  relationshipId: string | null,
  onUpdate?: (challengerScore: number, challengedScore: number) => void
) {
  const updateStore = useRivalsStore((state) => state.updateWeeklyScore);

  useEffect(() => {
    if (!relationshipId) {return undefined;}

    const unsubscribe = repository.subscribeToRivalUpdates(
      relationshipId,
      (challengerScore, challengedScore) => {
        updateStore(challengerScore, challengedScore);
        onUpdate?.(challengerScore, challengedScore);
      }
    );

    return unsubscribe;
  }, [relationshipId, onUpdate, updateStore]);
}
