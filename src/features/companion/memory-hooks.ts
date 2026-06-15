import { useQuery } from '@tanstack/react-query';
import { getCompanionMemories } from './memory-service';
import type { CompanionMemory } from './memory-types';

export const companionMemoryKeys = {
  all: ['companion-memories'] as const,
  list: (userId: string) => [...companionMemoryKeys.all, userId] as const,
};

export function useCompanionMemories(userId: string | null): {
  data: CompanionMemory[];
  error: Error | null;
  isError: boolean;
  isPending: boolean;
  refetch: () => void;
} {
  const { refetch, data, error, isError, isPending } = useQuery({
    enabled: Boolean(userId),
    queryFn: () => (userId ? getCompanionMemories(userId) : []),
    queryKey: companionMemoryKeys.list(userId ?? 'none'),
    });




  const refresh = refetch;
  return {
    data: data ?? [],
    error: error instanceof Error ? error : null,
    isError: isError,
    isPending: isPending,
    refetch: () => {
      refresh();
    },
  };
}
