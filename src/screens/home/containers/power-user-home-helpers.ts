import type { SessionRecommendation } from "../../../features/ai-coach";
import type { HomeReturnReason } from "../hooks/useHomeReturnReason";
import { buildHomeReturnReasonState } from "../../../features/home-spine/service";
import type {
  ActiveStudyPlanData,
  ComebackData,
} from "./power-user-home-types";

export function buildReturnReasonConfig(params: {
  activeStudyPlanData: ActiveStudyPlanData | undefined;
  comebackData: ComebackData | undefined;
  shouldShowExpansionSystems: boolean;
  primaryRecommendation: SessionRecommendation | null;
  nextBestAction: { type: string } | null;
  continueStudyPlan: () => void;
  openNextAction: () => void;
  openSetup: (params?: Record<string, unknown>) => void;
  updateRecommendationStatus: {
    mutateAsync: (args: {
      recommendationId: string;
      status: string;
      userId: string;
    }) => Promise<unknown>;
  };
  userId: string;
}): HomeReturnReason {
  const {
    activeStudyPlanData,
    comebackData,
    shouldShowExpansionSystems,
    primaryRecommendation,
    nextBestAction,
    continueStudyPlan,
    openNextAction,
    openSetup,
    updateRecommendationStatus,
    userId,
  } = params;

  const reasonState = buildHomeReturnReasonState({
    activeStudyPlan: activeStudyPlanData
      ? {
          completedTasks: activeStudyPlanData.completedTasks ?? 0,
          remainingMinutes: activeStudyPlanData.remainingMinutes ?? 0,
          title: activeStudyPlanData.title ?? "",
          totalTasks: activeStudyPlanData.totalTasks ?? 0,
        }
      : null,
    canShowExpansionSystems: shouldShowExpansionSystems,
    comebackMessage: comebackData?.isComeback
      ? (comebackData.message ?? null)
      : null,
    nextBestAction,
    primaryRecommendation: primaryRecommendation
      ? {
          id: primaryRecommendation.id,
          reasoning: primaryRecommendation.reasoning ?? "",
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
