import type { UseQueryResult } from "@tanstack/react-query";
import type { HomeFeatureRuntime } from "../hooks/home-feature-runtime";
import type { HomeController, SessionHistoryResult } from "../hooks/home-controller-types";
import type { SessionRecommendation } from "../../../features/ai-coach";
import type { FeatureAccessResult } from "../../../features/liveops-config";
import type { HomeSpineModel } from "../../../features/home-spine/schemas";
import type { HomeReturnReason } from "../hooks/useHomeReturnReason";
import type { LearningExecutionLayer } from "../../../features/learning-execution";
import type { StreakQueryData, ProgressionQueryData } from "./engaged-home-types";
import { createStubQuery } from "../hooks/home-controller-stubs";

interface BuildControllerInput {
  activeStudyPlanQuery: UseQueryResult;
  clearHomeHighlight: () => void;
  completionSync: unknown;
  comebackQuery: UseQueryResult;
  createRecommendation: unknown;
  currentStreak: number;
  currentXp: number;
  disclosure: FeatureAccessResult;
  displayedReturnReason: HomeReturnReason;
  historyQuery: SessionHistoryResult;
  homeHighlight: unknown;
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
  updateRecommendationStatus: unknown;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    homeHighlight: homeHighlight as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    completionSync: completionSync as any,
    clearHomeHighlight,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    latestSession: (historyQuery.history[0] ?? null) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    primaryRecommendation: primaryRecommendation as any,
    homeSpine,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    returnReason: displayedReturnReason as any,
    disclosure,
    runtime,
    streakQuery,
    progressionQuery,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    historyQuery: historyQuery as any,
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
