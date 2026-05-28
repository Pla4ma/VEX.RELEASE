import { createDebugger } from "../../utils/debug";
import type { ContextSnapshot } from "./context-snapshot";
import type { CoachRecommendation } from "./recommendation-pipeline-types";
export {
  CoachRecommendationSchema,
  type CoachRecommendation,
} from "./recommendation-pipeline-types";
export {
  filterActiveRecommendations,
  getTopRecommendation,
  isRecommendationRelevant,
  formatRecommendation,
  trackRecommendationInteraction,
  batchProcessRecommendations,
  attachRecommendationEvidence,
} from "./recommendation-utils";

const debug = createDebugger("ai-coach:recommendations");

export async function generateRecommendations(
  userId: string,
  context: ContextSnapshot,
): Promise<CoachRecommendation[]> {
  const recommendations: CoachRecommendation[] = [];
  const now = Date.now();
  if (context.streakContext.streakAtRisk) {
    recommendations.push({
      id: `rec-streak-${now}`,
      userId,
      type: "session",
      title: "Protect Your Streak",
      description: `Complete a session in the next ${Math.max(0, 24 - context.streakContext.hoursSinceLastSession)} hours to keep your ${context.streakContext.currentStreak}-day streak alive.`,
      reasoning: "Streak is at risk of breaking",
      confidence: 0.95,
      priority: "critical",
      actionType: "start_session",
      suggestedDuration: 15,
      suggestedDifficulty: "easy",
      expiresAt: now + 6 * 60 * 60 * 1000,
    });
  }
  if (
    context.bossContext.activeBoss &&
    context.bossContext.timeRemaining &&
    context.bossContext.timeRemaining < 24 * 60 * 60 * 1000
  ) {
    recommendations.push({
      id: `rec-boss-${now}`,
      userId,
      type: "session",
      title: "Boss Escaping Soon",
      description: `The boss has ${Math.ceil(context.bossContext.timeRemaining / (60 * 60 * 1000))} hours remaining. Deal damage now!`,
      reasoning: "Active boss battle nearing timeout",
      confidence: 0.9,
      priority: "high",
      actionType: "start_session",
      suggestedDuration:
        context.bossContext.bossHealth && context.bossContext.bossHealth > 50
          ? 45
          : 25,
      suggestedDifficulty: "challenging",
      expiresAt: now + context.bossContext.timeRemaining,
    });
  }
  const optimalHour = getOptimalSessionHour(context);
  if (
    context.temporalContext.hourOfDay === optimalHour &&
    !context.sessionContext.activeSession
  ) {
    recommendations.push({
      id: `rec-time-${now}`,
      userId,
      type: "time",
      title: "Perfect Time to Focus",
      description:
        "This is typically your most productive hour. Take advantage of it!",
      reasoning: "User historical pattern shows high success at this time",
      confidence: 0.85,
      priority: "medium",
      actionType: "start_session",
      suggestedDuration: context.behaviorContext.typicalSessionDuration,
      suggestedDifficulty: "normal",
      suggestedTime: optimalHour,
      expiresAt: now + 60 * 60 * 1000,
    });
  }
  if (context.socialContext.hasSquad && context.socialContext.squadWarActive) {
    recommendations.push({
      id: `rec-war-${now}`,
      userId,
      type: "social",
      title: "Squad War Active",
      description: "Your squad is in a war. Contribute focus time to help win!",
      reasoning: "Active squad war needs contribution",
      confidence: 0.8,
      priority: "medium",
      actionType: "join_squad",
      suggestedDuration: 30,
      expiresAt: now + 4 * 60 * 60 * 1000,
    });
  }
  if (
    context.progressContext.sessionsThisWeek > 10 &&
    context.temporalContext.isWeekend
  ) {
    recommendations.push({
      id: `rec-break-${now}`,
      userId,
      type: "break",
      title: "Consider a Recovery Day",
      description:
        "You have been crushing it this week. A rest day might help you come back stronger.",
      reasoning: "High weekly session count suggests need for recovery",
      confidence: 0.7,
      priority: "low",
      actionType: "take_break",
      expiresAt: now + 24 * 60 * 60 * 1000,
    });
  }
  debug.info(
    "Generated %d recommendations for user %s",
    recommendations.length,
    userId,
  );
  return recommendations.sort(
    (a, b) => priorityWeight(b.priority) - priorityWeight(a.priority),
  );
}

function priorityWeight(priority: CoachRecommendation["priority"]): number {
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };
  return weights[priority];
}

function getOptimalSessionHour(context: ContextSnapshot): number {
  const preferred = context.behaviorContext.preferredTimeOfDay;
  const hourMap = { morning: 9, afternoon: 14, evening: 19, night: 21 };
  return hourMap[preferred];
}
