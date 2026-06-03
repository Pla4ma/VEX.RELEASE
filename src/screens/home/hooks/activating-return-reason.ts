import {
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from '../../../features/ai-coach';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { NextBestAction } from '../../../features/progression';
import type { RecommendationForReturnReason } from './home-query-types';

interface ActivatingReturnReasonParams {
  shouldShowExpansionSystems: boolean;
  nextBestAction: NextBestAction;
  primaryRecommendation: SessionRecommendation | null;
  updateRecommendationStatus: ReturnType<typeof useUpdateRecommendationStatus>;
  openNextAction: () => void;
  openSetup: (params?: Record<string, unknown>) => void;
  userId: string;
}

export function buildActivatingReturnReason(
  params: ActivatingReturnReasonParams,
): HomeReturnReason {
  const {
    shouldShowExpansionSystems,
    nextBestAction,
    primaryRecommendation,
    updateRecommendationStatus,
    openNextAction,
    openSetup,
    userId,
  } = params;

  const reasonState = buildHomeReturnReasonState({
    activeStudyPlan: null,
    canShowExpansionSystems: shouldShowExpansionSystems,
    comebackMessage: null,
    nextBestAction,
    primaryRecommendation: primaryRecommendation
      ? {
          id: primaryRecommendation.id,
          reasoning:
            ((primaryRecommendation as RecommendationForReturnReason)
              .reasoning as string) ??
            ((primaryRecommendation as RecommendationForReturnReason)
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

  const onPress: () => Promise<void> | void =
    reasonState.intent === 'accept-coach-recommendation' &&
    reasonState.recommendationId
      ? async () => {
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
        }
      : reasonState.source === 'next-best-action'
        ? openNextAction
        : () => openSetup();

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
