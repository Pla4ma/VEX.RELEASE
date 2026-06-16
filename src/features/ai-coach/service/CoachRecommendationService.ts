import { createDebugger } from '@/utils/debug';
import type {
  CoachRecommendation,
  CoachRecommendationType,
  UrgencyLevel,
  RecommendationContext,
  CoachPersona,
  CoachPersonaId,
} from './CoachRecommendationService-types';
import { COACH_PERSONAS } from './coach-persona-config';
import { RECOMMENDATION_RULES } from './recommendation-rules';

const debug = createDebugger('coach:recommendation');

export class CoachRecommendationService {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  private getPersona(): CoachPersona {
    const personaId = this.context.coachPersonaId as CoachPersonaId;
    return COACH_PERSONAS[personaId] ?? COACH_PERSONAS.mentor;
  }

  getRecommendation(): CoachRecommendation {
    const persona = this.getPersona();
    const ctx = this.context;
    const coldStartEvidence =
      ctx.totalSessions < 3
        ? { fallbackReason: 'cold_start' as const }
        : undefined;

    for (const rule of RECOMMENDATION_RULES) {
      try {
        if (rule.condition(this.context)) {
          const recommendation = rule.generate(this.context, persona);
          debug.info('[CoachRecommendationService] Selected: %s', rule.name, {
            priority: recommendation.priority,
            type: recommendation.type,
            urgency: recommendation.urgency,
          });
          return {
            ...recommendation,
            evidence: recommendation.evidence ?? coldStartEvidence,
          };
        }
      } catch (error) {
        debug.error(
          `Rule ${rule.name} failed`,
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }

    const defaultRule = RECOMMENDATION_RULES[RECOMMENDATION_RULES.length - 1]!;
    return defaultRule.generate(this.context, persona);
  }

  getAllApplicable(): CoachRecommendation[] {
    const persona = this.getPersona();
    const result: CoachRecommendation[] = [];
    for (const rule of RECOMMENDATION_RULES) {
      if (rule.condition(this.context)) {
        result.push(rule.generate(this.context, persona));
      }
    }
    return result;
  }

  shouldRefresh(
    lastRefreshTime: number,
    currentRec: CoachRecommendation,
  ): boolean {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const timeSinceRefresh = Date.now() - lastRefreshTime;
    if (timeSinceRefresh > FIVE_MINUTES) {return true;}
    if (currentRec.expiresAt && Date.now() > currentRec.expiresAt) {return true;}

    if (
      currentRec.urgency === 'critical' &&
      currentRec.type === 'protect_streak'
    ) {
      const hoursLeft = this.context.hoursUntilStreakBreak ?? 24;
      if (hoursLeft <= 1 && timeSinceRefresh > 60000) {return true;}
      if (hoursLeft <= 2 && timeSinceRefresh > 300000) {return true;}
    }
    return false;
  }
}

export function createCoachRecommendationService(
  context: RecommendationContext,
): CoachRecommendationService {
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
  ctaAction:
    | 'start_focus'
    | 'start_study'
    | 'view_boss'
    | 'view_streak'
    | 'view_progress';
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

export { COACH_PERSONAS };
export type {
  CoachRecommendation,
  CoachRecommendationType,
  UrgencyLevel,
  RecommendationContext,
  CoachPersona,
  CoachPersonaId,
};
