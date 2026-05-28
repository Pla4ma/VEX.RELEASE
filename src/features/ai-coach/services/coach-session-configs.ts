import { getPersonalizedContext } from "./coach-memory";
import type { CoachSessionConfig } from "./coach-session-types";

export function getStreakProtectionConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const preferredDuration = (context.preferredDuration as number) || 25;
  return {
    duration: Math.min(preferredDuration, 20),
    difficulty: "EASY",
    sessionType: "FOCUS",
    source: "STREAK_PROTECTION",
    context: {
      coachReasoning: `Quick ${Math.min(preferredDuration, 20)}-minute session to protect your streak. Based on your history, you can absolutely do this.`,
      userStreakDays: context.personalBestStreak as number,
      isStreakAtRisk: true,
    },
  };
}

export function getComebackBuilderConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const comebackCount = (context.comebackCount as number) || 0;
  return {
    duration: 25,
    difficulty: "NORMAL",
    sessionType: "FOCUS",
    source: "COMEBACK_BUILDER",
    context: {
      coachReasoning:
        comebackCount > 0
          ? `Comeback #${comebackCount + 1} starts now. 25 minutes to rebuild momentum.`
          : "Fresh start time. 25 minutes to begin your new streak. You've got this!",
      isComebackMode: true,
    },
  };
}

export function getOptimalTimeConfig(userId: string): CoachSessionConfig {
  const context = getPersonalizedContext(userId);
  const productiveTime = context.productiveTimeOfDay as string;
  const preferredDuration = (context.preferredDuration as number) || 25;
  return {
    duration: preferredDuration,
    difficulty: "CHALLENGING",
    sessionType: "FOCUS",
    source: "OPTIMAL_TIME",
    context: {
      coachReasoning: productiveTime
        ? `It's your power time (${productiveTime})! A ${preferredDuration}-minute session now will be incredibly productive.`
        : `Your optimal focus window is open! Based on your patterns, a ${preferredDuration}-minute session would be perfect right now.`,
      optimalTimeWindow: true,
    },
  };
}

export function getCoachRecommendedConfig(
  userId: string,
  recommendation: { duration: number; difficulty: string; reasoning: string },
): CoachSessionConfig {
  return {
    duration: recommendation.duration,
    difficulty: recommendation.difficulty as CoachSessionConfig["difficulty"],
    sessionType: "FOCUS",
    source: "COACH_RECOMMENDATION",
    context: { coachReasoning: recommendation.reasoning },
  };
}
