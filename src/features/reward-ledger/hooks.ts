import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createReward, syncPendingRewards } from './service';
import type { CreateRewardLedgerInput } from './types';

export function usePendingRewards(userId: string) {
  const query = useQuery({
    queryKey: ['rewards', 'pending', userId],
    queryFn: () => syncPendingRewards(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    rewards: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
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
  });
}
