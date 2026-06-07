import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UseQueryResult } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSessionUIStore } from '../../../store/session-state';
import { useHomeSpineModel } from '../../../features/home-spine/hooks';
import {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from '../../../features/ai-coach/hooks/useRecommendationMutations';
import { useCoachRecommendations } from '../../../features/ai-coach/hooks/useCoachRecommendations';
import { getNextBestAction } from '../../../features/progression';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeViewModel } from './home-view-model';
import type { HomeController, SessionHistoryResult } from './home-controller-types';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { getFocusedMinutesForToday, getNextUnlockFeature, buildDisplayedReturnReason } from './home-controller-helpers';
import type { HomeReturnReason } from './useHomeReturnReason';
import { stubNavigationActions } from './home-controller-stubs';
import { buildActivatingReturnReason } from './activating-return-reason';
import { buildActivatingController, buildActivatingHomeReturnValue } from './activating-home-controller';
import { useActivatingNavigation } from './useActivatingNavigation';
import type { StreakSummaryData, ProgressionData } from './home-query-types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface ActivatingModelInput {
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: import('../../../features/liveops-config').UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  disclosure: FeatureAccessResult;
  historyQuery: SessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}

export function useActivatingHomeModel(
  input: ActivatingModelInput,
): HomeViewModel & { controller: HomeController } {
  const {
    analytics, disclosure, historyQuery, isOnline,
    progressionQuery, runtime, streakQuery, userId,
  } = input;

  const navigation = useNavigation<Nav>();
  const homeHighlight = useSessionUIStore((s) => s.homeHighlight);
  const completionSync = useSessionUIStore((s) => s.completionSync);
  const clearHomeHighlight = useSessionUIStore((s) => s.clearHomeHighlight);

  const { openSetup, openProgress, openNextAction } = useActivatingNavigation({
    analytics, disclosure, navigation, userId,
  });

  const streakData = streakQuery.data as StreakSummaryData | undefined;
  const progData = progressionQuery.data as ProgressionData | undefined;
  const currentStreak = streakData?.currentDays ?? 0;
  const currentXp = progData?.xp ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum: number, entry) => sum + getFocusedMinutesForToday(entry), 0,
  );
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun =
    !disclosure.isPending &&
    disclosure.inputs.totalCompletedSessions === 0 &&
    currentStreak === 0 && currentXp === 0;

  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();

  const recommendationsQuery = useCoachRecommendations(
    userId,
    { enabled: runtime.canQueryCoach && !disclosure.isPending },
  );

  const primaryRecommendation = useMemo<SessionRecommendation | null>(
    () =>
      (recommendationsQuery.data ?? [])
        .filter((item: { status: string; expiresAt: number }) =>
          item.status === 'ACTIVE' && item.expiresAt > Date.now())
        .sort((a: { confidence?: number }, b: { confidence?: number }) =>
          (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null,
    [recommendationsQuery.data],
  );

  const stubActions = useMemo(() => stubNavigationActions(), []);

  const nextUnlockFeature = useMemo(
    () => getNextUnlockFeature(
      disclosure.features as Record<
        string, { isUnlocked: boolean; isVisible: boolean; priority?: number }
      >,
    ),
    [disclosure.features],
  );

  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak, nextUnlockFeature,
  });

  const returnReason = useMemo<HomeReturnReason>(
    () => buildActivatingReturnReason({
      shouldShowExpansionSystems: runtime.shouldShowExpansionSystems,
      nextBestAction, primaryRecommendation,
      updateRecommendationStatus, openNextAction, openSetup, userId,
    }),
    [nextBestAction, openNextAction, openSetup, primaryRecommendation,
     runtime.shouldShowExpansionSystems, updateRecommendationStatus, userId],
  );

  const homeSpine = useHomeSpineModel({
    currentStreak, homeHighlight,
    isAtRisk: Boolean(streakData?.isAtRisk), isFirstRun,
    level: progData?.level ?? 1,
    progressPercent, progressXp: currentXp,
    returnReason: {
      body: returnReason.body, ctaLabel: returnReason.ctaLabel,
      eyebrow: returnReason.eyebrow, intent: returnReason.intent,
      source: returnReason.source, title: returnReason.title,
      tone: returnReason.tone,
    },
    todayFocusMinutes,
  });

  const displayedReturnReason = useMemo(
    () => buildDisplayedReturnReason(homeSpine.returnReason, returnReason),
    [homeSpine.returnReason, returnReason],
  );

  const isLoading = disclosure.isPending || recommendationsQuery.isPending;

  const controller = buildActivatingController({
    userId, isOnline, isLoading, isFirstRun,
    loadError: disclosure.error as Error | null,
    homeHighlight, completionSync, clearHomeHighlight,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    latestSession: historyQuery.history[0] ?? null,
    primaryRecommendation, homeSpine, displayedReturnReason,
    disclosure, runtime, streakQuery, progressionQuery, historyQuery,
    recommendationsQuery,
    openSetup: openSetup as (params?: Record<string, unknown>) => void,
    openProgress, openSocial: stubActions.openSocial,
    createRecommendation: createRecommendation as HomeController['createRecommendation'],
    updateRecommendationStatus: updateRecommendationStatus as HomeController['updateRecommendationStatus'],
  });

  return buildActivatingHomeReturnValue(controller, {
    userId, isOnline, isLoading, isFirstRun,
    loadError: disclosure.error as Error | null,
    currentStreak, currentXp, todayFocusMinutes, progressPercent,
    primaryRecommendation, homeSpine, displayedReturnReason,
    disclosure, runtime,
  });
}
