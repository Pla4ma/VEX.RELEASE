import type { UseQueryResult } from '@tanstack/react-query';
import type { SessionRecommendation } from '../../../features/ai-coach';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeController, SessionHistoryResult } from './home-controller-types';
import type {} from './home-view-model';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import type { LearningExecutionLayer } from '../../../features/learning-execution';
import type { HomeHighlight, CompletionSyncState } from '../../../store/session-state';

interface BuildControllerParams {
  userId: string;
  isOnline: boolean;
  isLoading: boolean;
  isFirstRun: boolean;
  loadError: Error | null;
  homeHighlight: unknown;
  completionSync: unknown;
  clearHomeHighlight: () => void;
  currentStreak: number;
  currentXp: number;
  todayFocusMinutes: number;
  progressPercent: number;
  latestSession: unknown;
  primaryRecommendation: SessionRecommendation | null;
  homeSpine: unknown;
  displayedReturnReason: HomeReturnReason;
  disclosure: FeatureAccessResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  progressionQuery: UseQueryResult;
  historyQuery: SessionHistoryResult;
  activeStudyPlanQuery: UseQueryResult;
  learningExecutionLayer: unknown;
  comebackQuery: UseQueryResult;
  activeBossQuery: UseQueryResult;
  recommendationsQuery: UseQueryResult;
  openSetup: (params?: Record<string, unknown>) => void;
  openProgress: () => void;
  openSocial: () => void;
  openContentStudy: () => void;
  continueStudyPlan: () => void;
  createRecommendation: unknown;
  updateRecommendationStatus: unknown;
  squadsQuery: UseQueryResult;
}

export function buildHomeController(p: BuildControllerParams): HomeController {
  return {
    user: null,
    userId: p.userId,
    isOnline: p.isOnline,
    isLoading: p.isLoading,
    isFirstRun: p.isFirstRun,
    loadError: p.loadError,
    homeHighlight: p.homeHighlight as HomeHighlight | null,
    completionSync: p.completionSync as CompletionSyncState,
    clearHomeHighlight: p.clearHomeHighlight,
    currentStreak: p.currentStreak,
    currentXp: p.currentXp,
    todayFocusMinutes: p.todayFocusMinutes,
    progressPercent: p.progressPercent,
    latestSession: p.latestSession as HomeController['latestSession'],
    primaryRecommendation: p.primaryRecommendation,
    homeSpine: p.homeSpine as HomeSpineModel,
    returnReason: p.displayedReturnReason,
    disclosure: p.disclosure,
    runtime: p.runtime,
    streakQuery: p.streakQuery,
    progressionQuery: p.progressionQuery,
    historyQuery: p.historyQuery,
    squadsQuery: p.squadsQuery,
    activeStudyPlanQuery: p.activeStudyPlanQuery,
    learningExecutionLayer: p.learningExecutionLayer as LearningExecutionLayer,
    comebackQuery: p.comebackQuery,
    activeBossQuery: p.activeBossQuery,
    recommendationsQuery: p.recommendationsQuery,
    shouldShowSecondarySystems: p.runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: p.runtime.shouldShowExpansionSystems,
    openSetup: p.openSetup,
    openProgress: p.openProgress,
    openSocial: p.openSocial,
    openPlan: () => {},
    openCoach: () => {},
    openContentStudy: p.openContentStudy,
    continueStudyPlan: p.continueStudyPlan,
    createRecommendation: p.createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: p.updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: p.disclosure.refetchAll as () => Promise<unknown>,
    features: p.disclosure.features,
  };
}
