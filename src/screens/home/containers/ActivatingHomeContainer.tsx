import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { getNextBestAction } from '../../../features/progression/next-best-action';
import { navigateToSessionStackScreen, navigateToMainTab, navigateToMainStackScreen } from '../../../navigation/navigation-helpers';
import type { SessionStackParams } from '../../../navigation/types';
import { getNextUnlockFeature } from '../hooks/home-controller-helpers';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';
import type { HomeController } from '../hooks/home-controller-types';
import type { HomeViewModel } from '../hooks/home-view-model';
import { computeActivatingState } from './ActivatingHomeContainer.state';
import { buildActivatingController } from './ActivatingHomeContainer.controller';
import type { Nav, ActivatingContainerInput } from './ActivatingHomeContainer.types';

export function useActivatingContainerModel(
  input: ActivatingContainerInput,
): HomeViewModel & { controller: HomeController } {
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
  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);

  const {
    streakData,
    progData,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    isFirstRun,
  } = computeActivatingState(disclosure, streakQuery, progressionQuery, historyQuery);

  const openSetup = useCallback(
    (params: SessionStackParams['SessionSetup'] = {}): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(userId, 'home');
      }
      navigateToSessionStackScreen(navigation, 'SessionSetup', params);
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback(() => {
    navigateToMainTab(navigation, 'Progress');
  }, [navigation]);
  const openPlan = useCallback(() => {
    navigateToMainTab(navigation, 'Progress');
  }, [navigation]);
  const openCoach = useCallback(() => {
    navigateToMainStackScreen(navigation, 'AICoach');
  }, [navigation]);
  const openNextAction = useCallback(() => {
    analytics.trackNextBestActionPressed(
      disclosure.stage,
      disclosure.inputs.totalCompletedSessions,
    );
    openSetup();
  }, [
    analytics,
    disclosure.inputs.totalCompletedSessions,
    disclosure.stage,
    openSetup,
  ]);

  const nextUnlockFeature = useMemo(
    () => getNextUnlockFeature(disclosure.features),
    [disclosure.features],
  );
  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak,
    nextUnlockFeature,
  });

  const returnReason = useMemo<HomeReturnReason>(() => {
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan: null,
      canShowExpansionSystems: runtime.shouldShowExpansionSystems,
      comebackMessage: null,
      nextBestAction,
      primaryRecommendation: null,
    });
    const onPress =
      reasonState.source === 'next-best-action'
        ? openNextAction
        : () => openSetup();
    return {
      body: reasonState.body,
      ctaLabel: reasonState.ctaLabel,
      eyebrow: reasonState.eyebrow,
      intent: reasonState.intent,
      onPress,
      source: reasonState.source,
      title: reasonState.title,
      tone: reasonState.tone,
    };
  }, [
    nextBestAction,
    openNextAction,
    openSetup,
    runtime.shouldShowExpansionSystems,
  ]);

  const homeSpine = useHomeSpineModel({
    currentStreak,
    homeHighlight,
    isAtRisk: Boolean(streakData?.isAtRisk),
    isFirstRun,
    level: progData?.level ?? 1,
    progressPercent,
    progressXp: currentXp,
    returnReason: {
      body: returnReason.body,
      ctaLabel: returnReason.ctaLabel,
      eyebrow: returnReason.eyebrow,
      intent: returnReason.intent,
      source: returnReason.source,
      title: returnReason.title,
      tone: returnReason.tone,
    },
    todayFocusMinutes,
  });

  const isLoading = disclosure.isPending;
  const controller = buildActivatingController({
    userId,
    isOnline,
    isLoading,
    isFirstRun,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    latestSession: historyQuery.history[0] ?? null,
    homeSpine,
    returnReason,
    disclosure,
    runtime,
    streakQuery,
    progressionQuery,
    historyQuery,
    openSetup,
    openProgress,
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
    returnReason,
    stage: disclosure.stage,
    productTier: disclosure.productTier,
    features: disclosure.features,
    runtime,
    controller,
  };
}