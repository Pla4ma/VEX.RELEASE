import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from '../../../features/ai-coach';
import * as coachRepository from '../../../features/ai-coach/repository';
import { getNextBestAction } from '../../../features/progression';
import { useActiveStudyPlan } from '../../../features/content-study';
import { useLearningExecutionLayer } from '../../../features/learning-execution';
import { useComebackState } from '../../../features/streaks/hooks';
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../../../features/liveops-config';
import { getFocusedMinutesForToday, getNextUnlockFeature } from './home-controller-helpers';
import type { EngagedModelInput } from './engaged-home-types';

export function useEngagedQueries(input: EngagedModelInput) {
  const { disclosure, historyQuery, progressionQuery, runtime, streakQuery, userId } = input;

  const streakData = streakQuery.data as Record<string, unknown> | undefined;
  const progData = progressionQuery.data as Record<string, unknown> | undefined;
  const currentStreak = (streakData?.currentDays as number | undefined) ?? 0;
  const currentXp = (progData?.xp as number | undefined) ?? 0;
  const todayFocusMinutes = historyQuery.history.reduce(
    (sum: number, entry) => sum + getFocusedMinutesForToday(entry),
    0,
  );
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / 120) * 100));
  const isFirstRun =
    !disclosure.isLoading &&
    disclosure.inputs.totalCompletedSessions === 0 &&
    currentStreak === 0 &&
    currentXp === 0;

  const createRecommendation = useCreateRecommendation();
  const updateRecommendationStatus = useUpdateRecommendationStatus();
  const activeStudyPlanQuery = useActiveStudyPlan({ enabled: runtime.canQueryStudy });
  const learningExecutionLayer = useLearningExecutionLayer(activeStudyPlanQuery.data ?? null);
  const comebackQuery = useComebackState(runtime.canQueryComeback ? userId : null);

  const recommendationsQuery = useQuery({
    queryKey: ['coach', 'recommendations', userId],
    queryFn: () => coachRepository.fetchActiveRecommendations(userId),
    enabled: runtime.canQueryCoach && Boolean(userId) && !disclosure.isLoading,
    staleTime: 1000 * 60 * 5,
  });

  const primaryRecommendation = useMemo<SessionRecommendation | null>(
    () =>
      (recommendationsQuery.data ?? [])
        .filter(
          (item: { status: string; expiresAt: number }) =>
            item.status === 'ACTIVE' && item.expiresAt > Date.now(),
        )
        .sort(
          (a: { confidence?: number }, b: { confidence?: number }) =>
            (b.confidence ?? 0) - (a.confidence ?? 0),
        )[0] ?? null,
    [recommendationsQuery.data],
  );

  const canNavigateContentStudy = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.content_study),
  );
  const canNavigateSocial = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.social_tab),
  );

  const nextUnlockFeature = useMemo(
    () =>
      getNextUnlockFeature(
        disclosure.features as Record<
          string,
          { isUnlocked: boolean; isVisible: boolean; priority?: number }
        >,
      ),
    [disclosure.features],
  );
  const nextBestAction = getNextBestAction({
    completedSessions: disclosure.inputs.totalCompletedSessions,
    currentStreak,
    nextUnlockFeature,
  });

  return {
    streakData,
    progData,
    currentStreak,
    currentXp,
    todayFocusMinutes,
    progressPercent,
    isFirstRun,
    createRecommendation,
    updateRecommendationStatus,
    activeStudyPlanQuery,
    learningExecutionLayer,
    comebackQuery,
    recommendationsQuery,
    primaryRecommendation,
    canNavigateContentStudy,
    canNavigateSocial,
    nextBestAction,
  };
}
