import { z } from "zod";
import { createDebugger } from "../../utils/debug";
import type { ContextSnapshot } from "./context-snapshot";


export const CoachRecommendationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['session', 'duration', 'difficulty', 'time', 'social', 'break']),
  title: z.string(),
  description: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  actionType: z.enum(['start_session', 'adjust_duration', 'join_squad', 'take_break', 'view_progress']),
  suggestedDuration: z.number().optional(),
  suggestedDifficulty: z.enum(['easy', 'normal', 'challenging', 'push']).optional(),
  suggestedTime: z.number().optional(),
  expiresAt: z.number(),
});

export async function generateRecommendations(userId: string, context: ContextSnapshot): Promise<CoachRecommendation[]> {
  const recommendations: CoachRecommendation[] = [];
  const now = Date.now();

  // Streak protection recommendation
  if (context.streakContext.streakAtRisk) {
    recommendations.push({
      id: `rec-streak-${now}`,
      userId,
      type: 'session',
      title: 'Protect Your Streak',
      description: `Complete a session in the next ${Math.max(0, 24 - context.streakContext.hoursSinceLastSession)} hours to keep your ${context.streakContext.currentStreak}-day streak alive.`,
      reasoning: 'Streak is at risk of breaking',
      confidence: 0.95,
      priority: 'critical',
      actionType: 'start_session',
      suggestedDuration: 15,
      suggestedDifficulty: 'easy',
      expiresAt: now + 6 * 60 * 60 * 1000,
    });
  }

  // Boss battle recommendation
  if (context.bossContext.activeBoss && context.bossContext.timeRemaining && context.bossContext.timeRemaining < 24 * 60 * 60 * 1000) {
    recommendations.push({
      id: `rec-boss-${now}`,
      userId,
      type: 'session',
      title: 'Boss Escaping Soon',
      description: `The boss has ${Math.ceil(context.bossContext.timeRemaining / (60 * 60 * 1000))} hours remaining. Deal damage now!`,
      reasoning: 'Active boss battle nearing timeout',
      confidence: 0.9,
      priority: 'high',
      actionType: 'start_session',
      suggestedDuration: context.bossContext.bossHealth && context.bossContext.bossHealth > 50 ? 45 : 25,
      suggestedDifficulty: 'challenging',
      expiresAt: now + context.bossContext.timeRemaining,
    });
  }

  // Optimal time recommendation
  const optimalHour = getOptimalSessionHour(context);
  if (context.temporalContext.hourOfDay === optimalHour && !context.sessionContext.activeSession) {
    recommendations.push({
      id: `rec-time-${now}`,
      userId,
      type: 'time',
      title: 'Perfect Time to Focus',
      description: 'This is typically your most productive hour. Take advantage of it!',
      reasoning: 'User historical pattern shows high success at this time',
      confidence: 0.85,
      priority: 'medium',
      actionType: 'start_session',
      suggestedDuration: context.behaviorContext.typicalSessionDuration,
      suggestedDifficulty: 'normal',
      suggestedTime: optimalHour,
      expiresAt: now + 60 * 60 * 1000,
    });
  }

  // Squad war recommendation
  if (context.socialContext.hasSquad && context.socialContext.squadWarActive) {
    recommendations.push({
      id: `rec-war-${now}`,
      userId,
      type: 'social',
      title: 'Squad War Active',
      description: 'Your squad is in a war. Contribute focus time to help win!',
      reasoning: 'Active squad war needs contribution',
      confidence: 0.8,
      priority: 'medium',
      actionType: 'join_squad',
      suggestedDuration: 30,
      expiresAt: now + 4 * 60 * 60 * 1000,
    });
  }

  // Break recommendation after long streaks
  if (context.progressContext.sessionsThisWeek > 10 && context.temporalContext.isWeekend) {
    recommendations.push({
      id: `rec-break-${now}`,
      userId,
      type: 'break',
      title: 'Consider a Recovery Day',
      description: 'You have been crushing it this week. A rest day might help you come back stronger.',
      reasoning: 'High weekly session count suggests need for recovery',
      confidence: 0.7,
      priority: 'low',
      actionType: 'take_break',
      expiresAt: now + 24 * 60 * 60 * 1000,
    });
  }

  debug.info('Generated %d recommendations for user %s', recommendations.length, userId);
  return recommendations.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}

export function filterActiveRecommendations(recommendations: CoachRecommendation[]): CoachRecommendation[] {
  const now = Date.now();
  return recommendations.filter((r) => r.expiresAt > now);
}

export function getTopRecommendation(recommendations: CoachRecommendation[]): CoachRecommendation | null {
  const active = filterActiveRecommendations(recommendations);
  return active.length > 0 ? active[0] : null;
}

export function isRecommendationRelevant(recommendation: CoachRecommendation, context: ContextSnapshot): boolean {
  // Check expiration
  if (recommendation.expiresAt < Date.now()) {
    return false;
  }

  // Context-specific checks
  if (recommendation.type === 'session' && context.sessionContext.activeSession) {
    return false;
  }

  if (recommendation.type === 'break' && context.progressContext.sessionsThisWeek < 5) {
    return false;
  }

  if (recommendation.type === 'social' && !context.socialContext.hasSquad) {
    return false;
  }

  return true;
}

export function formatRecommendation(recommendation: CoachRecommendation): {
  title: string;
  subtitle: string;
  cta: string;
} {
  const difficultyLabels = {
    easy: 'Easy Start',
    normal: 'Standard',
    challenging: 'Challenge',
    push: 'Push Mode',
  };

  let cta = 'Start Session';
  if (recommendation.actionType === 'take_break') {
    cta = 'Take Break';
  } else if (recommendation.actionType === 'join_squad') {
    cta = 'View Squad';
  } else if (recommendation.suggestedDifficulty) {
    cta = `${difficultyLabels[recommendation.suggestedDifficulty]} (${recommendation.suggestedDuration}m)`;
  }

  return {
    title: recommendation.title,
    subtitle: recommendation.description,
    cta,
  };
}