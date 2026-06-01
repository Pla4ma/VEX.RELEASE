import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMemoryCandidates,
  addMemoryCandidate,
  removeMemoryCandidate,
} from './service';
import type { MemoryCandidateInput } from './schemas';

export function useMemoryCandidates(userId: string | null, enabled = true) {
  const query = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => getMemoryCandidates(userId ?? ''),
    queryKey: ['memory-candidate', userId],
  });

  return {
    data: query.data ?? [],
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}

export function useAddMemoryCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MemoryCandidateInput) => addMemoryCandidate(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({
        queryKey: ['memory-candidate', input.userId],
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
      void queryClient.invalidateQueries({
        queryKey: ['memory-candidate', input.userId],
      });
    },
  });
}
