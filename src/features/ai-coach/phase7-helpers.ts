import { eventBus } from "../../events";
import type { CoachInputContract } from "./input-contract";
import type { CoachPriority, CoachSuggestion } from "./phase7-schemas";
import { v4 } from "../../utils/uuid";

export function generateUUID(): string {
  return v4();
}

export function determineCoachPriority(
  input: CoachInputContract,
): CoachPriority {
  if (
    input.streakState.streakAtRisk &&
    input.streakState.hoursSinceLastSession > 20
  ) {
    return "critical";
  }
  if (input.streakState.streakAtRisk) {
    return "high";
  }
  if (input.focusScoreFactors.trend === "declining") {
    return "medium";
  }
  return "low";
}

export async function generateContextualMessage(
  input: CoachInputContract,
  priority: CoachPriority,
): Promise<string> {
  const duration = getDurationMinutes(input.preferredSessionLengths[0]);
  if (priority === "critical") {
    return `Your ${input.streakState.currentStreak}-day streak is at risk! Try a ${duration}-minute session tonight to protect it.`;
  }
  if (priority === "high") {
    return `Based on your recent sessions, a ${duration}-minute session would maintain your momentum.`;
  }
  const timeOfDay = input.timeContext?.currentHour
    ? getTimeOfDay(input.timeContext.currentHour)
    : "evening";
  return `Your patterns show you focus best in the ${timeOfDay}. Consider a session then.`;
}

export function extractSuggestionTitle(message: string): string {
  return message.length > 50 ? `${message.substring(0, 47)}...` : message;
}

export function extractActionFromMessage(message: string): string {
  const actionMatch = message.match(/(try|start|complete|do)\s+[^.!?]+/i);
  return actionMatch ? actionMatch[0] : "Start your next block";
}

export async function analyzeSessionPatterns(
  input: CoachInputContract,
): Promise<{
  duration: number;
  difficulty: string;
  priority: "high" | "medium" | "low";
} | null> {
  const preferredDuration = getDurationMinutes(
    input.preferredSessionLengths[0],
  );
  const recentGrades = input.recentSessionGrades;
  if (recentGrades.length === 0) {
    return null;
  }

  const averageGrade =
    recentGrades.reduce((sum, session) => sum + session.grade, 0) /
    recentGrades.length;
  let difficulty = "NORMAL";
  if (averageGrade >= 90) {
    difficulty = "CHALLENGING";
  } else if (averageGrade < 70) {
    difficulty = "EASY";
  }

  let priority: "high" | "medium" | "low" = "medium";
  if (input.streakState.streakAtRisk) {
    priority = "high";
  } else if (averageGrade > 85) {
    priority = "low";
  }

  return { duration: preferredDuration, difficulty, priority };
}

export async function generateRecommendationMessage(recommendation: {
  duration: number;
  difficulty: string;
}): Promise<string> {
  return `Your recent sessions show ${recommendation.difficulty.toLowerCase()} difficulty works well. Try a ${recommendation.duration}-minute ${recommendation.difficulty} session today.`;
}

export async function generateStreakProtectionMessage(
  input: CoachInputContract,
  streakData: { currentStreak: number; hoursSinceLastSession: number },
): Promise<string> {
  const hoursLeft = Math.max(0, 24 - streakData.hoursSinceLastSession);
  const duration = getDurationMinutes(input.preferredSessionLengths[0]);
  return `Your ${streakData.currentStreak}-day streak expires in ${hoursLeft} hours! A quick ${duration}-minute session will save it.`;
}

function getDurationMinutes(durationSeconds?: number): number {
  if (durationSeconds === undefined) {
    return 25;
  }
  return durationSeconds > 300
    ? Math.round(durationSeconds / 60)
    : durationSeconds;
}

export async function createDailyMissionFromSuggestion(
  _userId: string,
  _suggestion: CoachSuggestion,
): Promise<string> {
  return generateUUID();
}

export function trackCoachSuggestionAccepted(
  userId: string,
  suggestionId: string,
  action: string,
): void {
  eventBus.publish("analytics:track", {
    event: "vex_coach_suggestion_accepted",
    properties: { userId, suggestionId, action },
    timestamp: Date.now(),
  });
}

export function trackCoachSuggestionConversionFailed(
  userId: string,
  suggestionId: string,
  error: unknown,
): void {
  eventBus.publish("analytics:track", {
    event: "vex_coach_suggestion_conversion_failed",
    properties: {
      userId,
      suggestionId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    },
    timestamp: Date.now(),
  });
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 22) {
    return "evening";
  }
  return "night";
}
