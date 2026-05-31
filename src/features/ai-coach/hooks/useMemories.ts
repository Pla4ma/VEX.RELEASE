import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryObserverResult,
  type RefetchOptions,
} from '@tanstack/react-query';
import { useToastHelpers } from '../../../shared/ui/components/Toast';
import {
  createCoachMemory,
  fetchCoachMemories,
} from '../services/memory-service';
import type {
  CoachMemory,
  CreateCoachMemoryInput,
  MemoryType,
} from '../memory-schemas';
import { useNetworkStatus } from './useNetworkStatus';

const memoryKeys = {
  all: (userId: string) => ['coach', 'memories', userId] as const,
  typed: (userId: string, type: MemoryType) =>
    ['coach', 'memories', userId, type] as const,
};

export interface UseCoachMemoriesResult {
  data: CoachMemory[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<CoachMemory[], Error>>;
  isOffline: boolean;
}

export function useCoachMemories(
  userId: string,
  type?: MemoryType,
): UseCoachMemoriesResult {
  const network = useNetworkStatus();
  const query = useQuery({
    queryKey: type ? memoryKeys.typed(userId, type) : memoryKeys.all(userId),
    queryFn: () => fetchCoachMemories(userId, type),
    enabled: userId.length > 0 && network.isConnected,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    networkMode: 'offlineFirst',
  });
  const executeRefetch = query.refetch;

  return {
    data: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: (options?: RefetchOptions) =>
      executeRefetch.call(undefined, options),
    isOffline: !network.isConnected,
  };
}

export function useCreateCoachMemory(): {
  createMemory: (input: CreateCoachMemoryInput) => void;
  createMemoryAsync: (input: CreateCoachMemoryInput) => Promise<CoachMemory>;
  isPending: boolean;
  error: Error | null;
} {
  const queryClient = useQueryClient();
  const toast = useToastHelpers();
  const mutation = useMutation({
    mutationFn: createCoachMemory,
    onSuccess: (memory) => {
      queryClient.invalidateQueries({
        queryKey: memoryKeys.all(memory.userId),
      });
      queryClient.invalidateQueries({
        queryKey: memoryKeys.typed(memory.userId, memory.type),
      });
    },
    onError: () => {
      toast.error(
        'Coach memory could not be saved.',
        'Your next session still works. Try again when the connection is steady.',
      );
    },
  });

  return {
    createMemory: mutation.mutate,
    createMemoryAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
