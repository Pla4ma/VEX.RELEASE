import type { RecommendationRule } from './home-recommendation-types';
import { getHoursUntilEndOfDay } from './home-recommendation-utils';

export const CRITICAL_RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    name: 'streak_critical',
    priority: 100,
    condition: (ctx) => {
      if (!ctx.streak || ctx.streak.currentDays === 0 || ctx.hasCompletedSessionToday) {
        return false;
      }
      const hoursLeft = getHoursUntilEndOfDay(ctx.currentTime);
      return hoursLeft <= 4 && hoursLeft > 0;
    },
    generate: (ctx) => ({
      id: `streak-critical-${Date.now()}`,
      type: 'protect_streak',
      priority: 100,
      urgency: 'critical',
      headline: `Protect your ${ctx.streak?.currentDays ?? 0}-day streak`,
      subtext: `${getHoursUntilEndOfDay(ctx.currentTime)} hours left today`,
      ctaText: 'Quick 15-min session',
      ctaAction: 'start_focus',
      ctaParams: { duration: 15, reason: 'streak_protection' },
      aiCoachMessage: `Your ${ctx.streak?.currentDays ?? 0}-day streak needs protection. One short session keeps it alive.`,
      visualCue: 'urgent',
    }),
  },
  {
    name: 'streak_at_risk',
    priority: 90,
    condition: (ctx) => {
      if (!ctx.streak || ctx.streak.currentDays === 0 || ctx.hasCompletedSessionToday) {
        return false;
      }
      const hoursLeft = getHoursUntilEndOfDay(ctx.currentTime);
      return hoursLeft <= 8 && hoursLeft > 4;
    },
    generate: (ctx) => ({
      id: `streak-risk-${Date.now()}`,
      type: 'protect_streak',
      priority: 90,
      urgency: 'high',
      headline: 'Keep your momentum going',
      subtext: `${ctx.streak?.currentDays ?? 0} days strong - do not break the chain`,
      ctaText: 'Start focus session',
      ctaAction: 'start_focus',
      ctaParams: { reason: 'streak_maintenance' },
      aiCoachMessage: `You are building something. ${ctx.streak?.currentDays ?? 0} days is commitment.`,
      visualCue: 'glow',
    }),
  },
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
    generate: () => ({
      id: `boss-opportunity-${Date.now()}`,
      type: 'boss_battle',
      priority: 85,
      urgency: 'high',
      headline: 'Boss is nearly defeated',
      subtext: 'One strong session could finish this',
      ctaText: 'Attack now',
      ctaAction: 'view_boss',
      aiCoachMessage: 'The boss is faltering. This is your moment.',
      visualCue: 'pulse',
    }),
  },
];
