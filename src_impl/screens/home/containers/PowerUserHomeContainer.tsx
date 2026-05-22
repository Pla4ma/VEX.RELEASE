/**
 * PowerUserHomeContainer — STAGE: POWER_USER (10+ completed sessions)
 * DEEPER SYSTEMS only through FeatureAvailability checks.
 * Allowed: all Engaged features + boss/squads if FeatureAvailability permits.
 */
import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import { useCreateRecommendation, useUpdateRecommendationStatus, type SessionRecommendation } from '../../../features/ai-coach';
import * as coachRepository from '../../../features/ai-coach/repository';
import { useActiveStudyPlan } from '../../../features/content-study';
import { buildLearningSessionParams, useLearningExecutionLayer } from '../../../features/learning-execution';
import { useActiveBoss } from '../../../features/boss/hooks';
import { useComebackState } from '../../../features/streaks/hooks';
import { useUserSquads } from '../../../features/squads/hooks';
import { getNextBestAction } from '../../../features/progression';
import { getFeatureAvailability, isFeatureAvailableForNavigation, type FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { HomeViewModel } from '../hooks/home-view-model';
import type { HomeController, SessionHistoryResult } from '../hooks/home-controller-types';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import { getFocusedMinutesForToday, getNextUnlockFeature, buildDisplayedReturnReason } from '../hooks/home-controller-helpers';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface PowerUserContainerInput {
  analytics: { trackFirstSessionStarted: (userId: string, source: string) => void; trackNextBestActionPressed: (stage: import('../../../features/liveops-config').UserExperienceStage, completedSessions: number) => void };
  disclosure: FeatureAccessResult;
  historyQuery: SessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function usePowerUserContainerModel(input: PowerUserContainerInput): HomeViewModel & { controller: HomeController } {
  const { analytics, disclosure, historyQuery, isOnline, progressionQuery, runtime, streakQuery, userId } = input;
  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);
  const completionSync = useSessionUIStore((s) => s.completionSync) as unknown;
  const clearHomeHighlight = useSessionUIStore((s) => s.clearHomeHighlight);

  const streakData = streakQuery.data as Record<string, unknown> | undefined;
  const progData = progressionQuery.data as Record<string, unknown> | undefined;
  const currentStreak = (streakData?.currentDays as number | undefined) ?? 0;
  const currentXp = (progData?.xp as number | undefined) ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce((sum: number, e) => sum + getFocusedMinutesForToday(e), 0);
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun = !disclosure.isLoading && disclosure.inputs.totalCompletedSessions === 0 && currentStreak === 0 && currentXp === 0;

  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();
  const activeStudyPlanQuery = useActiveStudyPlan({ enabled: runtime.canQueryStudy });
  const learningExecutionLayer = useLearningExecutionLayer(activeStudyPlanQuery.data ?? null);
  const comebackQuery = useComebackState(runtime.canQueryComeback ? userId : null);
  const activeBossQuery = useActiveBoss(runtime.canQueryBoss ? userId || null : null);
  const squadsQuery = useUserSquads(userId || undefined, { enabled: runtime.canQuerySquads, staleTime: 1000 * 60 * 5 });

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

  const canNavigateContentStudy = isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.content_study));
  const canNavigateSocial = isFeatureAvailableForNavigation(getFeatureAvailability(disclosure.features.social_tab));

  const openSetup = useCallback((params?: Record<string, unknown>): void => {
    if (userId && disclosure.inputs.totalCompletedSessions === 0) {
      analytics.trackFirstSessionStarted(userId, (params as SessionStackParams['SessionSetup'] | undefined)?.source ?? 'home');
    }
    navigation.navigate('SessionStack', { screen: 'SessionSetup', params: (params ?? {}) as SessionStackParams['SessionSetup'] });
  }, [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId]);
  const openProgress = useCallback(() => navigation.navigate('Main', { screen: 'Progress' }), [navigation]);
  const openSocial = useCallback(() => {
    navigation.navigate('Main', canNavigateSocial ? { screen: 'Profile', params: { tab: 'social' } } : { screen: 'Profile', params: { tab: 'stats' } });
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
    () => getNextUnlockFeature(disclosure.features as Record<string, { isUnlocked: boolean; isVisible: boolean; priority?: number }>),
    [disclosure.features],
  );
  const nextBestAction = getNextBestAction({ completedSessions: disclosure.inputs.totalCompletedSessions, currentStreak, nextUnlockFeature });

  const returnReason = useMemo<HomeReturnReason>(() => {
    const studyData = activeStudyPlanQuery.data as Record<string, unknown> | undefined;
    const cbData = comebackQuery.data as Record<string, unknown> | undefined;
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan: studyData ? { completedTasks: (studyData.completedTasks as number) ?? 0, remainingMinutes: (studyData.remainingMinutes as number) ?? 0, title: (studyData.title as string) ?? '', totalTasks: (studyData.totalTasks as number) ?? 0 } : null,
      canShowExpansionSystems: runtime.shouldShowExpansionSystems,
      comebackMessage: cbData?.isComeback ? ((cbData.message as string) ?? null) : null,
      nextBestAction,
      primaryRecommendation: primaryRecommendation ? { id: primaryRecommendation.id, reasoning: (primaryRecommendation as Record<string, unknown>).reasoning as string ?? '', suggestedDifficulty: primaryRecommendation.suggestedDifficulty ?? 'NORMAL', suggestedDuration: primaryRecommendation.suggestedDuration ?? 15 * 60, type: primaryRecommendation.recommendationType } : null,
    });
    let onPress: () => Promise<void> | void = () => openSetup();
    if (reasonState.intent === 'continue-study-plan') { onPress = continueStudyPlan; }
    else if (reasonState.intent === 'accept-coach-recommendation' && reasonState.recommendationId) {
      onPress = async () => { await updateRecommendationStatus.mutateAsync({ recommendationId: reasonState.recommendationId!, status: 'ACCEPTED', userId }); openSetup({ recommendationId: reasonState.recommendationId, suggestedDifficulty: reasonState.suggestedDifficulty, suggestedDurationSeconds: reasonState.suggestedDurationSeconds }); };
    } else if (reasonState.source === 'next-best-action') { onPress = openNextAction; }
    return { body: reasonState.body, ctaLabel: reasonState.ctaLabel, eyebrow: reasonState.eyebrow, intent: reasonState.intent, onPress, source: reasonState.source, title: reasonState.title, tone: reasonState.tone };
  }, [activeStudyPlanQuery.data, comebackQuery.data, continueStudyPlan, nextBestAction, openNextAction, openSetup, primaryRecommendation, runtime.shouldShowExpansionSystems, updateRecommendationStatus, userId]);

  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight, isAtRisk: Boolean(streakData?.isAtRisk), isFirstRun,
    level: (progData?.level as number | undefined) ?? 1, progressPercent, progressXp: currentXp,
    returnReason: { body: returnReason.body, ctaLabel: returnReason.ctaLabel, eyebrow: returnReason.eyebrow, intent: returnReason.intent, source: returnReason.source, title: returnReason.title, tone: returnReason.tone },
    todayFocusMinutes,
  });
  const displayedReturnReason = useMemo(() => buildDisplayedReturnReason(homeSpine.returnReason, returnReason), [homeSpine.returnReason, returnReason]);
  const loadError = (disclosure.error ?? activeStudyPlanQuery.error ?? comebackQuery.error) as Error | null;

  const controller: HomeController = {
    user: null, userId, isOnline, isLoading: disclosure.isLoading || recommendationsQuery.isLoading,
    isFirstRun, loadError, homeHighlight, completionSync, clearHomeHighlight,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    latestSession: historyQuery.history[0] ?? null, primaryRecommendation, homeSpine, returnReason: displayedReturnReason,
    disclosure, runtime,
    streakQuery: streakQuery as UseQueryResult, progressionQuery: progressionQuery as UseQueryResult, historyQuery,
    squadsQuery: squadsQuery as UseQueryResult, activeStudyPlanQuery: activeStudyPlanQuery as UseQueryResult,
    learningExecutionLayer, comebackQuery: comebackQuery as UseQueryResult,
    activeBossQuery: activeBossQuery as UseQueryResult, recommendationsQuery: recommendationsQuery as UseQueryResult,
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems, shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup: openSetup as (params?: Record<string, unknown>) => void, openProgress, openSocial, openContentStudy, continueStudyPlan,
    createRecommendation: createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: updateRecommendationStatus as HomeController['updateRecommendationStatus'],
    retryAll: disclosure.refetchAll as () => Promise<unknown>,
    features: disclosure.features,
  };

  return {
    userId, isOnline, isLoading: disclosure.isLoading || recommendationsQuery.isLoading,
    isFirstRun, loadError, currentStreak, currentXp, todayFocusMinutes, progressPercent,
    primaryRecommendation, homeSpine, returnReason: displayedReturnReason,
    stage: disclosure.stage, productTier: disclosure.productTier,
    features: disclosure.features, runtime, controller,
  };
}
