import type { UseQueryResult } from '@tanstack/react-query';
import { useSessionUIStore } from '../../../store/session-state';
import { createStubQuery, stubLearningExecutionLayer, stubCoachMutations, stubNavigationActions } from '../hooks/home-controller-stubs';
import type { HomeController, SessionHistoryResult } from '../hooks/home-controller-types';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import type { SessionHistoryEntry } from '../../../session/types';

export function buildActivatingController(params: {
  userId: string;
  isOnline: boolean;
  isLoading: boolean;
  isFirstRun: boolean;
  currentStreak: number;
  currentXp: number;
  todayFocusMinutes: number;
  progressPercent: number;
  latestSession: SessionHistoryEntry | null;
  homeSpine: HomeSpineModel;
  returnReason: HomeController['returnReason'];
  disclosure: FeatureAccessResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  progressionQuery: UseQueryResult;
  historyQuery: SessionHistoryResult;
  openSetup: HomeController['openSetup'];
  openProgress: () => void;
  openPlan: () => void;
  openCoach: () => void;
}): HomeController {
  const {
    userId, isOnline, isLoading, isFirstRun, currentStreak, currentXp,
    todayFocusMinutes, progressPercent, latestSession, homeSpine, returnReason,
    disclosure, runtime, streakQuery, progressionQuery, historyQuery,
    openSetup, openProgress, openPlan, openCoach,
  } = params;

  const homeHighlight = useSessionUIStore.getState().homeHighlight;
  const completionSync = useSessionUIStore.getState().completionSync;
  const clearHomeHighlight = useSessionUIStore.getState().clearHomeHighlight;
  const stubActions = stubNavigationActions();

  return {
    user: null,
    userId,
    isOnline,
    isLoading,
    isFirstRun,
    loadError: disclosure.error as Error | null,
    homeHighlight,
    completionSync,
    clearHomeHighlight,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    latestSession,
    primaryRecommendation: null,
    homeSpine,
    returnReason,
    disclosure,
    runtime,
    streakQuery,
    progressionQuery,
    historyQuery,
    squadsQuery: createStubQuery() as UseQueryResult,
    activeStudyPlanQuery: createStubQuery() as UseQueryResult,
    learningExecutionLayer: stubLearningExecutionLayer(),
    comebackQuery: createStubQuery() as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult,
    recommendationsQuery: createStubQuery() as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup,
    openProgress,
    openSocial: stubActions.openSocial,
    openPlan,
    openCoach,
    openContentStudy: openSetup as () => void,
    continueStudyPlan: openSetup as () => void,
    createRecommendation: stubCoachMutations().createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: stubCoachMutations().updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: disclosure.refetchAll,
    features: disclosure.features,
  };
}