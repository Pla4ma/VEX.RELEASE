import type { RecommendationContext, CoachPersona } from "./CoachRecommendationService-types";

export function generateProtectStreakMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const hoursLeft = ctx.hoursUntilStreakBreak ?? 0;
  switch (persona.id) {
    case "mentor":
      return {
        headline: `Protect your ${ctx.streakDays}-day streak`,
        subtext: `${hoursLeft} hours remaining — your consistency matters`,
        coachMessage: `Your streak represents ${ctx.streakDays} days of commitment. One brief session preserves your momentum.`,
      };
    case "trainer":
      return {
        headline: "SAVE YOUR STREAK",
        subtext: `${hoursLeft} hours left. Move.`,
        coachMessage: `Discipline equals freedom. 15 minutes keeps ${ctx.streakDays} days alive.`,
      };
    case "peer":
      return {
        headline: `Your ${ctx.streakDays}-day streak needs you!`,
        subtext: `${hoursLeft} hours left — we've got this together`,
        coachMessage: `Hey, that ${ctx.streakDays}-day streak is worth protecting! One quick session keeps it going.`,
      };
    case "professor":
      return {
        headline: "Streak Preservation Required",
        subtext: `${hoursLeft} hours remain to maintain ${ctx.streakDays} consecutive days`,
        coachMessage: "Consistency in practice yields compound results. A brief session maintains your established pattern.",
      };
  }
}

export function generateStudyBehindMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const plan = ctx.activeStudyPlan!;
  switch (persona.id) {
    case "mentor":
      return {
        headline: `Catch up on ${plan.title}`,
        subtext: `${ctx.studyPlanDaysBehind} days behind — let's get back on track`,
        coachMessage: "Falling behind happens. What matters is how you respond. One session today closes the gap.",
      };
    case "trainer":
      return {
        headline: "GET BACK ON TRACK",
        subtext: `${ctx.studyPlanDaysBehind} days behind schedule`,
        coachMessage: "No excuses. You committed to this plan. One focused session starts the recovery.",
      };
    case "peer":
      return {
        headline: `${plan.title} is waiting`,
        subtext: `${ctx.studyPlanDaysBehind} days behind — but we can fix that!`,
        coachMessage: `Life happens! ${ctx.studyPlanDaysBehind} days behind isn't the end. One session and you're moving forward again.`,
      };
    case "professor":
      return {
        headline: "Study Plan Recovery Required",
        subtext: `${ctx.studyPlanDaysBehind} days behind optimal schedule`,
        coachMessage: "Academic progress requires consistent engagement. A single session today restores forward momentum.",
      };
  }
}

export function generateBossOpportunityMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const boss = ctx.activeBoss!;
  const hp = Math.round((boss.healthRemaining / boss.maxHealth) * 100);
  switch (persona.id) {
    case "mentor":
      return { headline: `${boss.name} is nearly defeated`, subtext: `${hp}% health — one strong session finishes this`, coachMessage: `The boss falters at ${hp}%. This is your moment to strike with focus.` };
    case "trainer":
      return { headline: "FINISH THE BOSS", subtext: `${hp}% health remaining. END IT.`, coachMessage: "Boss is bleeding. One focused session = victory. ATTACK." };
    case "peer":
      return { headline: "Boss is almost down!", subtext: `${hp}% health left — this is YOUR moment`, coachMessage: `OMG the boss is at ${hp}%! One epic session and BOOM — victory! Let's do this!` };
    case "professor":
      return { headline: "Boss Vulnerable to Defeat", subtext: `${hp}% health remaining — optimal engagement window`, coachMessage: `The adversary demonstrates ${hp}% vitality. A concentrated session achieves conclusive results.` };
  }
}

export function generateMomentumBuildingMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  switch (persona.id) {
    case "mentor":
      return { headline: `${ctx.streakDays} days strong`, subtext: "Your streak is building momentum", coachMessage: `Momentum compounds. Day ${ctx.streakDays} proves you're becoming someone who follows through.` };
    case "trainer":
      return { headline: "MOMENTUM BUILDING", subtext: `${ctx.streakDays} days — don't break the chain`, coachMessage: `You're in the zone. ${ctx.streakDays} days shows discipline. Keep the pressure on.` };
    case "peer":
      return { headline: `🔥 ${ctx.streakDays} days!`, subtext: "You're on fire — keep it going!", coachMessage: `${ctx.streakDays} days is AMAZING! You're building serious momentum now!` };
    case "professor":
      return { headline: `${ctx.streakDays} Consecutive Days`, subtext: "Positive momentum trajectory established", coachMessage: `Sustained engagement over ${ctx.streakDays} days indicates successful habit formation.` };
  }
}
