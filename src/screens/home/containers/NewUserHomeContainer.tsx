import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { getNextBestAction } from '../../../features/progression/next-best-action';
import type {} from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { HomeController } from '../hooks/home-controller-types';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import {
  navigateToSessionStackScreen,
  navigateToMainTab,
} from '../../../navigation/navigation-helpers';
import {
  getFocusedMinutesForToday,
  getNextUnlockFeature,
} from '../hooks/home-controller-helpers';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  stubNavigationActions,
} from '../hooks/home-controller-stubs';
import { buildContainerController } from './new-user-container-controller-builder';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface StreakQueryData {
  currentDays?: number;
  isAtRisk?: boolean;
}
interface ProgressionQueryData {
  xp?: number;
  level?: number;
}

export interface NewUserContainerInput {
  analytics: ReturnType<
    typeof import('../../../features/liveops-config').useDisclosureAnalytics
  >;
  disclosure: ReturnType<
    typeof import('../../../features/liveops-config').useFeatureAccess
  >;
  historyQuery: ReturnType<
    typeof import('../../../session/hooks/useSession').useSessionHistory
  >;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function useNewUserContainerModel(
  input: NewUserContainerInput,
): HomeViewModel & {
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

  const streakData = streakQuery.data as StreakQueryData | undefined;
  const progData = progressionQuery.data as ProgressionQueryData | undefined;
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
    (params: SessionStackParams['SessionSetup'] = {}): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(userId, 'home');
      }
      navigateToSessionStackScreen(navigation, 'SessionSetup', params);
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback((): void => {
    navigateToMainTab(navigation, 'Progress');
  }, [navigation]);

  const openPlan = useCallback((): void => {
    navigateToMainTab(navigation, 'Progress');
  }, [navigation]);

  const openCoach = useCallback((): void => {
    navigation.navigate('AICoach');
  }, [navigation]);

  const nextUnlockFeature = useMemo(
    () => getNextUnlockFeature(disclosure.features),
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

  const controller = buildContainerController({
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
    openPlan,
    openCoach,
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
