/**
 * NewUserHomeContainer
 *
 * STAGE: NEW_USER (0 completed sessions)
 *
 * Allowed hooks:
 *   - useStreakSummary, useProgressionSummary, useSessionHistory
 *   - useHomeSpineModel, getNextBestAction
 *
 * NEVER imports or calls:
 *   - useActiveBoss, useBossTemplates, useUserSquads
 *   - useActiveStudyPlan, useLearningExecutionLayer
 *   - useCreateRecommendation, useUpdateRecommendationStatus
 *   - advanced coach recommendation queries
 *   - challenge hooks, weekly quest hooks, daily dungeon hooks
 *   - economy/wallet hooks, battle pass hooks, shop/inventory hooks
 */

import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { getNextBestAction } from '../../../features/progression';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { HomeController } from '../hooks/home-controller-types';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import { getFocusedMinutesForToday, getNextUnlockFeature } from '../hooks/home-controller-helpers';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  createStubQuery,
  stubNavigationActions,
  stubCoachMutations,
  stubHomeReturnReason,
  stubLearningExecutionLayer,
} from '../hooks/home-controller-stubs';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export interface NewUserContainerInput {
  analytics: ReturnType<typeof import('../../../features/liveops-config').useDisclosureAnalytics>;
  disclosure: ReturnType<typeof import('../../../features/liveops-config').useFeatureAccess>;
  historyQuery: ReturnType<typeof import('../../../session/hooks/useSession').useSessionHistory>;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function useNewUserContainerModel(input: NewUserContainerInput): HomeViewModel & {
  controller: HomeController;
} {
  const { analytics, disclosure, historyQuery, isOnline, progressionQuery, runtime, streakQuery, userId } = input;

  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((state) => state.homeHighlight);
  const completionSync = useSessionUIStore((state) => state.completionSync);
  const clearHomeHighlight = useSessionUIStore((state) => state.clearHomeHighlight);

  const streakData = streakQuery.data as Record<string, unknown> | undefined;
  const progData = progressionQuery.data as Record<string, unknown> | undefined;
  const currentStreak = (streakData?.currentDays as number | undefined) ?? 0;
  const currentXp = (progData?.xp as number | undefined) ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum: number, entry) => sum + getFocusedMinutesForToday(entry),
    0,
  );
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun =
    !disclosure.isLoading &&
    disclosure.inputs.totalCompletedSessions === 0 &&
    currentStreak === 0 &&
    currentXp === 0;

  const stubActions = useMemo(() => stubNavigationActions(), []);

  const openSetup = useCallback(
    (params?: Record<string, unknown>): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(
          userId,
          (params as SessionStackParams['SessionSetup'] | undefined)?.source ?? 'home',
        );
      }
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: (params ?? {}) as SessionStackParams['SessionSetup'],
      });
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback((): void => {
    navigation.navigate('Main', { screen: 'Progress' });
  }, [navigation]);

  const nextUnlockFeature = useMemo(
    () =>
      getNextUnlockFeature(
        disclosure.features as Record<string, { isUnlocked: boolean; isVisible: boolean; priority?: number }>,
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
    level: (progData?.level as number | undefined) ?? 1,
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

  const isLoading = disclosure.isLoading || streakQuery.isLoading || progressionQuery.isLoading;

  const controller: HomeController = {
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
    latestSession: historyQuery.history[0] ?? null,
    primaryRecommendation: null,
    homeSpine,
    returnReason: stubHomeReturnReason,
    disclosure,
    runtime,
    streakQuery: streakQuery as UseQueryResult,
    progressionQuery: progressionQuery as UseQueryResult,
    historyQuery,
    squadsQuery: createStubQuery() as UseQueryResult,
    activeStudyPlanQuery: createStubQuery() as UseQueryResult,
    learningExecutionLayer: stubLearningExecutionLayer(),
    comebackQuery: createStubQuery() as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult,
    recommendationsQuery: createStubQuery() as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup: openSetup as (params?: Record<string, unknown>) => void,
    openProgress,
    openSocial: stubActions.openSocial,
    openContentStudy: openSetup as () => void,
    continueStudyPlan: openSetup as () => void,
    createRecommendation: stubCoachMutations().createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: stubCoachMutations().updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: disclosure.refetchAll as () => Promise<unknown>,
    features: disclosure.features,
  };

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
