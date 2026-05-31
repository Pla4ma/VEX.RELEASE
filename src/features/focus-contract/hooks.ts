import * as Sentry from '@sentry/react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store';
import { useToast } from '../../shared/ui/components/Toast';
import * as service from './service';
import type {
  FocusContract,
  FocusContractInput,
  ReflectionStatus,
} from './types';

export const focusContractKeys = {
  all: ['focus-contract'] as const,
  session: (sessionId: string) =>
    [...focusContractKeys.all, 'session', sessionId] as const,
  rate: (userId: string, windowDays: number) =>
    [...focusContractKeys.all, 'rate', userId, windowDays] as const,
};

export function useContractForSession(sessionId: string | null): {
  contract: FocusContract | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const query = useQuery({
    queryKey: focusContractKeys.session(sessionId ?? 'none'),
    queryFn: () => {
      if (!sessionId || !userId) {
        return null;
      }
      return service.getContractForSession(sessionId, userId);
    },
    enabled: Boolean(sessionId && userId),
  });
  const refresh = query.refetch;

  return {
    contract: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => {
      void refresh();
    },
  };
}

export function useCreateContract(): ReturnType<
  typeof useMutation<FocusContract, Error, FocusContractInput>
> {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const { show } = useToast();

  return useMutation({
    mutationFn: (input: FocusContractInput) => {
      if (!userId) {
        throw new Error('User is required to create a focus contract.');
      }
      return service.createContract(input, userId);
    },
    onSuccess: (contract) => {
      queryClient.setQueryData(
        focusContractKeys.session(contract.sessionId),
        contract,
      );
      void queryClient.invalidateQueries({
        queryKey: focusContractKeys.session(contract.sessionId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'focus-contract', operation: 'create' },
      });
      show({
        type: 'error',
        title: 'Contract saved locally failed',
        message: 'Your session can still start.',
      });
    },
  });
}

export function useReflectOnContract(): ReturnType<
  typeof useMutation<
    void,
    Error,
    { contract: FocusContract; status: ReflectionStatus }
  >
> {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const { show } = useToast();

  return useMutation({
    mutationFn: ({ contract, status }) => {
      if (!userId) {
        throw new Error('User is required to reflect on a focus contract.');
      }
      return service.reflectOnContract(contract.id, status, userId);
    },
    onMutate: async ({ contract, status }) => {
      const key = focusContractKeys.session(contract.sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous =
        queryClient.getQueryData<FocusContract | null>(key) ?? null;
      queryClient.setQueryData<FocusContract>(key, {
        ...contract,
        completionStatus: status,
        reflectionAt: new Date().toISOString(),
      });
      return { key, previous };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: focusContractKeys.session(variables.contract.sessionId),
      });
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: ['focus-score', userId],
        });
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
      Sentry.captureException(error, {
        tags: { feature: 'focus-contract', operation: 'reflect' },
      });
      show({
        type: 'error',
        title: 'Reflection did not save',
        message: 'Retry when connection returns.',
      });
    },
  });
}

export function useContractCompletionRate(
  userId: string | null,
  windowDays: number,
): {
  rate: number;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: focusContractKeys.rate(userId ?? 'none', windowDays),
    queryFn: () =>
      userId ? service.getCompletionRate(userId, windowDays) : 0.5,
    enabled: Boolean(userId),
  });
  const refresh = query.refetch;

  return {
    rate: query.data ?? 0.5,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => {
      void refresh();
    },
  };
}
