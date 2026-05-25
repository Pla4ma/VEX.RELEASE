import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { useCreateRecommendation, useUpdateRecommendationStatus, type SessionRecommendation } from '../../../features/ai-coach';
import * as coachRepository from '../../../features/ai-coach/repository';
import { getNextBestAction } from '../../../features/progression';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeViewModel } from './home-view-model';
import type { HomeController, SessionHistoryResult } from './home-controller-types';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import { getFocusedMinutesForToday, getNextUnlockFeature, buildDisplayedReturnReason } from './home-controller-helpers';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { HomeReturnReason } from './useHomeReturnReason';
import { createStubQuery, stubLearningExecutionLayer, stubNavigationActions } from './home-controller-stubs';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface ActivatingModelInput {
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (stage: import("../../../features/liveops-config").UserExperienceStage, completedSessions: number) => void;
  };
  disclosure: FeatureAccessResult;
  historyQuery: SessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function useActivatingHomeModel(input: ActivatingModelInput): HomeViewModel & {
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
  const todayFocusMinutes = historyQuery.history.reduce((sum: number, entry) => sum + getFocusedMinutesForToday(entry), 0);
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun = !disclosure.isLoading && disclosure.inputs.totalCompletedSessions === 0 && currentStreak === 0 && currentXp === 0;

  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();

  const recommendationsQuery = useQuery({
    queryKey: ['coach', 'recommendations', userId],
    queryFn: () => coachRepository.fetchActiveRecommendations(userId),
    enabled: runtime.canQueryCoach && Boolean(userId) && !disclosure.isLoading,
    staleTime: 1000 * 60 * 5,
  });

  const primaryRecommendation = useMemo<SessionRecommendation | null>(
    () => (recommendationsQuery.data ?? [])
      .filter((item: { status: string; expiresAt: number }) => item.status === 'ACTIVE' && item.expiresAt > Date.now())
      .sort((a: { confidence?: number }, b: { confidence?: number }) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null,
    [recommendationsQuery.data],
  );

  const stubActions = useMemo(() => stubNavigationActions(), []);

  const openSetup = useCallback((params?: Record<string, unknown>): void => {
    if (userId && disclosure.inputs.totalCompletedSessions === 0) {
      analytics.trackFirstSessionStarted(userId, (params as SessionStackParams['SessionSetup'] | undefined)?.source ?? 'home');
    }
    navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
  }, [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId]);

  const openProgress = useCallback((): void => { navigation.navigate('Main', { screen: 'Progress' }); }, [navigation]);

  const openNextAction = useCallback((): void => {
    analytics.trackNextBestActionPressed(disclosure.stage, disclosure.inputs.totalCompletedSessions);
    openSetup();
  }, [analytics, disclosure.inputs.totalCompletedSessions, disclosure.stage, openSetup]);

  const nextUnlockFeature = useMemo(
    () => getNextUnlockFeature(disclosure.features as Record<string, { isUnlocked: boolean; isVisible: boolean; priority?: number }>),
    [disclosure.features],
  );

  const nextBestAction = getNextBestAction({ completedSessions: disclosure.inputs.totalCompletedSessions, currentStreak, nextUnlockFeature });

  const returnReason = useMemo<HomeReturnReason>(() => {
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan: null,
      canShowExpansionSystems: runtime.shouldShowExpansionSystems,
      comebackMessage: null,
      nextBestAction,
      primaryRecommendation: primaryRecommendation
        ? { id: primaryRecommendation.id, reasoning: (primaryRecommendation as Record<string, unknown>).reasoning as string ?? (primaryRecommendation as Record<string, unknown>).reason as string ?? '', suggestedDifficulty: primaryRecommendation.suggestedDifficulty ?? 'NORMAL', suggestedDuration: primaryRecommendation.suggestedDuration ?? 15 * 60, type: primaryRecommendation.recommendationType }
        : null,
    });

    const onPress: () => Promise<void> | void = reasonState.intent === 'accept-coach-recommendation' && reasonState.recommendationId
      ? async () => {
          await updateRecommendationStatus.mutateAsync({ recommendationId: reasonState.recommendationId!, status: 'ACCEPTED', userId });
          openSetup({ recommendationId: reasonState.recommendationId, suggestedDifficulty: reasonState.suggestedDifficulty, suggestedDurationSeconds: reasonState.suggestedDurationSeconds });
        }
      : reasonState.source === 'next-best-action' ? openNextAction : () => openSetup();

    return { body: reasonState.body, ctaLabel: reasonState.ctaLabel, eyebrow: reasonState.eyebrow, intent: reasonState.intent, onPress, source: reasonState.source, title: reasonState.title, tone: reasonState.tone };
  }, [nextBestAction, openNextAction, openSetup, primaryRecommendation, runtime.shouldShowExpansionSystems, updateRecommendationStatus, userId]);

  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight,
    isAtRisk: Boolean(streakData?.isAtRisk),
    isFirstRun, level: (progData?.level as number | undefined) ?? 1,
    progressPercent, progressXp: currentXp,
    returnReason: { body: returnReason.body, ctaLabel: returnReason.ctaLabel, eyebrow: returnReason.eyebrow, intent: returnReason.intent, source: returnReason.source, title: returnReason.title, tone: returnReason.tone },
    todayFocusMinutes,
  });

  const displayedReturnReason = useMemo(
    () => buildDisplayedReturnReason(homeSpine.returnReason, returnReason),
    [homeSpine.returnReason, returnReason],
  );

  const isLoading = disclosure.isLoading || recommendationsQuery.isLoading;

  const controller: HomeController = {
    user: null, userId, isOnline, isLoading, isFirstRun,
    loadError: disclosure.error as Error | null,
    homeHighlight, completionSync, clearHomeHighlight,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    latestSession: historyQuery.history[0] ?? null,
    primaryRecommendation, homeSpine, returnReason: displayedReturnReason,
    disclosure, runtime,
    streakQuery: streakQuery as UseQueryResult,
    progressionQuery: progressionQuery as UseQueryResult,
    historyQuery: historyQuery as SessionHistoryResult,
    squadsQuery: createStubQuery() as UseQueryResult,
    activeStudyPlanQuery: createStubQuery() as UseQueryResult,
    learningExecutionLayer: stubLearningExecutionLayer(),
    comebackQuery: createStubQuery() as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult,
    recommendationsQuery: recommendationsQuery as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup: openSetup as (params?: Record<string, unknown>) => void,
    openProgress,
    openSocial: stubActions.openSocial,
    openContentStudy: openSetup as () => void,
    continueStudyPlan: openSetup as () => void,
    createRecommendation: createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: disclosure.refetchAll as () => Promise<unknown>,
    features: disclosure.features,
  };

  return {
    userId, isOnline, isLoading, isFirstRun, loadError: disclosure.error as Error | null,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    primaryRecommendation, homeSpine, returnReason: displayedReturnReason,
    stage: disclosure.stage, productTier: disclosure.productTier,
    features: disclosure.features, runtime, controller,
  };
}


