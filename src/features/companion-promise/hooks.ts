import * as Sentry from '@sentry/react-native';
import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../shared/ui/components/Toast';
import { useAuthStore } from '../../store';
import { useNetInfo } from '../../network';
import { QueryKeys } from '../../api/QueryProvider';
import { trackPromiseViewed } from './analytics';
import * as service from './service';
import type { CompanionPromise, CompanionPromiseHomeState } from './types';

export const companionPromiseKeys = {
  all: ['companion-promise'] as const,
  home: (userId: string) =>
    [...companionPromiseKeys.all, 'home', userId] as const,
};

function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
}

function hasPromise(
  state: CompanionPromiseHomeState,
): state is Extract<CompanionPromiseHomeState, { promise: CompanionPromise }> {
  return 'promise' in state;
}

export function useCompanionPromise(): {
  data: CompanionPromiseHomeState;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  keepPromise: (promise: CompanionPromise) => Promise<void>;
  dismissRecovery: (promiseId: string) => Promise<void>;
} {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const { isOnline } = useNetInfo();
  const { show } = useToast();
  const viewedRef = useRef<string | null>(null);
  const query = useQuery({
    queryKey: companionPromiseKeys.home(userId ?? 'none'),
    queryFn: async () => {
      if (!userId) {
        return { kind: 'hidden', showOfflineBanner: false } as const;
      }
      return service.getHomePromiseState(userId, isOnline, getTimeZone());
    },
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (
      query.data &&
      hasPromise(query.data) &&
      query.data.promise.id !== viewedRef.current
    ) {
      viewedRef.current = query.data.promise.id;
      trackPromiseViewed(query.data.promise, 'home');
    }
  }, [query.data]);

  const invalidate = async (): Promise<void> => {
    if (!userId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: companionPromiseKeys.home(userId),
    });
    await queryClient.invalidateQueries({
      queryKey: ['companion-memories', userId],
    });
    await queryClient.invalidateQueries({ queryKey: QueryKeys.session });
  };

  const keepPromiseMutation = useMutation({
    mutationFn: (promise: CompanionPromise) => service.keepPromise(promise),
    onSuccess: () => {
      void invalidate();
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'companion-promise', operation: 'keep' },
      });
      show({
        type: 'error',
        title: 'Recovery did not save',
        message:
          'Start small anyway. We will sync when the thread is steady again.',
      });
    },
  });
  const dismissRecoveryMutation = useMutation({
    mutationFn: (promiseId: string) => service.dismissRecovery(promiseId),
    onSuccess: () => {
      void invalidate();
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'companion-promise', operation: 'dismiss' },
      });
      show({
        type: 'error',
        title: 'Could not dismiss recovery',
        message: 'Try again when your connection settles.',
      });
    },
  });

  const fallbackData = isOnline
    ? ({ kind: 'hidden', showOfflineBanner: false } as const)
    : ({ kind: 'offline', showOfflineBanner: true } as const);
  const rerunQuery = (): void => {
    const refresh = query.refetch;
    void refresh();
  };

  return {
    data: query.data ?? fallbackData,
    error: query.error instanceof Error ? query.error : null,
    isError: query.isError,
    isPending: query.isPending,
    refetch: rerunQuery,
    keepPromise: async (promise) => {
      await keepPromiseMutation.mutateAsync(promise);
    },
    dismissRecovery: async (promiseId) => {
      await dismissRecoveryMutation.mutateAsync(promiseId);
    },
  };
}
