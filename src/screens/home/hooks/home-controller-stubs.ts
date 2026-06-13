import type { UseQueryResult } from '@tanstack/react-query';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { SessionRecommendation } from '../../../features/ai-coach';
import type { LearningExecutionLayer } from '../../../features/learning-execution';

const stubRef = Symbol('stub-query');

export function createStubQuery<TData = unknown>(): UseQueryResult<TData> {
  const stub: UseQueryResult<TData> = {
    data: undefined as TData,
    dataUpdatedAt: 0,
    error: null,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'idle',
    isEnabled: true,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    promise: Promise.resolve() as Promise<TData>,
    refetch: async () => stub,
    status: 'success',
  };
  return stub;
}

export function stubNavigationActions() {
  return {
    openSetup: (): void => {},
    openProgress: (): void => {},
    openSocial: (): void => {},
    openContentStudy: (): void => {},
    continueStudyPlan: (): void => {},
    openNextAction: (): void => {},
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
      errorTitle: 'Plan unavailable',
      errorCta: 'Retry deep work plan',
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
