import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { createReward, syncPendingRewards } from './service';
import type {} from './types';

export function usePendingRewards(userId: string) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['rewards', 'pending', userId],
    queryFn: () => syncPendingRewards(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    });





  return {
    rewards: data,
    isPending: isPending,
    isError: isError,
    error: error,
    refetch: refetch,
  };
}

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReward,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['rewards', 'pending', variables.userId],
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'reward-ledger', operation: 'create-reward' },
      });
    },
  });
}
