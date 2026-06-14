import type { UseQueryResult } from '@tanstack/react-query';
import type { SessionStackParams } from '../../../navigation/types';
import type { HomeHighlight, CompletionSyncState } from '../../../store/session-state';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { HomeController, SessionHistoryResult } from '../hooks/home-controller-types';
import {
  createStubQuery,
  stubCoachMutations,
  stubHomeReturnReason,
  stubLearningExecutionLayer,
} from '../hooks/home-controller-stubs';

export interface ContainerControllerInput {
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
  openSetup: (params?: SessionStackParams['SessionSetup']) => void;
  openProgress: () => void;
  openSocial: () => void;
  openPlan?: () => void;
  openCoach?: () => void;
}

export function buildContainerController(
  input: ContainerControllerInput,
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
    primaryRecommendation: null,
    homeSpine: input.homeSpine,
    returnReason: stubHomeReturnReason,
    disclosure: input.disclosure,
    runtime: input.runtime,
    streakQuery: input.streakQuery,
    progressionQuery: input.progressionQuery,
    historyQuery: input.historyQuery,
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
    openPlan: input.openPlan ?? input.openProgress,
    openCoach: input.openCoach ?? input.openSetup as () => void,
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
