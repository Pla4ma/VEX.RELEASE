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

function laneNativeCta(lane: string | undefined): string {
  switch (lane) {
    case "student":
      return "Start next study block";
    case "game_like":
      return "Start next run";
    case "deep_creative":
      return "Protect next move";
    case "minimal_normal":
      return "See next step";
    default:
      return "Start next focus";
  }
}

function laneNativeReason(
  lane: string | undefined,
  defaultReason: string,
): string {
  switch (lane) {
    case "student":
      return "Pick one topic and name it before starting.";
    case "game_like":
      return "Momentum builds with each clean run. Keep it going.";
    case "deep_creative":
      return "Name the next concrete move before you start.";
    case "minimal_normal":
      return "One action, no noise. Just pick the next thing.";
    default:
      return defaultReason;
  }
}

function behaviorAdjustedDuration(
  summary: SessionSummary,
): number {
  const baseDuration = Math.max(15 * 60, Math.min(summary.plannedDuration, 45 * 60));
  if (summary.completionPercentage < 50) {
    return Math.min(baseDuration, 15 * 60);
  }
  const effectiveMinutes = Math.round(summary.effectiveDuration / 60);
  if (effectiveMinutes < 20) {
    return effectiveMinutes * 60;
  }
  return baseDuration;
}

export function buildPostSessionNextAction(input: {
  summary: SessionSummary;
  studyContext?: SessionStudyContext;
  lane?: string;
}): PostSessionNextAction {
  const { studyContext, summary, lane } = input;
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

    const behaviorDuration = behaviorAdjustedDuration(summary);
    const studyRouteParams = {
      ...routeParams,
      suggestedDurationSeconds: behaviorDuration,
    };

    return PostSessionNextActionSchema.parse({
      ctaLabel: "Review next",
      id: studyRouteParams.recommendationId,
      reason: `Review ${target} while the session is still fresh.`,
      routeParams: studyRouteParams,
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

  const behaviorDuration = behaviorAdjustedDuration(summary);
  const finalRouteParams = {
    ...routeParams,
    suggestedDurationSeconds: behaviorDuration,
  };

  return PostSessionNextActionSchema.parse({
    ctaLabel: laneNativeCta(lane),
    id: finalRouteParams.recommendationId,
    reason: laneNativeReason(lane, recommendation.reason),
    routeParams: finalRouteParams,
  });
}
