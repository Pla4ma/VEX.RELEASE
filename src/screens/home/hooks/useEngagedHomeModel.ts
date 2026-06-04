import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import type { HomeController } from './home-controller-types';
import { buildDisplayedReturnReason } from './home-controller-helpers';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { HomeViewModel } from './home-view-model';
import type { Nav, EngagedModelInput } from './engaged-home-types';
import { useEngagedQueries } from './useEngagedQueries';
import { useEngagedNavigation } from './useEngagedNavigation';
import { buildEngagedReturnReason } from './engaged-return-reason';
import { buildEngagedController } from './engaged-controller-builder';
import type { ActiveStudyPlanData, ComebackStateData, StreakSummaryData, ProgressionData } from './home-query-types';

export function useEngagedHomeModel(
  input: EngagedModelInput,
): HomeViewModel & { controller: HomeController } {
  const { disclosure, historyQuery, isOnline, runtime, userId } = input;

  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);
  const completionSync = useSessionUIStore((s) => s.completionSync);
  const clearHomeHighlight = useSessionUIStore((s) => s.clearHomeHighlight);

  const q = useEngagedQueries(input);

  const {
    openSetup, openProgress, openSocial,
    openContentStudy, continueStudyPlan, openNextAction,
  } = useEngagedNavigation({
    analytics: input.analytics,
    disclosure,
    navigation,
    userId,
    canNavigateSocial: q.canNavigateSocial,
    canNavigateContentStudy: q.canNavigateContentStudy,
    learningTarget: q.learningExecutionLayer.target,
  });

  const returnReason = useMemo<HomeReturnReason>(
    () =>
      buildEngagedReturnReason({
        activeStudyPlanData: q.activeStudyPlanQuery.data as ActiveStudyPlanData | undefined,
        comebackData: q.comebackQuery.data as ComebackStateData | undefined,
        shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
        nextBestAction: q.nextBestAction,
        primaryRecommendation: q.primaryRecommendation,
        continueStudyPlan,
        updateRecommendationStatus: q.updateRecommendationStatus,
        openNextAction,
        openSetup,
        userId,
      }),
    [
      q.activeStudyPlanQuery.data, q.comebackQuery.data,
      continueStudyPlan, q.nextBestAction, openNextAction,
      openSetup, q.primaryRecommendation,
      runtime.shouldShowExpansionSystems,
      q.updateRecommendationStatus, userId,
    ],
  );

  const homeSpine = useHomeSpineModel({
    currentStreak: q.currentStreak,
    homeHighlight,
    isAtRisk: Boolean(q.streakData?.isAtRisk),
    isFirstRun: q.isFirstRun,
    level: (q.progData as ProgressionData | undefined)?.level ?? 1,
    progressPercent: q.progressPercent,
    progressXp: q.currentXp,
    returnReason: {
      body: returnReason.body,
      ctaLabel: returnReason.ctaLabel,
      eyebrow: returnReason.eyebrow,
      intent: returnReason.intent,
      source: returnReason.source,
      title: returnReason.title,
      tone: returnReason.tone,
    },
    todayFocusMinutes: q.todayFocusMinutes,
  });

  const displayedReturnReason = useMemo(
    () => buildDisplayedReturnReason(homeSpine.returnReason, returnReason),
    [homeSpine.returnReason, returnReason],
  );

  const loadError = (disclosure.error ??
    q.activeStudyPlanQuery.error ??
    q.comebackQuery.error) as Error | null;

  const isLoading = disclosure.isLoading || q.recommendationsQuery.isLoading;

  const controller = buildEngagedController({
    userId,
    isOnline,
    isLoading,
    isFirstRun: q.isFirstRun,
    loadError,
    homeHighlight,
    completionSync,
    clearHomeHighlight,
    currentStreak: q.currentStreak,
    currentXp: q.currentXp,
    todayFocusMinutes: q.todayFocusMinutes,
    progressPercent: q.progressPercent,
    latestSession: historyQuery.history[0] ?? null,
    primaryRecommendation: q.primaryRecommendation,
    homeSpine,
    displayedReturnReason,
    disclosure,
    runtime,
    streakQuery: input.streakQuery,
    progressionQuery: input.progressionQuery,
    historyQuery,
    activeStudyPlanQuery: q.activeStudyPlanQuery,
    learningExecutionLayer: q.learningExecutionLayer,
    comebackQuery: q.comebackQuery,
    recommendationsQuery: q.recommendationsQuery,
    openSetup,
    openProgress,
    openSocial,
    openContentStudy,
    continueStudyPlan,
    createRecommendation: q.createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: q.updateRecommendationStatus as HomeController['updateRecommendationStatus'],
  });

  return {
    userId,
    isOnline,
    isLoading,
    isFirstRun: q.isFirstRun,
    loadError,
    currentStreak: q.currentStreak,
    currentXp: q.currentXp,
    todayFocusMinutes: q.todayFocusMinutes,
    progressPercent: q.progressPercent,
    primaryRecommendation: q.primaryRecommendation,
    homeSpine,
    returnReason: displayedReturnReason,
    stage: disclosure.stage,
    productTier: disclosure.productTier,
    features: disclosure.features,
    runtime,
    controller,
  };
}
