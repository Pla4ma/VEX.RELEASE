import { useEffect, useMemo } from 'react';

import {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
} from '../../../features/ai-coach/hooks/useRecommendationMutations';
import type { SessionRecommendation } from '../../../features/ai-coach/schemas/recommendations';
import type { HomeActionIntent } from '../../../features/home-spine/schemas';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { NextBestAction } from '../../../features/progression';
import type { SessionStackParams } from '../../../navigation/types';

export interface HomeReturnReason {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  intent: HomeActionIntent;
  source:
    | 'coach'
    | 'comeback'
    | 'study-plan'
    | 'next-best-action'
    | 'completion-highlight';
  tone: 'default' | 'celebration' | 'info' | 'warning';
  onPress: () => Promise<void> | void;
}

interface UseHomeReturnReasonParams {
  activeStudyPlan: {
    completedTasks: number;
    remainingMinutes: number;
    title: string;
    totalTasks: number;
  } | null;
  canShowExpansionSystems: boolean;
  comebackMessage: string | null;
  createRecommendation: ReturnType<typeof useCreateRecommendation>;
  currentLevel: number;
  currentStreak: number;
  latestSessionEndedAt: number | null;
  nextBestAction: NextBestAction;
  openNextAction: () => void;
  openSetup: (params?: SessionStackParams['SessionSetup']) => void;
  primaryRecommendation: SessionRecommendation | null;
  recommendationsLoading: boolean;
  updateRecommendationStatus: ReturnType<typeof useUpdateRecommendationStatus>;
  userId: string;
  onContinueStudyPlan: () => void;
}

export function useHomeReturnReason({
  activeStudyPlan,
  canShowExpansionSystems,
  comebackMessage,
  createRecommendation,
  currentLevel,
  currentStreak,
  latestSessionEndedAt,
  nextBestAction,
  openNextAction,
  openSetup,
  primaryRecommendation,
  recommendationsLoading,
  updateRecommendationStatus,
  userId,
  onContinueStudyPlan,
}: UseHomeReturnReasonParams) {
  useEffect(() => {
    if (
      !userId ||
      primaryRecommendation ||
      createRecommendation.isPending ||
      recommendationsLoading
    ) {
      return;
    }
    createRecommendation.mutate({
      userId,
      type: currentStreak > 0 ? 'STREAK_PROTECTION' : 'OPTIMAL_TIME',
      context: {
        streakDays: currentStreak,
        currentLevel,
        hoursSinceLastSession: latestSessionEndedAt
          ? Math.max(
              1,
              Math.round((Date.now() - latestSessionEndedAt) / 3600000),
            )
          : 24,
      },
    });
  }, [
    createRecommendation,
    currentLevel,
    currentStreak,
    latestSessionEndedAt,
    primaryRecommendation,
    recommendationsLoading,
    userId,
  ]);

  const returnReason = useMemo<HomeReturnReason>(() => {
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan,
      canShowExpansionSystems,
      comebackMessage,
      nextBestAction,
      primaryRecommendation: primaryRecommendation
        ? {
            id: primaryRecommendation.id,
            reasoning:
              primaryRecommendation.reasoning ?? primaryRecommendation.reason,
            suggestedDifficulty:
              primaryRecommendation.suggestedDifficulty ?? 'NORMAL',
            suggestedDuration:
              primaryRecommendation.suggestedDuration ?? 15 * 60,
            type: primaryRecommendation.recommendationType,
          }
        : null,
    });

    const getOnPress = () => {
      if (reasonState.intent === 'continue-study-plan') {
        return onContinueStudyPlan;
      }

      if (reasonState.intent === 'accept-coach-recommendation') {
        return async () => {
          if (!userId || !reasonState.recommendationId) {
            return;
          }

          await updateRecommendationStatus.mutateAsync({
            recommendationId: reasonState.recommendationId,
            status: 'ACCEPTED',
            userId,
          });
          openSetup({
            recommendationId: reasonState.recommendationId,
            suggestedDifficulty: reasonState.suggestedDifficulty,
            suggestedDurationSeconds: reasonState.suggestedDurationSeconds,
          });
        };
      }

      return reasonState.source === 'next-best-action'
        ? openNextAction
        : () => openSetup();
    };

    return {
      body: reasonState.body,
      ctaLabel: reasonState.ctaLabel,
      eyebrow: reasonState.eyebrow,
      intent: reasonState.intent,
      onPress: getOnPress(),
      source: reasonState.source,
      title: reasonState.title,
      tone: reasonState.tone,
    };
  }, [
    activeStudyPlan,
    canShowExpansionSystems,
    comebackMessage,
    nextBestAction,
    onContinueStudyPlan,
    openNextAction,
    openSetup,
    primaryRecommendation,
    updateRecommendationStatus,
    userId,
  ]);

  return { returnReason };
}
