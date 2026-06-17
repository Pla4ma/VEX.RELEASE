import { useQuery } from '@tanstack/react-query';
import { challengeKeys } from './challengeKeys';
import * as repository from '../repository';
import * as queries from '../queries';

export function useChallenge(challengeId: string) {
  return useQuery({
    queryKey: challengeKeys.byId(challengeId),
    queryFn: () => repository.fetchChallengeById(challengeId),
    enabled: Boolean(challengeId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useChallengesByType(
  seasonId: string,
  type: 'DAILY' | 'WEEKLY' | 'EVENT',
) {
  return useQuery({
    queryKey: challengeKeys.byType(seasonId, type),
    queryFn: () => repository.fetchChallengesByType(seasonId, type),
    enabled: Boolean(seasonId) && Boolean(type),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useUserChallenges(userId: string) {
  return useQuery({
    queryKey: challengeKeys.byUser(userId),
    queryFn: () => repository.fetchUserChallenges(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 30,
  });
}

export function useActiveChallenges(
  userId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: challengeKeys.active(userId),
    queryFn: () => queries.getActiveChallenges(userId),
    enabled: Boolean(userId) && options.enabled !== false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useChallengeSummaries(userId: string) {
  return useQuery({
    queryKey: [...challengeKeys.all, 'summaries', userId],
    queryFn: () => queries.getUserChallengeSummaries(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 30,
  });
}

export function useRerollEligibility(userId: string, challengeId: string) {
  return useQuery({
    queryKey: [...challengeKeys.all, 'reroll-eligibility', userId, challengeId],
    queryFn: () => queries.checkRerollEligibility(userId, challengeId),
    enabled: Boolean(userId) && Boolean(challengeId),
    staleTime: 1000 * 30,
  });
}





