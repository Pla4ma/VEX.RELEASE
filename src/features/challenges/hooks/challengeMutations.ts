import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import { useCallback, useEffect } from 'react';
import { eventBus } from '../../../events';
import * as service from '../service';
import * as queries from '../queries';
import { challengeKeys } from './challengeKeys';
import { economyKeys } from '../../economy/hooks';
import type { UpdateChallengeProgressInput } from '../schemas';
import type { UserChallengeSummary } from '../schemas/responses';

export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (input: UpdateChallengeProgressInput) =>
      service.updateChallengeProgress(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.byUser(input.userId) });
      queryClient.invalidateQueries({ queryKey: challengeKeys.userChallenge(input.userId, input.challengeId) });
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
      queryClient.invalidateQueries({ queryKey: challengeKeys.byUser(input.userId) });
      queryClient.invalidateQueries({ queryKey: challengeKeys.active(input.userId) });
      queryClient.invalidateQueries({ queryKey: economyKeys.wallet(input.userId) });
    },
    onError: (error, variables, context) => {
      if (context?.previousByUser) queryClient.setQueryData(context.byUserKey, context.previousByUser);
      if (context?.previousActive) queryClient.setQueryData(context.activeKey, context.previousActive);
      Sentry.captureException(error, { tags: { feature: 'challenges', operation: 'claimChallengeReward' } });
      show({ type: 'error', title: 'Reward not claimed', message: 'Try again when connection returns.' });
    },
  });
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
      queryClient.invalidateQueries({ queryKey: challengeKeys.byUser(input.userId) });
      queryClient.invalidateQueries({ queryKey: challengeKeys.active(input.userId) });
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
      if (event.userId !== userId) return;
      queryClient.invalidateQueries({ queryKey: challengeKeys.byUser(userId) });
    },
    [queryClient, userId],
  );
  useEffect(() => {
    if (!canSubscribe) return;
    const unsubscribe = eventBus.subscribe('challenge:completed', handleChallengeCompleted);
    return unsubscribe;
  }, [canSubscribe, handleChallengeCompleted]);
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
