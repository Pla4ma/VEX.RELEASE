import type { SessionRecommendation } from '../../../features/ai-coach';
import type { RecommendationStatus } from '../../../features/ai-coach';
import type { NextBestAction } from '../../../features/progression';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeReturnReason } from './useHomeReturnReason';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { ActiveStudyPlanData, ComebackStateData, RecommendationForReturnReason } from './home-query-types';

interface ReturnReasonParams {
  activeStudyPlanData: ActiveStudyPlanData | undefined;
  comebackData: ComebackStateData | undefined;
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
          completedTasks: activeStudyPlanData.completedTasks,
          remainingMinutes: activeStudyPlanData.remainingMinutes,
          title: activeStudyPlanData.title,
          totalTasks: activeStudyPlanData.totalTasks,
        }
      : null,
    canShowExpansionSystems: runtime.shouldShowExpansionSystems,
    comebackMessage: comebackData?.isComeback
      ? (comebackData.message ?? null)
      : null,
    nextBestAction: nextBestAction!,
    primaryRecommendation: primaryRecommendation
      ? {
          id: primaryRecommendation.id,
          reasoning:
            (primaryRecommendation as RecommendationForReturnReason).reasoning ??
            (primaryRecommendation as RecommendationForReturnReason).reason ??
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
