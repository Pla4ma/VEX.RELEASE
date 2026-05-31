import type { UseQueryResult } from '@tanstack/react-query';
import type { SessionRecommendation } from '../../../features/ai-coach';
import type { LearningExecutionLayer } from '../../../features/learning-execution';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeController, SessionHistoryResult } from '../hooks/home-controller-types';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { HomeHighlight, CompletionSyncState } from '../../../store/session-state';
import { createStubQuery } from '../hooks/home-controller-stubs';

export function buildController(params: {
  userId: string;
  isOnline: boolean;
  disclosure: FeatureAccessResult;
  recommendationsPending: boolean;
  isFirstRun: boolean;
  loadError: Error | null;
  homeHighlight: HomeHighlight | null;
  completionSync: CompletionSyncState;
  clearHomeHighlight: () => void;
  currentStreak: number;
  currentXp: number;
  todayFocusMinutes: number;
  progressPercent: number;
  historyQuery: SessionHistoryResult;
  primaryRecommendation: SessionRecommendation | null;
  homeSpine: HomeSpineModel;
  displayedReturnReason: HomeReturnReason;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  progressionQuery: UseQueryResult;
  activeStudyPlanQuery: UseQueryResult;
  learningExecutionLayer: LearningExecutionLayer;
  comebackQuery: UseQueryResult;
  activeBossQuery: UseQueryResult | null;
  createRecommendation: HomeController['createRecommendation'];
  updateRecommendationStatus: HomeController['updateRecommendationStatus'];
  openSetup: (params?: Record<string, unknown>) => void;
  openProgress: () => void;
  openSocial: () => void;
  openContentStudy: () => void;
  continueStudyPlan: () => void;
}): HomeController {
  const {
    userId,
    isOnline,
    disclosure,
    recommendationsPending,
    isFirstRun,
    loadError,
    homeHighlight,
    completionSync,
    clearHomeHighlight,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    historyQuery,
    primaryRecommendation,
    homeSpine,
    displayedReturnReason,
    runtime,
    streakQuery,
    progressionQuery,
    activeStudyPlanQuery,
    learningExecutionLayer,
    comebackQuery,
    activeBossQuery,
    createRecommendation,
    updateRecommendationStatus,
    openSetup,
    openProgress,
    openSocial,
    openContentStudy,
    continueStudyPlan,
  } = params;

  return {
    user: null,
    userId,
    isOnline,
    isLoading: disclosure.isLoading || recommendationsPending,
    isFirstRun,
    loadError,
    homeHighlight,
    completionSync,
    clearHomeHighlight,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    latestSession: historyQuery.history[0] ?? null,
    primaryRecommendation,
    homeSpine,
    returnReason: displayedReturnReason,
    disclosure,
    runtime,
    streakQuery,
    progressionQuery,
    historyQuery,
    squadsQuery: createStubQuery() as UseQueryResult,
    activeStudyPlanQuery: activeStudyPlanQuery as UseQueryResult,
    learningExecutionLayer,
    comebackQuery: comebackQuery as UseQueryResult,
    activeBossQuery: (activeBossQuery ?? createStubQuery()) as UseQueryResult,
    recommendationsQuery: {} as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup,
    openProgress,
    openSocial,
    openContentStudy,
    continueStudyPlan,
    createRecommendation,
    updateRecommendationStatus,
    retryAll: disclosure.refetchAll as () => Promise<unknown>,
    features: disclosure.features,
  };
}
