import type { RecommendationContext, CoachPersona } from './CoachRecommendationService-types';

export function generateComebackMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  switch (persona.id) {
    case 'mentor':
      return {
        headline: 'Ready to restart?',
        subtext: 'Your progress is still here — one session begins again',
        coachMessage: 'Streaks break. What matters is returning. Your next session starts a new chapter.',
      };
    case 'trainer':
      return {
        headline: 'GET BACK IN THE GAME',
        subtext: 'Your progress waits. Move forward.',
        coachMessage: "The break is over. Time to rebuild. One session proves you're still in this.",
      };
    case 'peer':
      return {
        headline: "Let's get back to it!",
        subtext: "Your progress is still here — one session and you're back",
        coachMessage: "Hey, breaks happen! One session and you're right back in the game. Ready?",
      };
    case 'professor':
      return {
        headline: 'Resume Your Practice',
        subtext: 'Prior progress remains accessible',
        coachMessage: 'Interruptions are inherent to learning. A single session re-establishes continuity.',
      };
  }
}

export function generateStudyPlanCompleteMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const plan = ctx.activeStudyPlan!;
  switch (persona.id) {
    case 'mentor':
      return {
        headline: `${plan.title} complete!`,
        subtext: 'You finished your study plan — celebrate this milestone',
        coachMessage: `Completion of ${plan.title} represents meaningful progress. Acknowledge your dedication.`,
      };
    case 'trainer':
      return {
        headline: 'MISSION ACCOMPLISHED',
        subtext: `${plan.title} — CRUSHED.`,
        coachMessage: `You finished ${plan.title}. That's what commitment looks like.`,
      };
    case 'peer':
      return {
        headline: 'You did it',
        subtext: `${plan.title} is complete — you're amazing!`,
        coachMessage: `You finished ${plan.title}. That's outstanding progress.`,
      };
    case 'professor':
      return {
        headline: 'Study Plan Completed',
        subtext: `${plan.title} — all objectives achieved`,
        coachMessage: `Successful completion of ${plan.title} demonstrates disciplined academic engagement.`,
      };
  }
}

export function generateFocusSessionMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  switch (persona.id) {
    case 'mentor':
      return {
        headline: 'Time to focus',
        subtext: 'What will you accomplish today?',
        coachMessage: ctx.totalSessions > 10
          ? "You're becoming someone who follows through. Let's continue."
          : 'Focus is a skill. Every session makes you stronger.',
      };
    case 'trainer':
      return { headline: 'FOCUS SESSION', subtext: 'Time to work.', coachMessage: 'Results come from showing up. Start the session.' };
    case 'peer':
      return { headline: "Let's get focused!", subtext: 'What are we tackling today?', coachMessage: 'Ready to crush it? One session at a time! 💪' };
    case 'professor':
      return { headline: 'Focus Session Recommended', subtext: 'Engage in structured concentration practice', coachMessage: 'Consistent focus sessions yield compound cognitive benefits. Begin when ready.' };
  }
}

export function generateStudyPlanMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const plan = ctx.activeStudyPlan!;
  const remaining = (plan.totalTasks ?? 0) - (plan.completedTasks ?? 0);
  switch (persona.id) {
    case 'mentor':
      return { headline: `Continue ${plan.title}`, subtext: `${remaining} tasks remaining — steady progress`, coachMessage: `You're making real progress on ${plan.title}. ${remaining} more tasks and you're done.` };
    case 'trainer':
      return { headline: `STUDY: ${plan.title}`, subtext: `${remaining} tasks left. Execute.`, coachMessage: `${remaining} tasks stand between you and completion. Get to work.` };
    case 'peer':
      return { headline: `Back to ${plan.title}!`, subtext: `${remaining} tasks left — almost there!`, coachMessage: `${plan.title} is calling! Just ${remaining} tasks to go — you've got this! 🎯` };
    case 'professor':
      return { headline: `Resume: ${plan.title}`, subtext: `${remaining} objectives remain for completion`, coachMessage: `${plan.title} requires ${remaining} additional task completions. Maintain academic momentum.` };
  }
}

export function generateBossBattleMessage(
  ctx: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const boss = ctx.activeBoss!;
  const hp = Math.round((boss.healthRemaining / boss.maxHealth) * 100);
  switch (persona.id) {
    case 'mentor':
      return { headline: `${boss.name} awaits`, subtext: `${hp}% health — focus to deal damage`, coachMessage: `The boss stands at ${hp}%. Every focused minute chips away at it.` };
    case 'trainer':
      return { headline: 'BOSS ACTIVE', subtext: `${hp}% health remaining.`, coachMessage: 'Boss is waiting. Focus = damage. Attack.' };
    case 'peer':
      return {         headline: 'Boss time', subtext: `${hp}% health to chip away`, coachMessage: `That boss is at ${hp}%! Let's take it down together!` };
    case 'professor':
      return { headline: 'Boss Encounter Active', subtext: `${hp}% adversary vitality remains`, coachMessage: `Sustained focus reduces opponent vitality. Current level: ${hp}%.` };
  }
}
