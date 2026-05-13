import type { BehaviorProfile } from "../types";
import { createDebugger } from "@/utils/debug";


export class CoachRecommendationService {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  /**
   * Get the coach persona for message generation
   */
  private getPersona(): CoachPersona {
    const personaId = this.context.coachPersonaId as CoachPersonaId;
    return COACH_PERSONAS[personaId] ?? COACH_PERSONAS.mentor;
  }

  /**
   * Generate the best recommendation for current user state
   */
  getRecommendation(): CoachRecommendation {
    const persona = this.getPersona();

    // Find first matching rule (rules are in priority order)
    for (const rule of RECOMMENDATION_RULES) {
      try {
        if (rule.condition(this.context)) {
          const recommendation = rule.generate(this.context, persona);
          debug.info('[CoachRecommendationService] Selected: %s', rule.name, { priority: recommendation.priority, type: recommendation.type, urgency: recommendation.urgency });
          return recommendation;
        }
      } catch (error) {
        debug.error(`Rule ${rule.name} failed`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Fallback to default
    const defaultRule = RECOMMENDATION_RULES[RECOMMENDATION_RULES.length - 1];
    return defaultRule.generate(this.context, persona);
  }

  /**
   * Get all applicable recommendations (for debugging/analytics)
   */
  getAllApplicable(): CoachRecommendation[] {
    const persona = this.getPersona();
    return RECOMMENDATION_RULES.filter((rule) => rule.condition(this.context)).map((rule) => rule.generate(this.context, persona));
  }

  /**
   * Check if recommendation should refresh
   */
  shouldRefresh(lastRefreshTime: number, currentRec: CoachRecommendation): boolean {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const timeSinceRefresh = Date.now() - lastRefreshTime;

    // Refresh if: 5+ minutes passed, or recommendation expired
    if (timeSinceRefresh > FIVE_MINUTES) {
      return true;
    }
    if (currentRec.expiresAt && Date.now() > currentRec.expiresAt) {
      return true;
    }

    // Refresh if high urgency recommendation and time critical
    if (currentRec.urgency === 'critical' && currentRec.type === 'protect_streak') {
      const hoursLeft = this.context.hoursUntilStreakBreak ?? 24;
      // Refresh more frequently as deadline approaches
      if (hoursLeft <= 1 && timeSinceRefresh > 60000) {
        return true;
      } // 1 minute
      if (hoursLeft <= 2 && timeSinceRefresh > 300000) {
        return true;
      } // 5 minutes
    }

    return false;
  }
}

export function createCoachRecommendationService(context: RecommendationContext): CoachRecommendationService {
  return new CoachRecommendationService(context);
}

export function convertToHomeRecommendation(coachRec: CoachRecommendation): {
  id: string;
  type: string;
  priority: number;
  urgency: UrgencyLevel;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaAction: 'start_focus' | 'start_study' | 'view_boss' | 'view_streak' | 'view_progress';
  ctaParams?: Record<string, unknown>;
  aiCoachMessage?: string;
  visualCue: 'none' | 'pulse' | 'glow' | 'urgent';
} {
  return {
    id: coachRec.id,
    type: coachRec.type,
    priority: coachRec.priority,
    urgency: coachRec.urgency,
    headline: coachRec.headline,
    subtext: coachRec.subtext,
    ctaText: coachRec.ctaText,
    ctaAction: coachRec.ctaAction,
    ctaParams: coachRec.ctaParams,
    aiCoachMessage: coachRec.coachMessage,
    visualCue: coachRec.visualCue,
  };
}