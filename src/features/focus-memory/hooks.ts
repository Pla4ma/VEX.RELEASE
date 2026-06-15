import { useQuery } from '@tanstack/react-query';

import { listActiveMemories } from './service';

export function useActiveFocusMemories(userId: string | null) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['focus-memory', userId],
    queryFn: () => listActiveMemories(userId ?? ''),
    enabled: Boolean(userId),
    });





  return {
    data: data ?? [],
    isPending: isPending,
    isError: isError,
    error: error,
    refetch: refetch,
  };
}
