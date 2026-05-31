import type { SessionRecommendation } from '../../../features/ai-coach';
import type { RecommendationStatus } from '../../../features/ai-coach';
import type { NextBestAction } from '../../../features/progression';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeReturnReason } from './useHomeReturnReason';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';

interface ReturnReasonParams {
  activeStudyPlanData: Record<string, unknown> | undefined;
  comebackData: Record<string, unknown> | undefined;
  runtime: HomeFeatureRuntime;
  nextBestAction: NextBestAction | null;
  primaryRecommendation: SessionRecommendation | null;
  openSetup: (params?: Record<string, unknown>) => void;
  continueStudyPlan: () => void;
  openNextAction: () => void;
  updateRecommendationStatus: {
    mutateAsync: (params: {
      recommendationId: string;
      status: RecommendationStatus;
      userId?: string;
    }) => Promise<unknown>;
  };
  userId: string;
}

export function buildReturnReason(params: ReturnReasonParams): HomeReturnReason {
  const {
    activeStudyPlanData,
    comebackData,
    runtime,
    nextBestAction,
    primaryRecommendation,
    openSetup,
    continueStudyPlan,
    openNextAction,
    updateRecommendationStatus,
    userId,
  } = params;

  const reasonState = buildHomeReturnReasonState({
    activeStudyPlan: activeStudyPlanData
      ? {
          completedTasks: (activeStudyPlanData.completedTasks as number) ?? 0,
          remainingMinutes: (activeStudyPlanData.remainingMinutes as number) ?? 0,
          title: (activeStudyPlanData.title as string) ?? '',
          totalTasks: (activeStudyPlanData.totalTasks as number) ?? 0,
        }
      : null,
    canShowExpansionSystems: runtime.shouldShowExpansionSystems,
    comebackMessage: comebackData?.isComeback
      ? ((comebackData.message as string) ?? null)
      : null,
    nextBestAction: nextBestAction!,
    primaryRecommendation: primaryRecommendation
      ? {
          id: primaryRecommendation.id,
          reasoning:
            ((primaryRecommendation as Record<string, unknown>)
              .reasoning as string) ??
            ((primaryRecommendation as Record<string, unknown>)
              .reason as string) ??
            '',
          suggestedDifficulty:
            primaryRecommendation.suggestedDifficulty ?? 'NORMAL',
          suggestedDuration:
            primaryRecommendation.suggestedDuration ?? 15 * 60,
          type: primaryRecommendation.recommendationType,
        }
      : null,
  });

  let onPress: () => Promise<void> | void = () => openSetup();
  if (reasonState.intent === 'continue-study-plan') {
    onPress = continueStudyPlan;
  } else if (
    reasonState.intent === 'accept-coach-recommendation' &&
    reasonState.recommendationId
  ) {
    onPress = async () => {
      await updateRecommendationStatus.mutateAsync({
        recommendationId: reasonState.recommendationId!,
        status: 'ACCEPTED',
        userId,
      });
      openSetup({
        recommendationId: reasonState.recommendationId,
        suggestedDifficulty: reasonState.suggestedDifficulty,
        suggestedDurationSeconds: reasonState.suggestedDurationSeconds,
      });
    };
  } else if (reasonState.source === 'next-best-action') {
    onPress = openNextAction;
  }

  return {
    body: reasonState.body,
    ctaLabel: reasonState.ctaLabel,
    eyebrow: reasonState.eyebrow,
    intent: reasonState.intent,
    onPress,
    source: reasonState.source,
    title: reasonState.title,
    tone: reasonState.tone,
  };
}
