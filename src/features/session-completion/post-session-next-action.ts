import { generateSessionRecommendation } from "../session-recommendation/service";
import type { SessionMode as RecommendationMode } from "../session-recommendation/types";
import type { SessionSummary } from "../../session/types";
import {
  PostSessionNextActionSchema,
  type PostSessionNextAction,
} from "./schemas";
import {
  hasActiveStudyFollowUp,
  type SessionStudyContext,
} from "./study-context";

function mapRecommendationMode(
  mode: RecommendationMode,
): PostSessionNextAction["routeParams"]["presetMode"] {
  if (mode === "STUDY") {
    return "STUDY";
  }
  if (mode === "RECOVERY") {
    return "SPRINT";
  }
  if (mode === "BOSS_PREP") {
    return "DEEP_WORK";
  }
  return "LIGHT_FOCUS";
}

function mapRecommendationDifficulty(input: {
  completionPercentage: number;
  focusPurityScore: number;
  mode: RecommendationMode;
}): PostSessionNextAction["routeParams"]["suggestedDifficulty"] {
  if (input.mode === "RECOVERY" || input.completionPercentage < 100) {
    return "EASY";
  }
  if (input.mode === "BOSS_PREP") {
    return "CHALLENGING";
  }
  if (input.focusPurityScore >= 95) {
    return "PUSH";
  }
  return "NORMAL";
}

export function buildPostSessionNextAction(input: {
  summary: SessionSummary;
  studyContext?: SessionStudyContext;
}): PostSessionNextAction {
  const { studyContext, summary } = input;
  if (studyContext && hasActiveStudyFollowUp(studyContext)) {
    const target =
      studyContext.studyTarget ??
      studyContext.learningExecutionLabel ??
      "study target";
    const routeParams = {
      presetMode: "STUDY" as const,
      recommendationId: `${summary.sessionId}:next-study`,
      suggestedDifficulty: "NORMAL" as const,
      suggestedDurationSeconds: Math.max(
        15 * 60,
        Math.min(summary.plannedDuration, 45 * 60),
      ),
    };

    return PostSessionNextActionSchema.parse({
      ctaLabel: "Review next",
      id: routeParams.recommendationId,
      reason: `Review ${target} while the session is still fresh.`,
      routeParams,
    });
  }

  const recommendation = generateSessionRecommendation({
    hasActiveSession: false,
    isFirstSession: false,
    recoveryStatus: summary.completionPercentage >= 100 ? "none" : "needed",
    recentGrade: String(summary.finalScore),
    recentSessionLength: Math.max(
      0,
      Math.round(summary.effectiveDuration / 60),
    ),
    streakUrgency: summary.streakMaintained ? "none" : "medium",
    timeOfDay: new Date(summary.createdAt).getHours(),
    userId: summary.userId,
  });
  const routeParams = {
    presetMode: mapRecommendationMode(recommendation.mode),
    recommendationId: `${summary.sessionId}:next-focus`,
    suggestedDifficulty: mapRecommendationDifficulty({
      completionPercentage: summary.completionPercentage,
      focusPurityScore: summary.focusPurityScore ?? summary.focusQuality,
      mode: recommendation.mode,
    }),
    suggestedDurationSeconds: recommendation.duration * 60,
  };

  return PostSessionNextActionSchema.parse({
    ctaLabel: "Start next focus",
    id: routeParams.recommendationId,
    reason: recommendation.reason,
    routeParams,
  });
}
