import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UseQueryResult } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { useCreateRecommendation, useUpdateRecommendationStatus, useActiveCoachRecommendations, type SessionRecommendation } from '../../../features/ai-coach';
import { useActiveStudyPlan } from '../../../features/content-study';
import { buildLearningSessionParams, useLearningExecutionLayer } from '../../../features/learning-execution';
import { useComebackState } from '../../../features/streaks/hooks';
import { getNextBestAction } from '../../../features/progression';
import { getFeatureAvailability, isFeatureAvailableForNavigation, type FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { HomeController, SessionHistoryResult } from '../hooks/home-controller-types';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { navigateToSessionStackScreen, navigateToMainTab } from '../../../navigation/navigation-helpers';
import { getFocusedMinutesForToday, getNextUnlockFeature, buildDisplayedReturnReason } from '../hooks/home-controller-helpers';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';
import { createStubQuery } from '../hooks/home-controller-stubs';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface StreakQueryData { currentDays?: number; isAtRisk?: boolean; }
interface ProgressionQueryData { xp?: number; level?: number; }
interface ActiveStudyPlanData { completedTasks?: number; remainingMinutes?: number; title?: string; totalTasks?: number; }
interface ComebackData { isComeback?: boolean; message?: string; }

interface EngagedContainerInput {
  analytics: { trackFirstSessionStarted: (userId: string, source: string) => void; trackNextBestActionPressed: (stage: import('../../../features/liveops-config').UserExperienceStage, completedSessions: number) => void };
  disclosure: FeatureAccessResult;
  historyQuery: SessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function useEngagedContainerModel(input: EngagedContainerInput): HomeViewModel & { controller: HomeController } {
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

  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();
  const activeStudyPlanQuery = useActiveStudyPlan({ enabled: runtime.canQueryStudy });
  const learningExecutionLayer = useLearningExecutionLayer(activeStudyPlanQuery.data ?? null);
  const comebackQuery = useComebackState(runtime.canQueryComeback ? userId : null);

  const { primaryRecommendation, isPending: recommendationsPending } = useActiveCoachRecommendations(
    userId,
    runtime.canQueryCoach && !disclosure.isLoading,
  );

  const canNavigateContentStudy = isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.content_study));
  const canNavigateSocial = isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.social_tab));

  const openSetup = useCallback((params: Record<string, unknown> = {}): void => {
    if (userId && disclosure.inputs.totalCompletedSessions === 0) {
      analytics.trackFirstSessionStarted(userId, 'home');
    }
    navigateToSessionStackScreen(navigation, 'SessionSetup', params);
  }, [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId]);

  const openProgress = useCallback(() => navigateToMainTab(navigation, 'Progress'), [navigation]);
  const openSocial = useCallback(() => {
    if (canNavigateSocial) {
      navigateToMainTab(navigation, 'Profile');
    } else {
      navigateToMainTab(navigation, 'Profile');
    }
  }, [canNavigateSocial, navigation]);
  const openContentStudy = useCallback(() => {
    if (!canNavigateContentStudy) { openSetup(); return; }
    navigation.navigate('ContentStudy');
  }, [canNavigateContentStudy, navigation, openSetup]);
  const continueStudyPlan = useCallback(() => {
    if (!learningExecutionLayer.target) { openContentStudy(); return; }
    openSetup(buildLearningSessionParams(learningExecutionLayer.target));
  }, [learningExecutionLayer.target, openContentStudy, openSetup]);
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
    const studyData = activeStudyPlanQuery.data as ActiveStudyPlanData | undefined;
    const cbData = comebackQuery.data as ComebackData | undefined;
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan: studyData ? { completedTasks: studyData.completedTasks ?? 0, remainingMinutes: studyData.remainingMinutes ?? 0, title: studyData.title ?? '', totalTasks: studyData.totalTasks ?? 0 } : null,
      canShowExpansionSystems: runtime.shouldShowExpansionSystems,
      comebackMessage: cbData?.isComeback ? (cbData.message ?? null) : null,
      nextBestAction,
      primaryRecommendation: primaryRecommendation ? { id: primaryRecommendation.id, reasoning: primaryRecommendation.reasoning ?? '', suggestedDifficulty: primaryRecommendation.suggestedDifficulty ?? 'NORMAL', suggestedDuration: primaryRecommendation.suggestedDuration ?? 15 * 60, type: primaryRecommendation.recommendationType } : null,
    });
    let onPress: () => Promise<void> | void = () => openSetup();
    if (reasonState.intent === 'continue-study-plan') { onPress = continueStudyPlan; }
    else if (reasonState.intent === 'accept-coach-recommendation' && reasonState.recommendationId) {
      onPress = async () => {
        await updateRecommendationStatus.mutateAsync({ recommendationId: reasonState.recommendationId!, status: 'ACCEPTED', userId });
        openSetup({ recommendationId: reasonState.recommendationId, suggestedDifficulty: reasonState.suggestedDifficulty, suggestedDurationSeconds: reasonState.suggestedDurationSeconds });
      };
    } else if (reasonState.source === 'next-best-action') { onPress = openNextAction; }
    return { body: reasonState.body, ctaLabel: reasonState.ctaLabel, eyebrow: reasonState.eyebrow, intent: reasonState.intent, onPress, source: reasonState.source, title: reasonState.title, tone: reasonState.tone };
  }, [activeStudyPlanQuery.data, comebackQuery.data, continueStudyPlan, nextBestAction, openNextAction, openSetup, primaryRecommendation, runtime.shouldShowExpansionSystems, updateRecommendationStatus, userId]);

  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight, isAtRisk: Boolean(streakData?.isAtRisk), isFirstRun,
    level: progData?.level ?? 1, progressPercent, progressXp: currentXp,
    returnReason: { body: returnReason.body, ctaLabel: returnReason.ctaLabel, eyebrow: returnReason.eyebrow, intent: returnReason.intent, source: returnReason.source, title: returnReason.title, tone: returnReason.tone },
    todayFocusMinutes,
  });

  const displayedReturnReason = useMemo(() => buildDisplayedReturnReason(homeSpine.returnReason, returnReason), [homeSpine.returnReason, returnReason]);
  const loadError = (disclosure.error ?? activeStudyPlanQuery.error ?? comebackQuery.error) as Error | null;

  const controller: HomeController = {
    user: null, userId, isOnline, isLoading: disclosure.isLoading || recommendationsPending,
    isFirstRun, loadError, homeHighlight, completionSync, clearHomeHighlight,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    latestSession: historyQuery.history[0] ?? null, primaryRecommendation, homeSpine, returnReason: displayedReturnReason,
    disclosure, runtime,
    streakQuery, progressionQuery, historyQuery,
    squadsQuery: createStubQuery() as UseQueryResult, activeStudyPlanQuery: activeStudyPlanQuery as UseQueryResult,
    learningExecutionLayer, comebackQuery: comebackQuery as UseQueryResult,
    activeBossQuery: createStubQuery() as UseQueryResult, recommendationsQuery: {} as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems, shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup, openProgress, openSocial, openContentStudy, continueStudyPlan,
    createRecommendation: createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: disclosure.refetchAll as () => Promise<unknown>,
    features: disclosure.features,
  };

  return {
    userId, isOnline, isLoading: disclosure.isLoading || recommendationsPending,
    isFirstRun, loadError, currentStreak, currentXp, todayFocusMinutes, progressPercent,
    primaryRecommendation, homeSpine, returnReason: displayedReturnReason,
    stage: disclosure.stage, productTier: disclosure.productTier,
    features: disclosure.features, runtime, controller,
  };
}
