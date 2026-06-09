import type {} from '../../../navigation/param-types';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  FeatureAccessResult,
  FeatureAccessMap,
} from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { SessionRecommendation } from '../../../features/ai-coach';
import type { HomeSpineModel } from '../../../features/home-spine/schemas';
import type { LearningExecutionLayer } from '../../../features/learning-execution';
import type { SessionHistoryEntry } from '../../../session/types';
import type {
  CompletionSyncState,
  HomeHighlight,
} from '../../../store/session-state';

export interface SessionHistoryResult {
  history: SessionHistoryEntry[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export interface HomeController {
  user: unknown;
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
  returnReason: HomeReturnReason | null;
  disclosure: FeatureAccessResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  progressionQuery: UseQueryResult;
  historyQuery: SessionHistoryResult;
  squadsQuery: UseQueryResult;
  activeStudyPlanQuery: UseQueryResult;
  learningExecutionLayer: LearningExecutionLayer;
  comebackQuery: UseQueryResult;
  activeBossQuery: UseQueryResult;
  recommendationsQuery: UseQueryResult;
  shouldShowSecondarySystems: boolean;
  shouldShowExpansionSystems: boolean;
  openSetup: (params?: Record<string, unknown>) => void;
  openProgress: () => void;
  openSocial: () => void;
  openContentStudy: () => void;
  continueStudyPlan: () => void;
  createRecommendation: {
    mutate: (vars: unknown) => void;
    mutateAsync: (vars: unknown) => Promise<unknown>;
    isPending: boolean;
    reset: () => void;
  };
  updateRecommendationStatus: {
    mutate: (vars: unknown) => void;
    mutateAsync: (vars: unknown) => Promise<unknown>;
    isPending: boolean;
    reset: () => void;
  };
  retryAll: () => Promise<unknown>;
  features: FeatureAccessMap;
}
