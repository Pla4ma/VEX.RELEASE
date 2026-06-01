import type { RecommendationContext, CoachPersona, CoachRecommendation } from "./CoachRecommendationService-types";
import { generateMessage } from "./recommendation-message-generator";
import type { RecommendationRule } from "./recommendation-rules-types";

export const RECOMMENDATION_RULES_STANDARD: RecommendationRule[] = [
  {
    name: "continue_study_plan",
    priority: 75,
    condition: (ctx: RecommendationContext) => {
      if (!ctx.activeStudyPlan) return false;
      return ctx.studyPlanProgress < 1 && ctx.studyPlanProgress > 0;
    },
    generate: (ctx: RecommendationContext, persona: CoachPersona) => {
      const messages = generateMessage("study_plan", ctx, persona);
      const plan = ctx.activeStudyPlan!;
      return {
        id: `study-continue-${Date.now()}`,
        type: "study_plan",
        priority: 75,
        urgency: "medium",
        ...messages,
        ctaText: "Resume studying",
        ctaAction: "start_study",
        ctaParams: { planId: plan.generationId },
        reasoning: `Continue study plan: ${Math.round(ctx.studyPlanProgress * 100)}% complete`,
        visualCue: "none",
      };
    },
  },
  {
    name: "momentum_building",
    priority: 70,
    condition: (ctx: RecommendationContext) => {
      if (ctx.streakDays < 2) return false;
      if (!ctx.hasCompletedSessionToday) return false;
      return true;
    },
    generate: (ctx: RecommendationContext, persona: CoachPersona) => {
      const messages = generateMessage("momentum_building", ctx, persona);
      return {
        id: `momentum-${Date.now()}`,
        type: "momentum_building",
        priority: 70,
        urgency: "low",
        ...messages,
        ctaText: "Another session",
        ctaAction: "start_focus",
        ctaParams: { reason: "momentum_building" },
        reasoning: `Momentum building: ${ctx.streakDays} day streak, session completed today`,
        visualCue: "none",
      };
    },
  },
  {
    name: "boss_active",
    priority: 65,
    condition: (ctx: RecommendationContext) => {
      if (!ctx.activeBoss) return false;
      const hp = (ctx.activeBoss.healthRemaining / ctx.activeBoss.maxHealth) * 100;
      return hp >= 30;
    },
    generate: (ctx: RecommendationContext, persona: CoachPersona) => {
      const messages = generateMessage("boss_battle", ctx, persona);
      return {
        id: `boss-active-${Date.now()}`,
        type: "boss_battle",
        priority: 65,
        urgency: "medium",
        ...messages,
        ctaText: "Battle now",
        ctaAction: "view_boss",
        reasoning: "Active boss battle available",
        visualCue: "none",
      };
    },
  },
  {
    name: "start_study_plan",
    priority: 60,
    condition: (ctx: RecommendationContext) => {
      if (!ctx.activeStudyPlan) return false;
      return ctx.activeStudyPlan.completedTasks === 0;
    },
    generate: (ctx: RecommendationContext, _persona: CoachPersona) => {
      const plan = ctx.activeStudyPlan!;
      return {
        id: `study-start-${Date.now()}`,
        type: "study_plan",
        priority: 60,
        urgency: "low",
        headline: `Start ${plan.title}`,
        subtext: `${plan.totalTasks} tasks · ready to begin`,
        coachMessage: `Ready to tackle ${plan.title}? I've broken it down into manageable pieces.`,
        ctaText: "Begin study session",
        ctaAction: "start_study",
        ctaParams: { planId: plan.generationId },
        reasoning: "New study plan ready to start",
        visualCue: "none",
      };
    },
  },
  {
    name: "comeback",
    priority: 55,
    condition: (ctx: RecommendationContext) => {
      if (ctx.streakDays !== 0) return false;
      if (ctx.totalSessions < 5) return false;
      if (ctx.daysSinceLastSession > 7) return false;
      return true;
    },
    generate: (ctx: RecommendationContext, persona: CoachPersona) => {
      const messages = generateMessage("comeback", ctx, persona);
      return {
        id: `comeback-${Date.now()}`,
        type: "comeback",
        priority: 55,
        urgency: "medium",
        ...messages,
        ctaText: "Comeback session",
        ctaAction: "start_focus",
        ctaParams: { duration: 15, reason: "comeback" },
        reasoning: "Comeback opportunity: streak broken, within window",
        visualCue: "glow",
      };
    },
  },
  {
    name: "default_focus",
    priority: 50,
    condition: () => true,
    generate: (ctx: RecommendationContext, persona: CoachPersona) => {
      const messages = generateMessage("focus_session", ctx, persona);
      return {
        id: `default-${Date.now()}`,
        type: "focus_session",
        priority: 50,
        urgency: "low",
        ...messages,
        ctaText: "Start focus session",
        ctaAction: "start_focus",
        reasoning: "Default recommendation: no higher priority conditions met",
        visualCue: "none",
      };
    },
  },
];
