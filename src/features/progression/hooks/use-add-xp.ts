/**
 * useAddXp mutation hook (extracted to break self-cycle with useOptimisticXp).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';

import { useToast } from '../../../shared/ui/components/Toast';
import { AddXpInputSchema } from '../schemas';
import type { AddXpInput, AddXpOperationResult } from '../types';
import * as service from '../service';
import { progressionKeys } from './query-keys';

export function useAddXp() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<AddXpOperationResult, Error, AddXpInput>({
    mutationFn: async (input) => {
      const validated = AddXpInputSchema.parse(input);
      return service.addXp(validated.userId, validated);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.byUser(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.summary(variables.userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'progression', operation: 'addXp' },
      });
      show({
        type: 'error',
        title: 'XP not added',
        message: 'Try again when connection returns.',
      });
    },
  });
}
