import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
} from '../../../features/ai-coach/hooks/useRecommendationMutations';
import { useHomeRecommendations } from '../../../features/ai-coach/hooks';
import { useActiveStudyPlan } from '../../../features/content-study';
import { useLearningExecutionLayer } from '../../../features/learning-execution';
import { useActiveBoss } from '../../../features/boss/hooks';
import { useComebackState } from '../../../features/streaks/hooks';
import { getNextBestAction } from '../../../features/progression';
import {
  getFocusedMinutesForToday,
  getNextUnlockFeature,
  buildDisplayedReturnReason,
} from '../hooks/home-controller-helpers';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';
import type {
  Nav,
  PowerUserContainerResult,
  PowerUserContainerInput,
  StreakQueryData,
  ProgressionQueryData,
  ActiveStudyPlanData,
  ComebackData,
} from './power-user-home-types';
import { buildReturnReasonConfig } from './power-user-home-helpers';
import { buildController } from './power-user-home-controller';
import { usePowerUserNavigation } from './power-user-home-navigation';

export function usePowerUserContainerModel(
  input: PowerUserContainerInput,
): PowerUserContainerResult {
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
  const activeBossQuery = useActiveBoss(runtime.canQueryBoss ? userId || null : null);
  const { primaryRecommendation, isPending: recommendationsPending } =
    useHomeRecommendations(userId, runtime.canQueryCoach && !disclosure.isLoading);

  const { openSetup, openProgress, openSocial, openContentStudy, continueStudyPlan, openNextAction } =
    usePowerUserNavigation({
      navigation, userId, disclosure, analytics,
      learningExecutionTarget: learningExecutionLayer.target,
    });

  const nextUnlockFeature = useMemo(() => getNextUnlockFeature(disclosure.features), [disclosure.features]);
  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak, nextUnlockFeature,
  });

  const returnReason = useMemo((): HomeReturnReason => {
    return buildReturnReasonConfig({
      activeStudyPlanData: activeStudyPlanQuery.data as ActiveStudyPlanData | undefined,
      comebackData: comebackQuery.data as ComebackData | undefined,
      shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
      primaryRecommendation, nextBestAction,
      continueStudyPlan, openNextAction, openSetup,
      updateRecommendationStatus, userId,
    });
  }, [
    activeStudyPlanQuery.data, comebackQuery.data, continueStudyPlan,
    nextBestAction, openNextAction, openSetup, primaryRecommendation,
    runtime.shouldShowExpansionSystems, updateRecommendationStatus, userId,
  ]);

  const returnReasonFields = {
    body: returnReason.body, ctaLabel: returnReason.ctaLabel,
    eyebrow: returnReason.eyebrow, intent: returnReason.intent,
    source: returnReason.source, title: returnReason.title, tone: returnReason.tone,
  };
  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight,
    isAtRisk: Boolean(streakData?.isAtRisk), isFirstRun,
    level: progData?.level ?? 1, progressPercent,
    progressXp: currentXp, returnReason: returnReasonFields, todayFocusMinutes,
  });

  const displayedReturnReason = useMemo(
    () => buildDisplayedReturnReason(homeSpine.returnReason, returnReason),
    [homeSpine.returnReason, returnReason],
  );
  const loadError = (disclosure.error ?? activeStudyPlanQuery.error ?? comebackQuery.error) as Error | null;

  const controller = buildController({
    userId, isOnline, disclosure, recommendationsPending, isFirstRun, loadError,
    homeHighlight, completionSync, clearHomeHighlight,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    historyQuery, primaryRecommendation, homeSpine, displayedReturnReason,
    runtime, streakQuery, progressionQuery, activeStudyPlanQuery,
    learningExecutionLayer, comebackQuery, activeBossQuery,
    createRecommendation: {
      mutate: (vars) => createRecommendation.mutate(vars as Parameters<typeof createRecommendation.mutate>[0]),
      mutateAsync: (vars) => createRecommendation.mutateAsync(vars as Parameters<typeof createRecommendation.mutateAsync>[0]),
      isPending: createRecommendation.isPending,
      reset: createRecommendation.reset,
    },
    updateRecommendationStatus: {
      mutate: (vars) => updateRecommendationStatus.mutate(vars as Parameters<typeof updateRecommendationStatus.mutate>[0]),
      mutateAsync: (vars) => updateRecommendationStatus.mutateAsync(vars as Parameters<typeof updateRecommendationStatus.mutateAsync>[0]),
      isPending: updateRecommendationStatus.isPending,
      reset: updateRecommendationStatus.reset,
    },
    openSetup, openProgress, openSocial, openContentStudy, continueStudyPlan,
  });

  return {
    userId, isOnline,
    isLoading: disclosure.isLoading || recommendationsPending,
    isFirstRun, loadError, currentStreak, currentXp,
    todayFocusMinutes, progressPercent, primaryRecommendation: primaryRecommendation ?? null,
    homeSpine, returnReason: displayedReturnReason,
    stage: disclosure.stage, productTier: disclosure.productTier,
    features: disclosure.features, runtime, controller,
  };
}
