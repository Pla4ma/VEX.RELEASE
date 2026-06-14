import { useMemo } from 'react';
import { useSessionUIStore } from '@/store/session-state';
import { useHomeSpineModel } from '@/features/home-spine/hooks';
import { useActivatingContainerActions } from './ActivatingHomeContainer.actions';
import { computeActivatingState } from './ActivatingHomeContainer.state';
import { getNextUnlockFeature } from '@/screens/home/hooks/home-controller-helpers';
import { createStubQuery, stubLearningExecutionLayer, stubCoachMutations } from '@/screens/home/hooks/home-controller-stubs';
import { getNextBestAction } from '@/features/progression';
import type { HomeViewModel } from '@/screens/home/hooks/home-view-model';
import type { HomeController } from '@/screens/home/hooks/home-controller-types';
import type { ActivatingContainerInput } from './ActivatingHomeContainer.types';

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

  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);
  const completionSync = useSessionUIStore((s) => s.completionSync);
  const clearHomeHighlight = useSessionUIStore((s) => s.clearHomeHighlight);

  const {
    streakData,
    progData,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    isFirstRun,
  } = computeActivatingState(disclosure, streakQuery, progressionQuery, historyQuery);

  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak,
    nextUnlockFeature: getNextUnlockFeature(disclosure.features),
  });

  const {
    openSetup,
    openProgress,
    openPlan,
    openCoach,
    openNextAction,
    returnReason,
    stubActions,
  } = useActivatingContainerActions(input, disclosure, analytics, userId, runtime, nextBestAction);

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
    returnReason,
    disclosure,
    runtime,
    streakQuery,
    progressionQuery,
    historyQuery,
    squadsQuery: createStubQuery<unknown>(),
    activeStudyPlanQuery: createStubQuery<unknown>(),
    learningExecutionLayer: stubLearningExecutionLayer(),
    comebackQuery: createStubQuery<unknown>(),
    activeBossQuery: createStubQuery<unknown>(),
    recommendationsQuery: createStubQuery<unknown>(),
    shouldShowSecondarySystems: runtime.shouldShowSecondarySystems,
    shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
    openSetup,
    openProgress,
    openSocial: stubActions.openSocial,
    openPlan,
    openCoach,
    openContentStudy: openSetup as () => void,
    continueStudyPlan: openSetup as () => void,
    createRecommendation: stubCoachMutations()
      .createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: stubCoachMutations()
      .updateRecommendationStatus as HomeController['updateRecommendationStatus'],
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
    returnReason,
    stage: disclosure.stage,
    productTier: disclosure.productTier,
    features: disclosure.features,
    runtime,
    controller,
  };
}