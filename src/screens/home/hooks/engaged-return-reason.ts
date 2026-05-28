import {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from "../../../features/ai-coach";
import { buildHomeReturnReasonState } from "../../../features/home-spine/service";
import type { HomeReturnReason } from "./useHomeReturnReason";
import type { NextBestAction } from "../../../features/progression";

interface ReturnReasonParams {
  activeStudyPlanData: Record<string, unknown> | undefined;
  comebackData: Record<string, unknown> | undefined;
  shouldShowExpansionSystems: boolean;
  nextBestAction: NextBestAction;
  primaryRecommendation: SessionRecommendation | null;
  continueStudyPlan: () => void;
  updateRecommendationStatus: ReturnType<typeof useUpdateRecommendationStatus>;
  openNextAction: () => void;
  openSetup: (params?: Record<string, unknown>) => void;
  userId: string;
}

export function buildEngagedReturnReason(
  params: ReturnReasonParams,
): HomeReturnReason {
  const {
    activeStudyPlanData,
    comebackData,
    shouldShowExpansionSystems,
    nextBestAction,
    primaryRecommendation,
    continueStudyPlan,
    updateRecommendationStatus,
    openNextAction,
    openSetup,
    userId,
  } = params;

  const reasonState = buildHomeReturnReasonState({
    activeStudyPlan: activeStudyPlanData
      ? {
          completedTasks: (activeStudyPlanData.completedTasks as number) ?? 0,
          remainingMinutes:
            (activeStudyPlanData.remainingMinutes as number) ?? 0,
          title: (activeStudyPlanData.title as string) ?? "",
          totalTasks: (activeStudyPlanData.totalTasks as number) ?? 0,
        }
      : null,
    canShowExpansionSystems: shouldShowExpansionSystems,
    comebackMessage: comebackData?.isComeback
      ? ((comebackData.message as string) ?? null)
      : null,
    nextBestAction,
    primaryRecommendation: primaryRecommendation
      ? {
          id: primaryRecommendation.id,
          reasoning:
            ((primaryRecommendation as Record<string, unknown>)
              .reasoning as string) ??
            ((primaryRecommendation as Record<string, unknown>)
              .reason as string) ??
            "",
          suggestedDifficulty:
            primaryRecommendation.suggestedDifficulty ?? "NORMAL",
          suggestedDuration:
            primaryRecommendation.suggestedDuration ?? 15 * 60,
          type: primaryRecommendation.recommendationType,
        }
      : null,
  });

  let onPress: () => Promise<void> | void = () => openSetup();
  if (reasonState.intent === "continue-study-plan") {
    onPress = continueStudyPlan;
  } else if (
    reasonState.intent === "accept-coach-recommendation" &&
    reasonState.recommendationId
  ) {
    onPress = async () => {
      await updateRecommendationStatus.mutateAsync({
        recommendationId: reasonState.recommendationId!,
        status: "ACCEPTED",
        userId,
      });
      openSetup({
        recommendationId: reasonState.recommendationId,
        suggestedDifficulty: reasonState.suggestedDifficulty,
        suggestedDurationSeconds: reasonState.suggestedDurationSeconds,
      });
    };
  } else if (reasonState.source === "next-best-action") {
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
