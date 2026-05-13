/**
 * Coach Recommendation Service
 *
 * Phase 2.1 - Coach as Recommendation Engine
 * Transforms coach from reactive interventions to proactive recommendations
 * that power the Home screen decision engine.
 *
 * Analyzes: time of day, streak status, study plan progress,
 *           boss status, user history
 * Outputs:  One primary recommendation with clear CTA
 */

import type { BehaviorProfile } from '../types';
import { createDebugger } from '@/utils/debug';

type ActiveStudyPlan = {
  id?: string;
  title: string;
  progress?: number;
  nextSession?: string | null;
  totalTasks?: number;
  completedTasks?: number;
  contentId?: string;
  generationId?: string;
};

const debug = createDebugger('coach:recommendation');

// ============================================================================
// Types
// ============================================================================

interface RecommendationRule {
  name: string;
  priority: number;
  condition: (ctx: RecommendationContext) => boolean;
  generate: (ctx: RecommendationContext, persona: CoachPersona) => CoachRecommendation;
}

// ============================================================================
// New Persona Types (Phase 2.2)
// ============================================================================
const COACH_PERSONAS: Record<CoachPersonaId, CoachPersona> = {
  mentor: {
    id: 'mentor',
    name: 'The Mentor',
    voiceTone: 'WISE',
    vocabularyTraits: ['warm', 'strategic', 'encouraging', 'measured'],
    sentenceStructure: 'MEASURED',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
  trainer: {
    id: 'trainer',
    name: 'The Trainer',
    voiceTone: 'STERN',
    vocabularyTraits: ['direct', 'challenging', 'results-focused', 'action-oriented'],
    sentenceStructure: 'SHORT_DIRECT',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
  peer: {
    id: 'peer',
    name: 'The Peer',
    voiceTone: 'PLAYFUL',
    vocabularyTraits: ['casual', 'relatable', 'slang', 'we-re-in-this-together'],
    sentenceStructure: 'CONVERSATIONAL',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
  professor: {
    id: 'professor',
    name: 'The Professor',
    voiceTone: 'WISE',
    vocabularyTraits: ['academic', 'methodical', 'knowledge-focused', 'precise'],
    sentenceStructure: 'MEASURED',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
};

// ============================================================================
// Message Generators (Persona-Specific)
// ============================================================================

function generateMessage(type: CoachRecommendationType, context: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  const generators: Record<CoachRecommendationType, (ctx: RecommendationContext, p: CoachPersona) => { headline: string; subtext: string; coachMessage: string }> = {
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

function generateProtectStreakMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  const hoursLeft = ctx.hoursUntilStreakBreak ?? 0;

  switch (persona.id) {
    case 'mentor':
      return {
        headline: `Protect your ${ctx.streakDays}-day streak`,
        subtext: `${hoursLeft} hours remaining — your consistency matters`,
        coachMessage: `Your streak represents ${ctx.streakDays} days of commitment. One brief session preserves your momentum.`,
      };
    case 'trainer':
      return {
        headline: 'SAVE YOUR STREAK',
        subtext: `${hoursLeft} hours left. Move.`,
        coachMessage: `Discipline equals freedom. 15 minutes keeps ${ctx.streakDays} days alive.`,
      };
    case 'peer':
      return {
        headline: `Your ${ctx.streakDays}-day streak needs you!`,
        subtext: `${hoursLeft} hours left — we've got this together`,
        coachMessage: `Hey, that ${ctx.streakDays}-day streak is worth protecting! One quick session keeps it going.`,
      };
    case 'professor':
      return {
        headline: 'Streak Preservation Required',
        subtext: `${hoursLeft} hours remain to maintain ${ctx.streakDays} consecutive days`,
        coachMessage: 'Consistency in practice yields compound results. A brief session maintains your established pattern.',
      };
  }
}

function generateStudyBehindMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  const daysBehind = ctx.studyPlanDaysBehind;
  const plan = ctx.activeStudyPlan!;

  switch (persona.id) {
    case 'mentor':
      return {
        headline: `Catch up on ${plan.title}`,
        subtext: `${daysBehind} days behind — let's get back on track`,
        coachMessage: 'Falling behind happens. What matters is how you respond. One session today closes the gap.',
      };
    case 'trainer':
      return {
        headline: 'GET BACK ON TRACK',
        subtext: `${daysBehind} days behind schedule`,
        coachMessage: 'No excuses. You committed to this plan. One focused session starts the recovery.',
      };
    case 'peer':
      return {
        headline: `${plan.title} is waiting`,
        subtext: `${daysBehind} days behind — but we can fix that!`,
        coachMessage: `Life happens! ${daysBehind} days behind isn't the end. One session and you're moving forward again.`,
      };
    case 'professor':
      return {
        headline: 'Study Plan Recovery Required',
        subtext: `${daysBehind} days behind optimal schedule`,
        coachMessage: 'Academic progress requires consistent engagement. A single session today restores forward momentum.',
      };
  }
}

function generateBossOpportunityMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  const boss = ctx.activeBoss!;
  const healthPercent = Math.round((boss.healthRemaining / boss.maxHealth) * 100);

  switch (persona.id) {
    case 'mentor':
      return {
        headline: `${boss.name} is nearly defeated`,
        subtext: `${healthPercent}% health — one strong session finishes this`,
        coachMessage: `The boss falters at ${healthPercent}%. This is your moment to strike with focus.`,
      };
    case 'trainer':
      return {
        headline: 'FINISH THE BOSS',
        subtext: `${healthPercent}% health remaining. END IT.`,
        coachMessage: 'Boss is bleeding. One focused session = victory. ATTACK.',
      };
    case 'peer':
      return {
        headline: 'Boss is almost down!',
        subtext: `${healthPercent}% health left — this is YOUR moment`,
        coachMessage: `OMG the boss is at ${healthPercent}%! One epic session and BOOM — victory! Let's do this!`,
      };
    case 'professor':
      return {
        headline: 'Boss Vulnerable to Defeat',
        subtext: `${healthPercent}% health remaining — optimal engagement window`,
        coachMessage: `The adversary demonstrates ${healthPercent}% vitality. A concentrated session achieves conclusive results.`,
      };
  }
}

function generateMomentumBuildingMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  switch (persona.id) {
    case 'mentor':
      return {
        headline: `${ctx.streakDays} days strong`,
        subtext: 'Your streak is building momentum',
        coachMessage: `Momentum compounds. Day ${ctx.streakDays} proves you're becoming someone who follows through.`,
      };
    case 'trainer':
      return {
        headline: 'MOMENTUM BUILDING',
        subtext: `${ctx.streakDays} days — don't break the chain`,
        coachMessage: `You're in the zone. ${ctx.streakDays} days shows discipline. Keep the pressure on.`,
      };
    case 'peer':
      return {
        headline: `🔥 ${ctx.streakDays} days!`,
        subtext: "You're on fire — keep it going!",
        coachMessage: `${ctx.streakDays} days is AMAZING! You're building serious momentum now!`,
      };
    case 'professor':
      return {
        headline: `${ctx.streakDays} Consecutive Days`,
        subtext: 'Positive momentum trajectory established',
        coachMessage: `Sustained engagement over ${ctx.streakDays} days indicates successful habit formation.`,
      };
  }
}

function generateComebackMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
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

function generateStudyPlanCompleteMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
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
        headline: 'You did it! 🎉',
        subtext: `${plan.title} is complete — you're amazing!`,
        coachMessage: `OMG you finished ${plan.title}! That's HUGE! Time to celebrate! 🎊`,
      };
    case 'professor':
      return {
        headline: 'Study Plan Completed',
        subtext: `${plan.title} — all objectives achieved`,
        coachMessage: `Successful completion of ${plan.title} demonstrates disciplined academic engagement.`,
      };
  }
}

function generateFocusSessionMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  switch (persona.id) {
    case 'mentor':
      return {
        headline: 'Time to focus',
        subtext: 'What will you accomplish today?',
        coachMessage: ctx.totalSessions > 10 ? "You're becoming someone who follows through. Let's continue." : 'Focus is a skill. Every session makes you stronger.',
      };
    case 'trainer':
      return {
        headline: 'FOCUS SESSION',
        subtext: 'Time to work.',
        coachMessage: 'Results come from showing up. Start the session.',
      };
    case 'peer':
      return {
        headline: "Let's get focused!",
        subtext: 'What are we tackling today?',
        coachMessage: 'Ready to crush it? One session at a time! 💪',
      };
    case 'professor':
      return {
        headline: 'Focus Session Recommended',
        subtext: 'Engage in structured concentration practice',
        coachMessage: 'Consistent focus sessions yield compound cognitive benefits. Begin when ready.',
      };
  }
}

function generateStudyPlanMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  const plan = ctx.activeStudyPlan!;
  const remaining = (plan.totalTasks ?? 0) - (plan.completedTasks ?? 0);

  switch (persona.id) {
    case 'mentor':
      return {
        headline: `Continue ${plan.title}`,
        subtext: `${remaining} tasks remaining — steady progress`,
        coachMessage: `You're making real progress on ${plan.title}. ${remaining} more tasks and you're done.`,
      };
    case 'trainer':
      return {
        headline: `STUDY: ${plan.title}`,
        subtext: `${remaining} tasks left. Execute.`,
        coachMessage: `${remaining} tasks stand between you and completion. Get to work.`,
      };
    case 'peer':
      return {
        headline: `Back to ${plan.title}!`,
        subtext: `${remaining} tasks left — almost there!`,
        coachMessage: `${plan.title} is calling! Just ${remaining} tasks to go — you've got this! 🎯`,
      };
    case 'professor':
      return {
        headline: `Resume: ${plan.title}`,
        subtext: `${remaining} objectives remain for completion`,
        coachMessage: `${plan.title} requires ${remaining} additional task completions. Maintain academic momentum.`,
      };
  }
}

function generateBossBattleMessage(ctx: RecommendationContext, persona: CoachPersona): { headline: string; subtext: string; coachMessage: string } {
  const boss = ctx.activeBoss!;
  const healthPercent = Math.round((boss.healthRemaining / boss.maxHealth) * 100);

  switch (persona.id) {
    case 'mentor':
      return {
        headline: `${boss.name} awaits`,
        subtext: `${healthPercent}% health — focus to deal damage`,
        coachMessage: `The boss stands at ${healthPercent}%. Every focused minute chips away at it.`,
      };
    case 'trainer':
      return {
        headline: 'BOSS ACTIVE',
        subtext: `${healthPercent}% health remaining.`,
        coachMessage: 'Boss is waiting. Focus = damage. Attack.',
      };
    case 'peer':
      return {
        headline: 'Boss time! 👊',
        subtext: `${healthPercent}% health to chip away`,
        coachMessage: `That boss is at ${healthPercent}%! Let's take it down together!`,
      };
    case 'professor':
      return {
        headline: 'Boss Encounter Active',
        subtext: `${healthPercent}% adversary vitality remains`,
        coachMessage: `Sustained focus reduces opponent vitality. Current level: ${healthPercent}%.`,
      };
  }
}

// ============================================================================
// Recommendation Rules
// ============================================================================

const RECOMMENDATION_RULES: RecommendationRule[] = [
  // CRITICAL: Streak about to break (< 4 hours left)
  {
    name: 'streak_critical',
    priority: 100,
    condition: (ctx) => {
      if (ctx.streakDays === 0) {
        return false;
      }
      if (ctx.hasCompletedSessionToday) {
        return false;
      }
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

  // HIGH: Study plan behind schedule
  {
    name: 'study_behind',
    priority: 90,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {
        return false;
      }
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

  // HIGH: Boss opportunity (health < 30%)
  {
    name: 'boss_opportunity',
    priority: 85,
    condition: (ctx) => {
      if (!ctx.activeBoss) {
        return false;
      }
      const healthPercent = (ctx.activeBoss.healthRemaining / ctx.activeBoss.maxHealth) * 100;
      return healthPercent < 30 && healthPercent > 0;
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

  // MEDIUM: Study plan just completed
  {
    name: 'study_plan_complete',
    priority: 80,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {
        return false;
      }
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

  // MEDIUM: Active study plan in progress
  {
    name: 'continue_study_plan',
    priority: 75,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {
        return false;
      }
      const progress = ctx.studyPlanProgress;
      return progress < 1 && progress > 0;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('study_plan', ctx, persona);
      const plan = ctx.activeStudyPlan!;
      return {
        id: `study-continue-${Date.now()}`,
        type: 'study_plan',
        priority: 75,
        urgency: 'medium',
        ...messages,
        ctaText: 'Resume studying',
        ctaAction: 'start_study',
        ctaParams: { planId: plan.generationId },
        reasoning: `Continue study plan: ${Math.round(ctx.studyPlanProgress * 100)}% complete`,
        visualCue: 'none',
      };
    },
  },

  // MEDIUM: Momentum building (2+ day streak, already did session today)
  {
    name: 'momentum_building',
    priority: 70,
    condition: (ctx) => {
      if (ctx.streakDays < 2) {
        return false;
      }
      if (!ctx.hasCompletedSessionToday) {
        return false;
      }
      return true;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('momentum_building', ctx, persona);
      return {
        id: `momentum-${Date.now()}`,
        type: 'momentum_building',
        priority: 70,
        urgency: 'low',
        ...messages,
        ctaText: 'Another session',
        ctaAction: 'start_focus',
        ctaParams: { reason: 'momentum_building' },
        reasoning: `Momentum building: ${ctx.streakDays} day streak, session completed today`,
        visualCue: 'none',
      };
    },
  },

  // MEDIUM: Boss battle available (boss active, health good)
  {
    name: 'boss_active',
    priority: 65,
    condition: (ctx) => {
      if (!ctx.activeBoss) {
        return false;
      }
      const healthPercent = (ctx.activeBoss.healthRemaining / ctx.activeBoss.maxHealth) * 100;
      return healthPercent >= 30;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('boss_battle', ctx, persona);
      return {
        id: `boss-active-${Date.now()}`,
        type: 'boss_battle',
        priority: 65,
        urgency: 'medium',
        ...messages,
        ctaText: 'Battle now',
        ctaAction: 'view_boss',
        reasoning: 'Active boss battle available',
        visualCue: 'none',
      };
    },
  },

  // LOW: New study plan available (hasn't started)
  {
    name: 'start_study_plan',
    priority: 60,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {
        return false;
      }
      return ctx.activeStudyPlan.completedTasks === 0;
    },
    generate: (ctx, _persona) => {
      const plan = ctx.activeStudyPlan!;
      return {
        id: `study-start-${Date.now()}`,
        type: 'study_plan',
        priority: 60,
        urgency: 'low',
        headline: `Start ${plan.title}`,
        subtext: `${plan.totalTasks} tasks · ready to begin`,
        coachMessage: `Ready to tackle ${plan.title}? I've broken it down into manageable pieces.`,
        ctaText: 'Begin study session',
        ctaAction: 'start_study',
        ctaParams: { planId: plan.generationId },
        reasoning: 'New study plan ready to start',
        visualCue: 'none',
      };
    },
  },

  // LOW: Comeback opportunity (streak broken recently)
  {
    name: 'comeback',
    priority: 55,
    condition: (ctx) => {
      if (ctx.streakDays !== 0) {
        return false;
      }
      if (ctx.totalSessions < 5) {
        return false;
      } // Not a comeback if new user
      if (ctx.daysSinceLastSession > 7) {
        return false;
      } // Too late for comeback
      return true;
    },
    generate: (ctx, persona) => {
      const messages = generateMessage('comeback', ctx, persona);
      return {
        id: `comeback-${Date.now()}`,
        type: 'comeback',
        priority: 55,
        urgency: 'medium',
        ...messages,
        ctaText: 'Comeback session',
        ctaAction: 'start_focus',
        ctaParams: { duration: 15, reason: 'comeback' },
        reasoning: 'Comeback opportunity: streak broken, within window',
        visualCue: 'glow',
      };
    },
  },

  // DEFAULT: Generic focus session
  {
    name: 'default_focus',
    priority: 50,
    condition: () => true,
    generate: (ctx, persona) => {
      const messages = generateMessage('focus_session', ctx, persona);
      return {
        id: `default-${Date.now()}`,
        type: 'focus_session',
        priority: 50,
        urgency: 'low',
        ...messages,
        ctaText: 'Start focus session',
        ctaAction: 'start_focus',
        reasoning: 'Default recommendation: no higher priority conditions met',
        visualCue: 'none',
      };
    },
  },
];

// ============================================================================
// Main Service
// ============================================================================
// ============================================================================
// Factory Functions
// ============================================================================
// ============================================================================
// Integration with HomeRecommendationEngine
// ============================================================================
// ============================================================================
// Exports
// ============================================================================

export { COACH_PERSONAS };
export * from "./CoachRecommendationService.types";
export * from "./CoachRecommendationService.types";
export * from "./CoachRecommendationService.part1";
