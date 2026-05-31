import type { UseQueryResult } from '@tanstack/react-query';
import type { HomeHighlight, CompletionSyncState } from '../../../store/session-state';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeController, SessionHistoryResult } from './home-controller-types';
import {
  createStubQuery,
  stubCoachMutations,
  stubHomeReturnReason,
  stubLearningExecutionLayer,
  stubPrimaryRecommendation,
} from './home-controller-stubs';

export interface NewUserControllerInput {
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
  homeSpine: HomeSpineModel;
  disclosure: FeatureAccessResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  progressionQuery: UseQueryResult;
  historyQuery: SessionHistoryResult;
  openSetup: (params?: Record<string, unknown>) => void;
  openProgress: () => void;
  openSocial: () => void;
}

export function buildNewUserController(
  input: NewUserControllerInput,
): HomeController {
  return {
    user: null,
    userId: input.userId,
    isOnline: input.isOnline,
    isLoading: input.isLoading,
    isFirstRun: input.isFirstRun,
    loadError: input.loadError,
    homeHighlight: input.homeHighlight,
    completionSync: input.completionSync,
    clearHomeHighlight: input.clearHomeHighlight,
    currentStreak: input.currentStreak,
    currentXp: input.currentXp,
    todayFocusMinutes: input.todayFocusMinutes,
    progressPercent: input.progressPercent,
    latestSession: input.latestSession,
    primaryRecommendation: stubPrimaryRecommendation(),
    homeSpine: input.homeSpine,
    returnReason: stubHomeReturnReason,
    disclosure: input.disclosure,
    runtime: input.runtime,
    streakQuery: input.streakQuery as UseQueryResult,
    progressionQuery: input.progressionQuery as UseQueryResult,
    historyQuery: input.historyQuery as SessionHistoryResult,
    squadsQuery: createStubQuery() as UseQueryResult,
    activeStudyPlanQuery: createStubQuery() as UseQueryResult,
    learningExecutionLayer: stubLearningExecutionLayer(),
    comebackQuery: createStubQuery() as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult,
    recommendationsQuery: createStubQuery() as UseQueryResult,
    shouldShowSecondarySystems: input.runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: input.runtime.shouldShowExpansionSystems,
    openSetup: input.openSetup,
    openProgress: input.openProgress,
    openSocial: input.openSocial,
    openContentStudy: input.openSetup as () => void,
    continueStudyPlan: input.openSetup as () => void,
    createRecommendation: stubCoachMutations()
      .createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: stubCoachMutations()
      .updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: input.disclosure.refetchAll as () => Promise<unknown>,
    features: input.disclosure.features,
  };
}
