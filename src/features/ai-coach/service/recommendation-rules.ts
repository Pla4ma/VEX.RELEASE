import type { CoachRecommendation, CoachRecommendationType, RecommendationContext, CoachPersona } from './CoachRecommendationService-types';
import {
  generateProtectStreakMessage,
  generateStudyBehindMessage,
  generateBossOpportunityMessage,
  generateMomentumBuildingMessage,
} from './recommendation-messages';
import {
  generateComebackMessage,
  generateStudyPlanCompleteMessage,
  generateFocusSessionMessage,
  generateStudyPlanMessage,
  generateBossBattleMessage,
} from './recommendation-messages-engaging';
import { RECOMMENDATION_RULES_STANDARD } from './recommendation-rules-standard';

export function generateMessage(
  type: CoachRecommendationType,
  context: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const generators: Record<
    CoachRecommendationType,
    (ctx: RecommendationContext, p: CoachPersona) => { headline: string; subtext: string; coachMessage: string }
  > = {
    protect_streak: generateProtectStreakMessage,
    study_behind: generateStudyBehindMessage,
    boss_opportunity: generateBossOpportunityMessage,
    momentum_building: generateMomentumBuildingMessage,
    comeback: generateComebackMessage,
    study_plan_complete: generateStudyPlanCompleteMessage,
    focus_session: generateFocusSessionMessage,
    study_plan: generateStudyPlanMessage,
    boss_battle: generateBossBattleMessage,
  };
  return generators[type](context, persona);
}

export interface RecommendationRule {
  name: string;
  priority: number;
  condition: (ctx: RecommendationContext) => boolean;
  generate: (ctx: RecommendationContext, persona: CoachPersona) => CoachRecommendation;
}

const RULES_HIGH_PRIORITY: RecommendationRule[] = [
  {
    name: 'streak_critical',
    priority: 100,
    condition: (ctx) => {
      if (ctx.streakDays === 0) {return false;}
      if (ctx.hasCompletedSessionToday) {return false;}
      return (ctx.hoursUntilStreakBreak ?? 24) <= 4;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('protect_streak', ctx, persona);
      const hoursLeft = ctx.hoursUntilStreakBreak ?? 0;
      return {
        id: `streak-critical-${Date.now()}`,
        type: 'protect_streak',
        priority: 100,
        urgency: hoursLeft <= 2 ? 'critical' : 'high',
        ...messages,
        ctaText: hoursLeft <= 2 ? 'Quick 15-min session' : 'Start focus session',
        ctaAction: 'start_focus',
        ctaParams: { duration: 15, reason: 'streak_protection' },
        reasoning: `Streak protection: ${ctx.streakDays} days, ${hoursLeft} hours remaining`,
        visualCue: hoursLeft <= 2 ? 'urgent' : 'glow',
      };
    },
  },
  {
    name: 'study_behind',
    priority: 90,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {return false;}
      return ctx.studyPlanDaysBehind >= 2;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('study_behind', ctx, persona);
      const plan = ctx.activeStudyPlan!;
      return {
        id: `study-behind-${Date.now()}`,
        type: 'study_behind',
        priority: 90,
        urgency: ctx.studyPlanDaysBehind >= 3 ? 'high' : 'medium',
        ...messages,
        ctaText: 'Catch up now',
        ctaAction: 'start_study',
        ctaParams: { planId: plan.generationId, reason: 'catch_up' },
        reasoning: `Study plan ${ctx.studyPlanDaysBehind} days behind`,
        visualCue: ctx.studyPlanDaysBehind >= 3 ? 'pulse' : 'glow',
      };
    },
  },
  {
    name: 'boss_opportunity',
    priority: 85,
    condition: (ctx) => {
      if (!ctx.activeBoss) {return false;}
      const hp = (ctx.activeBoss.healthRemaining / ctx.activeBoss.maxHealth) * 100;
      return hp < 30 && hp > 0;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('boss_opportunity', ctx, persona);
      return {
        id: `boss-opportunity-${Date.now()}`,
        type: 'boss_opportunity',
        priority: 85,
        urgency: 'high',
        ...messages,
        ctaText: 'Attack now',
        ctaAction: 'view_boss',
        reasoning: 'Boss kill opportunity: <30% health',
        visualCue: 'pulse',
      };
    },
  },
  {
    name: 'study_plan_complete',
    priority: 80,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {return false;}
      return ctx.studyPlanProgress >= 1;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('study_plan_complete', ctx, persona);
      return {
        id: `study-complete-${Date.now()}`,
        type: 'study_plan_complete',
        priority: 80,
        urgency: 'low',
        ...messages,
        ctaText: 'View progress',
        ctaAction: 'view_progress',
        reasoning: 'Study plan completed - celebration',
        visualCue: 'glow',
      };
    },
  },
];

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  ...RULES_HIGH_PRIORITY,
  ...RECOMMENDATION_RULES_STANDARD,
];
