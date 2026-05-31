import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { AddXpInputSchema, type AddXpInput } from '../schemas';
import { getProgressionEnhanced } from '../service-read';
import type { AddXpOperationResult } from '../service-xp-core';
import { progressionKeys, useAddXp } from './index';

export function useOptimisticXp() {
  const queryClient = useQueryClient();
  const addXpMutation = useAddXp();

  const addXpOptimistic = useCallback(
    async (input: AddXpInput) => {
      const validated = AddXpInputSchema.parse(input);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: progressionKeys.byUser(validated.userId),
      });

      // Snapshot previous value
      const previousProgression = queryClient.getQueryData<
        Awaited<ReturnType<typeof getProgressionEnhanced>>
      >(progressionKeys.byUser(validated.userId));

      // Optimistically update
      if (previousProgression) {
        queryClient.setQueryData(progressionKeys.byUser(validated.userId), {
          ...previousProgression,
          xp: previousProgression.xp + validated.amount,
          totalXp: previousProgression.totalXp + validated.amount,
        });
      }

      // Execute mutation
      try {
        const result = await addXpMutation.mutateAsync(validated);
        return result;
      } catch (error) {
        // Rollback on error
        if (previousProgression) {
          queryClient.setQueryData(
            progressionKeys.byUser(validated.userId),
            previousProgression,
          );
        }
        throw error;
      }
    },
    [queryClient, addXpMutation],
  );

  return {
    addXp: addXpOptimistic,
    isPending: addXpMutation.isPending,
    error: addXpMutation.error,
  };
}
