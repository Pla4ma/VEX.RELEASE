import type { UseQueryResult } from '@tanstack/react-query';
import type {
  HomeController,
  SessionHistoryResult,
} from './home-controller-types';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type {} from './home-view-model';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { LearningExecutionLayer } from '../../../features/learning-execution';
import type { SessionRecommendation } from '../../../features/ai-coach';
import type {
  CompletionSyncState,
  HomeHighlight,
} from '../../../store/session-state';
import type { SessionHistoryEntry } from '../../../session/types';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import { createStubQuery } from './home-controller-stubs';

interface ControllerParams {
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
  latestSession: SessionHistoryEntry | null;
  primaryRecommendation: SessionRecommendation | null;
  homeSpine: HomeSpineModel;
  displayedReturnReason: HomeReturnReason | null;
  disclosure: FeatureAccessResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  progressionQuery: UseQueryResult;
  historyQuery: SessionHistoryResult;
  activeStudyPlanQuery: UseQueryResult;
  learningExecutionLayer: LearningExecutionLayer;
  comebackQuery: UseQueryResult;
  recommendationsQuery: UseQueryResult;
  openSetup: (params?: Record<string, unknown>) => void;
  openProgress: () => void;
  openSocial: () => void;
  openContentStudy: () => void;
  continueStudyPlan: () => void;
  createRecommendation: HomeController['createRecommendation'];
  updateRecommendationStatus: HomeController['updateRecommendationStatus'];
}

export function buildEngagedController(
  params: ControllerParams,
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
    activeStudyPlanQuery: params.activeStudyPlanQuery as UseQueryResult,
    learningExecutionLayer: params.learningExecutionLayer,
    comebackQuery: params.comebackQuery as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult,
    recommendationsQuery: params.recommendationsQuery as UseQueryResult,
    shouldShowSecondarySystems: params.runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: params.runtime.shouldShowExpansionSystems,
    openSetup: params.openSetup as (params?: Record<string, unknown>) => void,
    openProgress: params.openProgress,
    openSocial: params.openSocial,
    openContentStudy: params.openContentStudy,
    continueStudyPlan: params.continueStudyPlan,
    createRecommendation:
      params.createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus:
      params.updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: params.disclosure.refetchAll as () => Promise<unknown>,
    features: params.disclosure.features,
  };
}
