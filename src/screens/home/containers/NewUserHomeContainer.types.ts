import type { UseQueryResult } from '@tanstack/react-query';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';

export interface DisclosureAnalytics {
  consentGiven: boolean;
  lastSeen: number;
  variant: string;
}

export interface UseSessionHistoryResult {
  history: Array<{ id: string; startedAt: number }>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export interface StreakQueryData {
  currentDays?: number;
  isAtRisk?: boolean;
}

export interface ProgressionQueryData {
  xp?: number;
  level?: number;
}

export interface NewUserContainerInput {
  analytics: DisclosureAnalytics;
  disclosure: FeatureAccessResult;
  historyQuery: UseSessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult<unknown, Error>;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult<unknown, Error>;
  userId: string;
}
