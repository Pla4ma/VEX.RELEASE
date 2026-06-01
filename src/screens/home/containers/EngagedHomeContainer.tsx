import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  useActiveCoachRecommendations,
} from '../../../features/ai-coach';
import { useActiveStudyPlan } from '../../../features/content-study';
import {
  buildLearningSessionParams,
  useLearningExecutionLayer,
} from '../../../features/learning-execution';
import { useComebackState } from '../../../features/streaks/hooks';
import { getNextBestAction } from '../../../features/progression';
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../../../features/liveops-config';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { HomeController } from '../hooks/home-controller-types';
import { navigateToSessionStackScreen } from '../../../navigation/navigation-helpers';
import {
  getFocusedMinutesForToday,
  getNextUnlockFeature,
  buildDisplayedReturnReason,
} from '../hooks/home-controller-helpers';
import type {
  EngagedContainerInput,
  Nav,
  StreakQueryData,
  ProgressionQueryData,
} from './engaged-home-types';
import { useEngagedActions, useEngagedReturnReason } from './engaged-home-helpers';
import { buildHomeController } from './engaged-home-controller';

export function useEngagedContainerModel(
  input: EngagedContainerInput,
): HomeViewModel & { controller: HomeController } {
  const {
    analytics, disclosure, historyQuery, isOnline,
    progressionQuery, runtime, streakQuery, userId,
  } = input;
  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);
  const completionSync = useSessionUIStore((s) => s.completionSync);
  const clearHomeHighlight = useSessionUIStore((s) => s.clearHomeHighlight);

  const streakData = streakQuery.data as StreakQueryData | undefined;
  const progData = progressionQuery.data as ProgressionQueryData | undefined;
  const currentStreak = streakData?.currentDays ?? 0;
  const currentXp = progData?.xp ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum: number, e) => sum + getFocusedMinutesForToday(e), 0,
  );
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun =
    !disclosure.isLoading &&
    disclosure.inputs.totalCompletedSessions === 0 &&
    currentStreak === 0 && currentXp === 0;

  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();
  const activeStudyPlanQuery = useActiveStudyPlan({ enabled: runtime.canQueryStudy });
  const learningExecutionLayer = useLearningExecutionLayer(activeStudyPlanQuery.data ?? null);
  const comebackQuery = useComebackState(runtime.canQueryComeback ? userId : null);
  const { primaryRecommendation, isPending: recommendationsPending } =
    useActiveCoachRecommendations(userId, runtime.canQueryCoach && !disclosure.isLoading);

  const canNavigateContentStudy = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.content_study),
  );
  const canNavigateSocial = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.social_tab),
  );

  const openSetup = useCallback(
    (params: Record<string, unknown> = {}): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(userId, 'home');
      }
      navigateToSessionStackScreen(navigation, 'SessionSetup', params);
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const actions = useEngagedActions({
    analytics, canNavigateContentStudy, canNavigateSocial,
    disclosure, learningExecutionLayer, navigation, openSetup, userId,
  });

  const nextUnlockFeature = useMemo(() => getNextUnlockFeature(disclosure.features), [disclosure.features]);
  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak, nextUnlockFeature,
  });

  const returnReason = useEngagedReturnReason({
    activeStudyPlanQuery, comebackQuery,
    continueStudyPlan: actions.continueStudyPlan, nextBestAction,
    openNextAction: actions.openNextAction, openSetup,
    primaryRecommendation, runtime, updateRecommendationStatus, userId,
  });

  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight,
    isAtRisk: Boolean(streakData?.isAtRisk), isFirstRun,
    level: progData?.level ?? 1, progressPercent, progressXp: currentXp,
    returnReason: {
      body: returnReason.body, ctaLabel: returnReason.ctaLabel,
      eyebrow: returnReason.eyebrow, intent: returnReason.intent,
      source: returnReason.source, title: returnReason.title, tone: returnReason.tone,
    },
    todayFocusMinutes,
  });

  const displayedReturnReason = useMemo(
    () => buildDisplayedReturnReason(homeSpine.returnReason, returnReason),
    [homeSpine.returnReason, returnReason],
  );
  const loadError = (disclosure.error ?? activeStudyPlanQuery.error ?? comebackQuery.error) as Error | null;

  const controller = buildHomeController({
    activeStudyPlanQuery, clearHomeHighlight, completionSync, comebackQuery,
    createRecommendation: {
      mutate: (vars) => createRecommendation.mutate(vars as Parameters<typeof createRecommendation.mutate>[0]),
      mutateAsync: (vars) => createRecommendation.mutateAsync(vars as Parameters<typeof createRecommendation.mutateAsync>[0]),
      isPending: createRecommendation.isPending,
      reset: createRecommendation.reset,
    }, currentStreak, currentXp, disclosure,
    displayedReturnReason, historyQuery, homeHighlight, homeSpine,
    isFirstRun, isOnline, learningExecutionLayer, loadError,
    primaryRecommendation, progressPercent, progressionQuery,
    recommendationsPending, runtime, streakQuery, todayFocusMinutes,
    updateRecommendationStatus: {
      mutate: (vars) => updateRecommendationStatus.mutate(vars as Parameters<typeof updateRecommendationStatus.mutate>[0]),
      mutateAsync: (vars) => updateRecommendationStatus.mutateAsync(vars as Parameters<typeof updateRecommendationStatus.mutateAsync>[0]),
      isPending: updateRecommendationStatus.isPending,
      reset: updateRecommendationStatus.reset,
    }, userId,
    actions: {
      openSetup, openProgress: actions.openProgress,
      openSocial: actions.openSocial, openContentStudy: actions.openContentStudy,
      continueStudyPlan: actions.continueStudyPlan,
    },
  });

  return {
    userId, isOnline,
    isLoading: disclosure.isLoading || recommendationsPending,
    isFirstRun, loadError, currentStreak, currentXp,
    todayFocusMinutes, progressPercent,
    primaryRecommendation: primaryRecommendation ?? null, homeSpine,
    returnReason: displayedReturnReason,
    stage: disclosure.stage, productTier: disclosure.productTier,
    features: disclosure.features, runtime, controller,
  };
}
