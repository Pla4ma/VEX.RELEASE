import type { UseQueryResult } from "@tanstack/react-query";
import type { HomeFeatureRuntime } from "../hooks/home-feature-runtime";
import type { HomeController, SessionHistoryResult } from "../hooks/home-controller-types";
import type { SessionRecommendation } from "../../../features/ai-coach";
import type { FeatureAccessResult } from "../../../features/liveops-config";
import type { HomeSpineModel } from "../../../features/home-spine/schemas";
import type { HomeReturnReason } from "../hooks/useHomeReturnReason";
import type { LearningExecutionLayer } from "../../../features/learning-execution";
import type { HomeHighlight, CompletionSyncState } from "../../../store/session-state";
import type { StreakQueryData, ProgressionQueryData } from "./engaged-home-types";
import { createStubQuery } from "../hooks/home-controller-stubs";

interface BuildControllerInput {
  activeStudyPlanQuery: UseQueryResult;
  clearHomeHighlight: () => void;
  completionSync: CompletionSyncState;
  comebackQuery: UseQueryResult;
  createRecommendation: HomeController["createRecommendation"];
  currentStreak: number;
  currentXp: number;
  disclosure: FeatureAccessResult;
  displayedReturnReason: HomeReturnReason;
  historyQuery: SessionHistoryResult;
  homeHighlight: HomeHighlight | null;
  homeSpine: HomeSpineModel;
  isFirstRun: boolean;
  isOnline: boolean;
  learningExecutionLayer: LearningExecutionLayer;
  loadError: Error | null;
  primaryRecommendation: SessionRecommendation | null | undefined;
  progressPercent: number;
  progressionQuery: UseQueryResult;
  recommendationsPending: boolean;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  todayFocusMinutes: number;
  updateRecommendationStatus: HomeController["updateRecommendationStatus"];
  userId: string;
  actions: {
    openSetup: (params?: Record<string, unknown>) => void;
    openProgress: () => void;
    openSocial: () => void;
    openContentStudy: () => void;
    continueStudyPlan: () => void;
  };
}

export function buildHomeController(input: BuildControllerInput): HomeController {
  const {
    activeStudyPlanQuery,
    clearHomeHighlight,
    completionSync,
    comebackQuery,
    createRecommendation,
    currentStreak,
    currentXp,
    disclosure,
    displayedReturnReason,
    historyQuery,
    homeHighlight,
    homeSpine,
    isFirstRun,
    isOnline,
    learningExecutionLayer,
    loadError,
    primaryRecommendation,
    progressPercent,
    progressionQuery,
    recommendationsPending,
    runtime,
    streakQuery,
    todayFocusMinutes,
    updateRecommendationStatus,
    userId,
    actions,
  } = input;

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
    primaryRecommendation: primaryRecommendation ?? null,
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
    activeBossQuery: createStubQuery() as UseQueryResult,
    recommendationsQuery: {} as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup: actions.openSetup,
    openProgress: actions.openProgress,
    openSocial: actions.openSocial,
    openContentStudy: actions.openContentStudy,
    continueStudyPlan: actions.continueStudyPlan,
    createRecommendation:
      createRecommendation as HomeController["createRecommendation"],
    updateRecommendationStatus:
      updateRecommendationStatus as HomeController["updateRecommendationStatus"],
    retryAll: disclosure.refetchAll as () => Promise<unknown>,
    features: disclosure.features,
  };
}
