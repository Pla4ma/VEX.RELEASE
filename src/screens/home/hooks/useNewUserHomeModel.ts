import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UseQueryResult } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { getNextBestAction } from '../../../features/progression/next-best-action';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeViewModel } from './home-view-model';
import type {
  HomeController,
  SessionHistoryResult,
} from './home-controller-types';
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../../navigation/types';
import { navigateToSessionStackScreen, navigateToMainTab } from '../../../navigation/navigation-helpers';
import {
  getFocusedMinutesForToday,
  getNextUnlockFeature,
} from './home-controller-helpers';
import {
  stubNavigationActions,
} from './home-controller-stubs';
import { buildNewUserController } from './new-user-home-controller-builder';
import type { StreakSummaryData, ProgressionData } from './home-query-types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface NewUserModelInput {
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
  };
  disclosure: FeatureAccessResult;
  historyQuery: SessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function useNewUserHomeModel(input: NewUserModelInput): HomeViewModel & {
  controller: HomeController;
} {
  const {
    analytics,
    disclosure,
    historyQuery,
    isOnline,
    progressionQuery,
    runtime,
    streakQuery,
    userId,
  } = input;

  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((state) => state.homeHighlight);
  const completionSync = useSessionUIStore((state) => state.completionSync);
  const clearHomeHighlight = useSessionUIStore(
    (state) => state.clearHomeHighlight,
  );

  const streakData = streakQuery.data as StreakSummaryData | undefined;
  const progData = progressionQuery.data as ProgressionData | undefined;
  const currentStreak = streakData?.currentDays ?? 0;
  const currentXp = progData?.xp ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum: number, entry) => sum + getFocusedMinutesForToday(entry),
    0,
  );
  const progressPercent = Math.min(
    100,
    Math.round((todayFocusMinutes / 120) * 100),
  );
  const isFirstRun =
    !disclosure.isPending &&
    disclosure.inputs.totalCompletedSessions === 0 &&
    currentStreak === 0 &&
    currentXp === 0;

  const stubActions = useMemo(() => stubNavigationActions(), []);
  const openSetup = useCallback(
    (params?: Record<string, unknown>): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(
          userId,
          (params as SessionStackParams['SessionSetup'] | undefined)?.source ??
            'home',
        );
      }
      navigateToSessionStackScreen(navigation, 'SessionSetup', (params ?? {}) as SessionStackParams['SessionSetup']);
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback((): void => {
    navigateToMainTab(navigation, 'Progress');
  }, [navigation]);

  const nextUnlockFeature = useMemo(
    () =>
      getNextUnlockFeature(
        disclosure.features as Record<
          string,
          { isUnlocked: boolean; isVisible: boolean; priority?: number }
        >,
      ),
    [disclosure.features],
  );

  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak,
    nextUnlockFeature,
  });

  const homeSpine = useHomeSpineModel({
    currentStreak,
    homeHighlight,
    isAtRisk: Boolean(streakData?.isAtRisk),
    isFirstRun,
    level: progData?.level ?? 1,
    progressPercent,
    progressXp: currentXp,
    returnReason: {
      body: nextBestAction.description,
      ctaLabel: nextBestAction.ctaLabel,
      eyebrow: 'Return reason',
      intent: 'start-session' as const,
      source: 'next-best-action' as const,
      title: nextBestAction.title,
      tone: 'default' as const,
    },
    todayFocusMinutes,
  });

  const isLoading =
    disclosure.isPending || streakQuery.isPending || progressionQuery.isPending;

  const controller = buildNewUserController({
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
    latestSession: historyQuery.history[0] ?? null,
    homeSpine,
    disclosure,
    runtime,
    streakQuery,
    progressionQuery,
    historyQuery,
    openSetup,
    openProgress,
    openSocial: stubActions.openSocial,
  });

  return {
    userId,
    isOnline,
    isLoading,
    isFirstRun,
    loadError: disclosure.error as Error | null,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    primaryRecommendation: null,
    homeSpine,
    returnReason: null,
    stage: disclosure.stage,
    productTier: disclosure.productTier,
    features: disclosure.features,
    runtime,
    controller,
  };
}
