import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import {
  createRescuePlan,
  isRescueEligible,
  buildRescueCompletionRecord,
  buildRescueCompletionMemory,
  generateRescueReflection,
} from './service';
import {
  getActiveRescuePlan,
  saveActiveRescuePlan,
  clearActiveRescuePlan,
  saveRescueCompletion,
  getRescueCompletions,
} from './repository';
import type {
  RescueEligibilityInput,
  RescueEligibilityResult,
  RescueOutcome,
  RescuePlan,
  RescuePlanInput,
} from './schemas';

export function useActiveRescuePlan(userId: string | null) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['rescue-mode', userId],
    queryFn: () => getActiveRescuePlan(userId ?? ''),
    enabled: Boolean(userId),
    });





  return {
    data: data ?? null,
    isPending: isPending,
    isError: isError,
    error: error,
    refetch: refetch,
  };
}

export function useCreateRescuePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RescuePlanInput) => {
      const plan = createRescuePlan(input);
      await saveActiveRescuePlan(plan);
      return plan;
    },
    onSuccess: (_plan, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['rescue-mode', variables.userId],
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'rescue-mode', operation: 'create-rescue-plan' },
      });
    },
  });
}

export function useRescueEligibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: RescueEligibilityInput,
    ): Promise<RescueEligibilityResult> => {
      return isRescueEligible(input);
    },
    onMutate: (input) => {
      queryClient.setQueryData(['rescue-eligibility', input.userId], null);
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'rescue-mode', operation: 'check-rescue-eligibility' },
      });
    },
  });
}

export function useRescueCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      plan: RescuePlan;
      outcome: RescueOutcome;
      actualDurationSeconds: number;
    }) => {
      const { plan, outcome, actualDurationSeconds } = params;
      const record = buildRescueCompletionRecord(
        plan,
        outcome,
        actualDurationSeconds,
      );
      const memory = buildRescueCompletionMemory(plan, outcome);
      const reflection = generateRescueReflection(plan, outcome);
      await saveRescueCompletion(record);
      await clearActiveRescuePlan(plan.userId);
      return { record, memory, reflection };
    },
    onSuccess: (_result, params) => {
      queryClient.invalidateQueries({
        queryKey: ['rescue-mode', params.plan.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['rescue-completions', params.plan.userId],
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'rescue-mode', operation: 'complete-rescue' },
      });
    },
  });
}

export function useRescueCompletions(userId: string | null, limit?: number) {
  return useQuery({
    queryKey: ['rescue-completions', userId, limit],
    queryFn: () => getRescueCompletions(userId ?? '', limit),
    enabled: Boolean(userId),
  });
}

export function useClearRescuePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await clearActiveRescuePlan(userId);
    },
    onSuccess: (_result, userId) => {
      queryClient.invalidateQueries({ queryKey: ['rescue-mode', userId] });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'rescue-mode', operation: 'clear-rescue-plan' },
      });
    },
  });
}
