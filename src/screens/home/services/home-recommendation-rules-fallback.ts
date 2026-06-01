import type { RecommendationRule } from './home-recommendation-types';
import { getDaysSince } from './home-recommendation-utils';

export const FALLBACK_RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    name: 'start_first_streak',
    priority: 60,
    condition: (ctx) =>
      ctx.totalSessions <= 3 && (!ctx.streak || ctx.streak.currentDays === 0),
    generate: () => ({
      id: `start-streak-${Date.now()}`,
      type: 'start_streak',
      priority: 60,
      urgency: 'low',
      headline: 'Start your streak',
      subtext: 'One session today begins your journey',
      ctaText: 'Begin focus session',
      ctaAction: 'start_focus',
      ctaParams: { duration: 25, reason: 'first_streak' },
      aiCoachMessage:
        'Every master was once a beginner. Your streak starts with one session.',
      visualCue: 'none',
    }),
  },
  {
    name: 'comeback',
    priority: 55,
    condition: (ctx) => {
      if (
        !ctx.streak ||
        ctx.streak.currentDays !== 0 ||
        ctx.totalSessions < 5
      ) {
        return false;
      }
      return ctx.lastSessionTimestamp
        ? getDaysSince(ctx.lastSessionTimestamp) < 7
        : false;
    },
    generate: () => ({
      id: `comeback-${Date.now()}`,
      type: 'comeback',
      priority: 55,
      urgency: 'medium',
      headline: 'Ready to restart?',
      subtext: 'Your progress is still here - one session begins again',
      ctaText: 'Comeback session',
      ctaAction: 'start_focus',
      ctaParams: { duration: 15, reason: 'comeback' },
      aiCoachMessage: 'Streaks break. What matters is showing up again. Ready?',
      visualCue: 'glow',
    }),
  },
  {
    name: 'default_focus',
    priority: 50,
    condition: () => true,
    generate: (ctx) => ({
      id: `default-${Date.now()}`,
      type: 'focus_session',
      priority: 50,
      urgency: 'low',
      headline: 'Time to focus',
      subtext: 'What will you accomplish today?',
      ctaText: 'Start focus session',
      ctaAction: 'start_focus',
      aiCoachMessage:
        ctx.totalSessions > 10
          ? "You're becoming someone who follows through. Let's continue."
          : 'Focus is a skill. Every session makes you stronger.',
      visualCue: 'none',
    }),
  },
];
