import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UseQueryResult } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { getNextBestAction } from '../../../features/progression';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { HomeController, SessionHistoryResult } from '../hooks/home-controller-types';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { navigateToSessionStackScreen, navigateToMainTab } from '../../../navigation/navigation-helpers';
import { getFocusedMinutesForToday, getNextUnlockFeature } from '../hooks/home-controller-helpers';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';
import { createStubQuery, stubLearningExecutionLayer, stubNavigationActions, stubCoachMutations } from '../hooks/home-controller-stubs';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface StreakQueryData { currentDays?: number; isAtRisk?: boolean; }
interface ProgressionQueryData { xp?: number; level?: number; }

interface ActivatingContainerInput {
  analytics: { trackFirstSessionStarted: (userId: string, source: string) => void; trackNextBestActionPressed: (stage: import('../../../features/liveops-config').UserExperienceStage, completedSessions: number) => void };
  disclosure: FeatureAccessResult;
  historyQuery: SessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function useActivatingContainerModel(input: ActivatingContainerInput): HomeViewModel & { controller: HomeController } {
  const { analytics, disclosure, historyQuery, isOnline, progressionQuery, runtime, streakQuery, userId } = input;
  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);
  const completionSync = useSessionUIStore((s) => s.completionSync);
  const clearHomeHighlight = useSessionUIStore((s) => s.clearHomeHighlight);

  const streakData = streakQuery.data as StreakQueryData | undefined;
  const progData = progressionQuery.data as ProgressionQueryData | undefined;
  const currentStreak = streakData?.currentDays ?? 0;
  const currentXp = progData?.xp ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce((sum: number, e) => sum + getFocusedMinutesForToday(e), 0);
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun = !disclosure.isLoading && disclosure.inputs.totalCompletedSessions === 0 && currentStreak === 0 && currentXp === 0;

  const stubActions = useMemo(() => stubNavigationActions(), []);

  const openSetup = useCallback((params: Record<string, unknown> = {}): void => {
    if (userId && disclosure.inputs.totalCompletedSessions === 0) {
      analytics.trackFirstSessionStarted(userId, 'home');
    }
    navigateToSessionStackScreen(navigation, 'SessionSetup', params);
  }, [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId]);

  const openProgress = useCallback(() => { navigateToMainTab(navigation, 'Progress'); }, [navigation]);
  const openNextAction = useCallback(() => {
    analytics.trackNextBestActionPressed(disclosure.stage, disclosure.inputs.totalCompletedSessions);
    openSetup();
  }, [analytics, disclosure.inputs.totalCompletedSessions, disclosure.stage, openSetup]);

  const nextUnlockFeature = useMemo(
    () => getNextUnlockFeature(disclosure.features),
    [disclosure.features],
  );
  const nextBestAction = getNextBestAction({ completedSessions: disclosure.inputs.totalCompletedSessions, currentStreak, nextUnlockFeature });

  const returnReason = useMemo<HomeReturnReason>(() => {
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan: null, canShowExpansionSystems: runtime.shouldShowExpansionSystems,
      comebackMessage: null, nextBestAction, primaryRecommendation: null,
    });
    const onPress = reasonState.source === 'next-best-action' ? openNextAction : () => openSetup();
    return { body: reasonState.body, ctaLabel: reasonState.ctaLabel, eyebrow: reasonState.eyebrow, intent: reasonState.intent, onPress, source: reasonState.source, title: reasonState.title, tone: reasonState.tone };
  }, [nextBestAction, openNextAction, openSetup, runtime.shouldShowExpansionSystems]);

  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight, isAtRisk: Boolean(streakData?.isAtRisk), isFirstRun,
    level: progData?.level ?? 1, progressPercent, progressXp: currentXp,
    returnReason: { body: returnReason.body, ctaLabel: returnReason.ctaLabel, eyebrow: returnReason.eyebrow, intent: returnReason.intent, source: returnReason.source, title: returnReason.title, tone: returnReason.tone },
    todayFocusMinutes,
  });

  const isLoading = disclosure.isLoading;

  const controller: HomeController = {
    user: null, userId, isOnline, isLoading, isFirstRun, loadError: disclosure.error as Error | null,
    homeHighlight, completionSync, clearHomeHighlight, currentStreak, currentXp, todayFocusMinutes, progressPercent,
    latestSession: historyQuery.history[0] ?? null, primaryRecommendation: null, homeSpine, returnReason,
    disclosure, runtime,
    streakQuery, progressionQuery, historyQuery,
    squadsQuery: createStubQuery() as UseQueryResult, activeStudyPlanQuery: createStubQuery() as UseQueryResult,
    learningExecutionLayer: stubLearningExecutionLayer(), comebackQuery: createStubQuery() as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult, recommendationsQuery: createStubQuery() as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems, shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup, openProgress,
    openSocial: stubActions.openSocial, openContentStudy: openSetup as () => void, continueStudyPlan: openSetup as () => void,
    createRecommendation: stubCoachMutations().createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: stubCoachMutations().updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: disclosure.refetchAll as () => Promise<unknown>,
    features: disclosure.features,
  };

  return {
    userId, isOnline, isLoading, isFirstRun, loadError: disclosure.error as Error | null,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    primaryRecommendation: null, homeSpine, returnReason,
    stage: disclosure.stage, productTier: disclosure.productTier,
    features: disclosure.features, runtime, controller,
  };
}
