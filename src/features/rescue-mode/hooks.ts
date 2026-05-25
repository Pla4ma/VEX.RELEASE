import { useMutation, useQuery } from '@tanstack/react-query';
import { createRescuePlan } from './service';
import { getActiveRescuePlan, saveActiveRescuePlan } from './repository';
import type { RescuePlanInput } from './schemas';

export function useActiveRescuePlan(userId: string | null) {
  const query = useQuery({
    queryKey: ['rescue-mode', userId],
    queryFn: () => getActiveRescuePlan(userId ?? ''),
    enabled: Boolean(userId),
  });

  return {
    data: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateRescuePlan() {
  return useMutation({
    mutationFn: async (input: RescuePlanInput) => saveActiveRescuePlan(createRescuePlan(input)),
  });
}
