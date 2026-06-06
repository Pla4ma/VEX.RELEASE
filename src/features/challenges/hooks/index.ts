import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import { useCallback, useEffect } from 'react';
import { eventBus } from '../../../events';
import * as service from '../service';
import * as queries from '../queries';
import * as repository from '../repository';
import { economyKeys } from '../../economy/hooks';
import type { UpdateChallengeProgressInput } from '../schemas';
import type { UserChallengeSummary } from '../schemas/responses';
export const challengeKeys = {
  all: ['challenges'] as const,
  byId: (id: string) => [...challengeKeys.all, id] as const,
  byType: (seasonId: string, type: string) =>
    [...challengeKeys.all, 'type', seasonId, type] as const,
  byUser: (userId: string) => [...challengeKeys.all, 'user', userId] as const,
  userChallenge: (userId: string, challengeId: string) =>
    [...challengeKeys.all, 'user-challenge', userId, challengeId] as const,
  active: (userId: string) => [...challengeKeys.all, 'active', userId] as const,
  completable: (userId: string) =>
    [...challengeKeys.all, 'completable', userId] as const,
};
export function useChallenge(challengeId: string) {
  return useQuery({
    queryKey: challengeKeys.byId(challengeId),
    queryFn: () => repository.fetchChallengeById(challengeId),
    enabled: Boolean(challengeId),
    staleTime: 1000 * 60 * 5,
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
  });
}
export function useUserChallenges(userId: string) {
  return useQuery({
    queryKey: challengeKeys.byUser(userId),
    queryFn: () => repository.fetchUserChallenges(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 1,
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
  });
}
export function useChallengeSummaries(userId: string) {
  return useQuery({
    queryKey: [...challengeKeys.all, 'summaries', userId],
    queryFn: () => queries.getUserChallengeSummaries(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });
}
export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (input: UpdateChallengeProgressInput) =>
      service.updateChallengeProgress(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.byUser(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: challengeKeys.userChallenge(input.userId, input.challengeId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'challenges', operation: 'updateChallengeProgress' } });
      show({ type: 'error', title: 'Progress not saved', message: 'Try again when connection returns.' });
    },
  });
}
export function useClaimChallengeReward() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: async (input: { userId: string; challengeId: string }) => {
      const result = await service.claimChallengeReward(input);
      if (!result.success) {
        throw new Error(result.error ?? 'Challenge reward claim failed');
      }
      return result;
    },
    onMutate: async (variables) => {
      const byUserKey = challengeKeys.byUser(variables.userId);
      const activeKey = challengeKeys.active(variables.userId);
      await queryClient.cancelQueries({ queryKey: byUserKey });
      await queryClient.cancelQueries({ queryKey: activeKey });

      const previousByUser = queryClient.getQueryData<UserChallengeSummary[]>(byUserKey);
      const previousActive = queryClient.getQueryData<UserChallengeSummary[]>(activeKey);

      if (previousByUser) {
        queryClient.setQueryData<UserChallengeSummary[]>(byUserKey, previousByUser.map((c) =>
          c.challengeId === variables.challengeId
            ? { ...c, status: 'CLAIMED' as const, isClaimable: false }
            : c,
        ));
      }

      if (previousActive) {
        queryClient.setQueryData<UserChallengeSummary[]>(activeKey, previousActive.filter(
          (c) => c.challengeId !== variables.challengeId,
        ));
      }

      return { byUserKey, activeKey, previousByUser, previousActive };
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.byUser(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: challengeKeys.active(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: economyKeys.wallet(input.userId),
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousByUser) {
        queryClient.setQueryData(context.byUserKey, context.previousByUser);
      }
      if (context?.previousActive) {
        queryClient.setQueryData(context.activeKey, context.previousActive);
      }
      Sentry.captureException(error, { tags: { feature: 'challenges', operation: 'claimChallengeReward' } });
      show({ type: 'error', title: 'Reward not claimed', message: 'Try again when connection returns.' });
    },
  });
}
export function useChallengeProgress(userId: string) {
  const query = useActiveChallenges(userId);
  const challenges = query.data ?? [];
  const total = challenges.length;
  const completed = challenges.filter(
    (item) =>
      item.userChallenge.status === 'COMPLETED' ||
      item.userChallenge.status === 'CLAIMED',
  ).length;
  return {
    ...query,
    completed,
    total,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
export function useRerollChallenge() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (input: {
      userId: string;
      challengeId: string;
      usePaidReroll: boolean;
      idempotencyKey?: string;
    }) => queries.rerollChallenge(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.byUser(input.userId),
      });
      queryClient.invalidateQueries({
        queryKey: challengeKeys.active(input.userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'challenges', operation: 'rerollChallenge' } });
      show({ type: 'error', title: 'Reroll failed', message: 'Try again when connection returns.' });
    },
  });
}
export function useChallengeEvents(userId: string, canSubscribe?: boolean) {
  const queryClient = useQueryClient();
  const handleChallengeCompleted = useCallback(
    (event: { userId: string; challengeId: string }) => {
      if (event.userId !== userId) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: challengeKeys.byUser(userId) });
    },
    [queryClient, userId],
  );
  useEffect(() => {
    if (!canSubscribe) {
      return;
    }
    const unsubscribe = eventBus.subscribe(
      'challenge:completed',
      handleChallengeCompleted,
    );
    return unsubscribe;
  }, [canSubscribe, handleChallengeCompleted]);
}
export function useRerollEligibility(userId: string, challengeId: string) {
  return useQuery({
    queryKey: [...challengeKeys.all, 'reroll-eligibility', userId, challengeId],
    queryFn: () => queries.checkRerollEligibility(userId, challengeId),
    enabled: Boolean(userId) && Boolean(challengeId),
    staleTime: 1000 * 30,
  });
}
