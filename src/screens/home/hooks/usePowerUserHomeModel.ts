import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  useCoachRecommendations,
  type SessionRecommendation,
} from '../../../features/ai-coach';
import { useActiveStudyPlan } from '../../../features/content-study';
import {
  buildLearningSessionParams,
  useLearningExecutionLayer,
} from '../../../features/learning-execution';
import { useActiveBoss } from '../../../features/boss/hooks';
import { useComebackState } from '../../../features/streaks/hooks';
import { getNextBestAction } from '../../../features/progression';
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../../../features/liveops-config';
import type { HomeViewModel } from './home-view-model';
import type { HomeController } from './home-controller-types';
import {
  getFocusedMinutesForToday,
  getNextUnlockFeature,
  buildDisplayedReturnReason,
} from './home-controller-helpers';
import { createStubQuery } from './home-controller-stubs';
import type { Nav, PowerUserModelInput } from './power-user-home-types';
import { useNavigationCallbacks } from './power-user-home-navigation';
import { buildReturnReason } from './power-user-home-return-reason';
import { buildHomeController } from './power-user-home-controller';
import type { StreakSummaryData, ProgressionData, ActiveStudyPlanData, ComebackStateData } from './home-query-types';

export function usePowerUserHomeModel(
  input: PowerUserModelInput,
): HomeViewModel & { controller: HomeController } {
  const {
    analytics, disclosure, historyQuery, isOnline,
    progressionQuery, runtime, streakQuery, userId,
  } = input;

  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);
  const completionSync = useSessionUIStore((s) => s.completionSync);
  const clearHomeHighlight = useSessionUIStore((s) => s.clearHomeHighlight);

  const streakData = streakQuery.data as StreakSummaryData | undefined;
  const progData = progressionQuery.data as ProgressionData | undefined;
  const currentStreak = streakData?.currentDays ?? 0;
  const currentXp = progData?.xp ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum: number, entry) => sum + getFocusedMinutesForToday(entry), 0,
  );
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun = !disclosure.isLoading &&
    disclosure.inputs.totalCompletedSessions === 0 && currentStreak === 0 && currentXp === 0;

  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();
  const activeStudyPlanQuery = useActiveStudyPlan({ enabled: runtime.canQueryStudy });
  const learningExecutionLayer = useLearningExecutionLayer(activeStudyPlanQuery.data ?? null);
  const comebackQuery = useComebackState(runtime.canQueryComeback ? userId : null);
  const activeBossQuery = useActiveBoss(runtime.canQueryBoss ? userId || null : null);

  const recommendationsQuery = useCoachRecommendations(
    userId,
    { enabled: runtime.canQueryCoach && !disclosure.isLoading },
  );

  const primaryRecommendation = useMemo<SessionRecommendation | null>(
    () => (recommendationsQuery.data ?? [])
      .filter((item: { status: string; expiresAt: number }) =>
        item.status === 'ACTIVE' && item.expiresAt > Date.now())
      .sort((a: { confidence?: number }, b: { confidence?: number }) =>
        (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null,
    [recommendationsQuery.data],
  );

  const canNavigateContentStudy = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.content_study));
  const canNavigateSocial = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.social_tab));

  const nav = useNavigationCallbacks({
    navigation, userId, disclosure, analytics,
    canNavigateSocial, canNavigateContentStudy,
    learningExecutionTarget: learningExecutionLayer.target,
    buildLearningSessionParams,
  });

  const nextUnlockFeature = useMemo(() =>
    getNextUnlockFeature(disclosure.features as Record<string, {
      isUnlocked: boolean; isVisible: boolean; priority?: number;
    }>), [disclosure.features]);
  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak, nextUnlockFeature,
  });

  const returnReason = useMemo(
    () =>
      buildReturnReason({
        activeStudyPlanData: activeStudyPlanQuery.data as ActiveStudyPlanData | undefined,
        comebackData: comebackQuery.data as ComebackStateData | undefined,
        runtime: runtime,
        nextBestAction: nextBestAction,
        primaryRecommendation: primaryRecommendation,
        openSetup: nav.openSetup,
        continueStudyPlan: nav.continueStudyPlan,
        openNextAction: nav.openNextAction,
        updateRecommendationStatus: updateRecommendationStatus,
        userId,
      }),
    [
      activeStudyPlanQuery.data,
      comebackQuery.data,
      nav.continueStudyPlan,
      nav.openNextAction,
      nav.openSetup,
      nextBestAction,
      primaryRecommendation,
      runtime,
      updateRecommendationStatus,
      userId,
    ],
  );

  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight, isAtRisk: Boolean(streakData?.isAtRisk),
    isFirstRun, level: progData?.level ?? 1,
    progressPercent, progressXp: currentXp,
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
    userId, isOnline,
    isLoading: disclosure.isLoading || recommendationsQuery.isLoading,
    isFirstRun, loadError, homeHighlight, completionSync, clearHomeHighlight,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    latestSession: historyQuery.history[0] ?? null,
    primaryRecommendation, homeSpine, displayedReturnReason,
    disclosure, runtime,
    streakQuery: streakQuery as UseQueryResult,
    progressionQuery: progressionQuery as UseQueryResult,
    historyQuery: historyQuery,
    activeStudyPlanQuery: activeStudyPlanQuery as UseQueryResult,
    learningExecutionLayer,
    comebackQuery: comebackQuery as UseQueryResult,
    activeBossQuery: activeBossQuery as UseQueryResult,
    recommendationsQuery: recommendationsQuery as UseQueryResult,
    openSetup: nav.openSetup, openProgress: nav.openProgress,
    openSocial: nav.openSocial, openContentStudy: nav.openContentStudy,
    continueStudyPlan: nav.continueStudyPlan,
    createRecommendation, updateRecommendationStatus,
    squadsQuery: createStubQuery() as UseQueryResult,
  });

  return {
    userId, isOnline,
    isLoading: disclosure.isLoading || recommendationsQuery.isLoading,
    isFirstRun, loadError, currentStreak, currentXp,
    todayFocusMinutes, progressPercent, primaryRecommendation,
    homeSpine, returnReason: displayedReturnReason,
    stage: disclosure.stage, productTier: disclosure.productTier,
    features: disclosure.features, runtime, controller,
  };
}
