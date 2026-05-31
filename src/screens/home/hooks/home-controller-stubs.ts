import type { UseQueryResult, QueryObserverPendingResult } from '@tanstack/react-query';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { SessionRecommendation } from '../../../features/ai-coach';
import type { LearningExecutionLayer } from '../../../features/learning-execution';

export function createStubQuery<TData = unknown>(): UseQueryResult<TData> {
  const stub: QueryObserverPendingResult<TData> = {
    data: undefined,
    dataUpdatedAt: 0,
    error: null,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'idle' as const,
    isError: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isEnabled: true,
    isPaused: false,
    isPending: true,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: false,
    promise: new Promise<TData>(() => {}),
    refetch: () => Promise.resolve(createStubQuery<TData>()),
    status: 'pending' as const,
  };
  return stub;
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

export function stubLearningExecutionLayer(): LearningExecutionLayer {
  return {
    copy: {
      completionTitle: 'Deep work plan advanced',
      emptyCta: 'Build a deep work path',
      emptyTitle: 'Attach the next work target',
      homeCta: 'Start deep work',
      homeTitle: 'Deep Work Plan',
      layerName: 'Deep Work Plan',
      setupCta: 'Start deep work block',
      setupEyebrow: 'Deep Work Plan',
    },
    dataModelImpact:
      'LearningExecutionLayer reuses content, generation, task, and session ids; only route metadata and adaptive copy are added.',
    persona: 'work',
    target: null,
  };
}
