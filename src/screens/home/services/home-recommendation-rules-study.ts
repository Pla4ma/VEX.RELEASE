import type { RecommendationRule } from "./home-recommendation-types";

export const STUDY_RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    name: "continue_study_plan",
    priority: 80,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {
        return false;
      }
      const progress =
        ctx.activeStudyPlan.completedTasks / ctx.activeStudyPlan.totalTasks;
      return progress < 1 && progress > 0;
    },
    generate: (ctx) => {
      const plan = ctx.activeStudyPlan;
      const remaining = plan ? plan.totalTasks - plan.completedTasks : 0;
      return {
        id: `study-continue-${Date.now()}`,
        type: "study_plan",
        priority: 80,
        urgency: "medium",
        headline: `Continue ${plan?.title ?? "your plan"}`,
        subtext: `${remaining} tasks remaining - ${plan?.completedTasks ?? 0} of ${plan?.totalTasks ?? 0} done`,
        ctaText: "Resume studying",
        ctaAction: "start_study",
        ctaParams: { planId: plan?.generationId },
        aiCoachMessage: `You are making real progress on ${plan?.title ?? "your plan"}.`,
        visualCue: "none",
      };
    },
  },
  {
    name: "start_study_plan",
    priority: 75,
    condition: (ctx) => ctx.activeStudyPlan?.completedTasks === 0,
    generate: (ctx) => ({
      id: `study-start-${Date.now()}`,
      type: "study_plan",
      priority: 75,
      urgency: "medium",
      headline: `Start ${ctx.activeStudyPlan?.title ?? "your plan"}`,
      subtext: `${ctx.activeStudyPlan?.totalTasks ?? 0} tasks - ${ctx.activeStudyPlan?.remainingMinutes ?? 0} min estimated`,
      ctaText: "Begin study session",
      ctaAction: "start_study",
      ctaParams: { planId: ctx.activeStudyPlan?.generationId },
      aiCoachMessage: `Ready to tackle ${ctx.activeStudyPlan?.title ?? "your plan"}?`,
      visualCue: "none",
    }),
  },
  {
    name: "streak_building",
    priority: 70,
    condition: (ctx) =>
      Boolean(
        ctx.streak &&
        ctx.streak.currentDays >= 2 &&
        ctx.hasCompletedSessionToday,
      ),
    generate: (ctx) => ({
      id: `streak-building-${Date.now()}`,
      type: "focus_session",
      priority: 70,
      urgency: "low",
      headline: `${ctx.streak?.currentDays ?? 0} days strong`,
      subtext: "Your streak is safe - want to build more momentum?",
      ctaText: "Another session",
      ctaAction: "start_focus",
      ctaParams: { reason: "momentum_building" },
      aiCoachMessage:
        "Great work protecting your streak. Another session would be bonus progress.",
      visualCue: "none",
    }),
  },
  {
    name: "boss_active",
    priority: 65,
    condition: (ctx) => {
      if (!ctx.activeBoss) {
        return false;
      }
      return (
        (ctx.activeBoss.healthRemaining / ctx.activeBoss.maxHealth) * 100 >= 30
      );
    },
    generate: (ctx) => {
      const boss = ctx.activeBoss;
      const healthPercent = boss
        ? Math.round((boss.healthRemaining / boss.maxHealth) * 100)
        : 0;
      return {
        id: `boss-active-${Date.now()}`,
        type: "boss_battle",
        priority: 65,
        urgency: "medium",
        headline: "Boss awaits",
        subtext: `${healthPercent}% health remaining - focus to deal damage`,
        ctaText: "Battle now",
        ctaAction: "view_boss",
        aiCoachMessage:
          "The boss is still standing. Every focused minute chips away at it.",
        visualCue: "none",
      };
    },
  },
];
