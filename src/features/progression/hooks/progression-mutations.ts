import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';

import { useToast } from '../../../shared/ui/components/Toast';
import * as service from '../service';
import {
  AddXpInputSchema,
  PrestigeInputSchema,
  type AddXpInput,
  type PrestigeInput,
} from '../schemas';
import { getProgressionService } from '../../../progression/ProgressionService';
import type { AddXpOperationResult } from '../service-xp-core';
import { progressionKeys } from './query-keys';

export function useAddXp() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<AddXpOperationResult, Error, AddXpInput>({
    mutationFn: async (input) => {
      const validated = AddXpInputSchema.parse(input);
      return service.addXp(validated.userId, validated);
    },
    onSuccess: (data, variables) => {
      void data;
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

export function usePrestige() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<void, Error, PrestigeInput>({
    mutationFn: async (input) => {
      const validated = PrestigeInputSchema.parse(input);
      const progressionService = getProgressionService(validated.userId);
      if (!progressionService.canPrestige()) {
        throw new Error('Prestige is not available');
      }
      await progressionService.prestige();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.byUser(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.summary(variables.userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'progression', operation: 'prestige' },
      });
      show({
        type: 'error',
        title: 'Prestige failed',
        message: 'Try again when connection returns.',
      });
    },
  });
}
