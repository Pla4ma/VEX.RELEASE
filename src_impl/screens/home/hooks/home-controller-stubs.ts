import type { UseQueryResult } from '@tanstack/react-query';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { SessionRecommendation } from '../../../features/ai-coach';

export function createStubQuery(): UseQueryResult {
  const stub = {
    data: undefined as unknown,
    dataUpdatedAt: 0,
    error: null,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'idle' as const,
    isError: false as const,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false as const,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false as const,
    isRefetching: false,
    isStale: false,
    isSuccess: false as const,
    promise: Promise.resolve(undefined as unknown),
    refetch: (() => Promise.resolve(stub)) as () => Promise<UseQueryResult>,
    status: 'pending' as const,
  };
  return stub as UseQueryResult;
}

export function stubNavigationActions() {
  const noop = (): void => {};
  return {
    openSetup: noop,
    openProgress: noop,
    openSocial: noop,
    openContentStudy: noop,
    continueStudyPlan: noop,
    openNextAction: noop,
  };
}

export function stubCoachMutations() {
  return {
    createRecommendation: {
      mutate: (_vars: unknown): void => {},
      mutateAsync: (): Promise<unknown> => Promise.resolve(undefined),
      isPending: false,
      reset: (): void => {},
    },
    updateRecommendationStatus: {
      mutate: (_vars: unknown): void => {},
      mutateAsync: (): Promise<unknown> => Promise.resolve(undefined),
      isPending: false,
      reset: (): void => {},
    },
  };
}

export const stubHomeReturnReason: HomeReturnReason = {
  body: '',
  ctaLabel: 'Start',
  eyebrow: '',
  intent: 'start-session',
  onPress: (): void => {},
  source: 'next-best-action',
  title: '',
  tone: 'default',
};

export function stubPrimaryRecommendation(): SessionRecommendation | null {
  return null;
}

