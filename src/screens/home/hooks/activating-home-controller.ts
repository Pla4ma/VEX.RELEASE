import type { UseQueryResult } from '@tanstack/react-query';
import type {
  HomeController,
  SessionHistoryResult,
} from './home-controller-types';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeViewModel } from './home-view-model';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { SessionRecommendation } from '../../../features/ai-coach';
import type {
  CompletionSyncState,
  HomeHighlight,
} from '../../../store/session-state';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import { createStubQuery, stubLearningExecutionLayer } from './home-controller-stubs';

interface ActivatingControllerParams {
  userId: string;
  isOnline: boolean;
  isLoading: boolean;
  isFirstRun: boolean;
  loadError: Error | null;
  homeHighlight: HomeHighlight | null;
  completionSync: CompletionSyncState;
  clearHomeHighlight: () => void;
  currentStreak: number;
  currentXp: number;
  todayFocusMinutes: number;
  progressPercent: number;
  latestSession: SessionHistoryResult['history'][number] | null;
  primaryRecommendation: SessionRecommendation | null;
  homeSpine: HomeSpineModel;
  displayedReturnReason: HomeReturnReason | null;
  disclosure: FeatureAccessResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  progressionQuery: UseQueryResult;
  historyQuery: SessionHistoryResult;
  recommendationsQuery: UseQueryResult;
  openSetup: (params?: Record<string, unknown>) => void;
  openProgress: () => void;
  openSocial: () => void;
  createRecommendation: HomeController['createRecommendation'];
  updateRecommendationStatus: HomeController['updateRecommendationStatus'];
}

export function buildActivatingController(
  params: ActivatingControllerParams,
): HomeController {
  return {
    user: null,
    userId: params.userId,
    isOnline: params.isOnline,
    isLoading: params.isLoading,
    isFirstRun: params.isFirstRun,
    loadError: params.loadError,
    homeHighlight: params.homeHighlight,
    completionSync: params.completionSync,
    clearHomeHighlight: params.clearHomeHighlight,
    currentStreak: params.currentStreak,
    currentXp: params.currentXp,
    todayFocusMinutes: params.todayFocusMinutes,
    progressPercent: params.progressPercent,
    latestSession: params.latestSession,
    primaryRecommendation: params.primaryRecommendation,
    homeSpine: params.homeSpine,
    returnReason: params.displayedReturnReason,
    disclosure: params.disclosure,
    runtime: params.runtime,
    streakQuery: params.streakQuery as UseQueryResult,
    progressionQuery: params.progressionQuery as UseQueryResult,
    historyQuery: params.historyQuery as SessionHistoryResult,
    squadsQuery: createStubQuery() as UseQueryResult,
    activeStudyPlanQuery: createStubQuery() as UseQueryResult,
    learningExecutionLayer: stubLearningExecutionLayer(),
    comebackQuery: createStubQuery() as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult,
    recommendationsQuery: params.recommendationsQuery as UseQueryResult,
    shouldShowSecondarySystems: params.runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: params.runtime.shouldShowExpansionSystems,
    openSetup: params.openSetup as (params?: Record<string, unknown>) => void,
    openProgress: params.openProgress,
    openSocial: params.openSocial,
    openPlan: () => {},
    openCoach: () => {},
    openContentStudy: params.openSetup as () => void,
    continueStudyPlan: params.openSetup as () => void,
    createRecommendation: params.createRecommendation,
    updateRecommendationStatus: params.updateRecommendationStatus,
    retryAll: params.disclosure.refetchAll as () => Promise<unknown>,
    features: params.disclosure.features,
  };
}

export function buildActivatingHomeReturnValue(
  controller: HomeController,
  params: {
    userId: string;
    isOnline: boolean;
    isLoading: boolean;
    isFirstRun: boolean;
    loadError: Error | null;
    currentStreak: number;
    currentXp: number;
    todayFocusMinutes: number;
    progressPercent: number;
    primaryRecommendation: SessionRecommendation | null;
    homeSpine: HomeSpineModel;
    displayedReturnReason: HomeReturnReason | null;
    disclosure: FeatureAccessResult;
    runtime: HomeFeatureRuntime;
  },
): HomeViewModel & { controller: HomeController } {
  return {
    userId: params.userId,
    isOnline: params.isOnline,
    isLoading: params.isLoading,
    isFirstRun: params.isFirstRun,
    loadError: params.loadError,
    currentStreak: params.currentStreak,
    currentXp: params.currentXp,
    todayFocusMinutes: params.todayFocusMinutes,
    progressPercent: params.progressPercent,
    primaryRecommendation: params.primaryRecommendation,
    homeSpine: params.homeSpine,
    returnReason: params.displayedReturnReason,
    stage: params.disclosure.stage,
    productTier: params.disclosure.productTier,
    features: params.disclosure.features,
    runtime: params.runtime,
    controller,
  };
}
