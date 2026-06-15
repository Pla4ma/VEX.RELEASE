import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import {
  getMemoryCandidates,
  addMemoryCandidate,
  removeMemoryCandidate,
} from './service';
import type { MemoryCandidateInput } from './schemas';

export function useMemoryCandidates(userId: string | null, enabled = true) {
  const { data, error, isError, isPending, refetch } = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => getMemoryCandidates(userId ?? ''),
    queryKey: ['memory-candidate', userId],
    });





  return {
    data: data ?? [],
    error: error,
    isError: isError,
    isPending: isPending,
    refetch: refetch,
  };
}

export function useAddMemoryCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MemoryCandidateInput) => addMemoryCandidate(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: ['memory-candidate', input.userId],
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'memory-candidate', operation: 'add-memory-candidate' },
      });
    },
  });
}

export function useRemoveMemoryCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      candidateId,
    }: {
      userId: string;
      candidateId: string;
    }) => removeMemoryCandidate(userId, candidateId),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: ['memory-candidate', input.userId],
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'memory-candidate', operation: 'remove-memory-candidate' },
      });
    },
  });
}
