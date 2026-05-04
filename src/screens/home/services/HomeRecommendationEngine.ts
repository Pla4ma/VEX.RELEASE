/**
 * HomeRecommendationEngine
 *
 * Analyzes user state and produces clear, actionable recommendations
 * for the Home screen. Answers: "What should I work on right now?"
 *
 * @phase 1 - Foundation
 */

import { debug } from '../../../utils/debug';
import type { ActiveStudyPlan } from '../../../features/content-study/hooks/helpers';

export type RecommendationType =
  | 'focus_session'
  | 'study_plan'
  | 'comeback'
  | 'protect_streak'
  | 'boss_battle'
  | 'start_streak';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HomeRecommendation {
  id: string;
  type: RecommendationType;
  priority: number; // 1-100, higher = more important
  urgency: UrgencyLevel;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaAction: 'start_focus' | 'start_study' | 'view_boss' | 'view_streak';
  ctaParams?: Record<string, unknown>;
  aiCoachMessage?: string;
  visualCue?: 'none' | 'pulse' | 'glow' | 'urgent';
  expiresAt?: number; // timestamp when this recommendation expires
}

// Use actual hook return types (simplified from full schema types)
type HookStreakSummary = NonNullable<ReturnType<typeof useStreakSummary>['data']>;
type HookProgressionSummary = NonNullable<ReturnType<typeof useProgressionSummary>['data']>;
type HookBossEncounter = NonNullable<ReturnType<typeof useActiveBoss>['data']>;

interface RecommendationContext {
  userId: string;
  currentTime: Date;
  streak: HookStreakSummary | null;
  progression: HookProgressionSummary | null;
  activeStudyPlan: ActiveStudyPlan | null;
  activeBoss: HookBossEncounter | null;
  hasCompletedSessionToday: boolean;
  lastSessionTimestamp?: number;
  totalSessions: number;
  currentLevel: number;
}

interface RecommendationRule {
  name: string;
  priority: number;
  condition: (ctx: RecommendationContext) => boolean;
  generate: (ctx: RecommendationContext) => HomeRecommendation;
}

// ============================================================================
// RECOMMENDATION RULES (in priority order)
// ============================================================================

const RECOMMENDATION_RULES: RecommendationRule[] = [
  // CRITICAL: Streak about to break (< 4 hours left)
  {
    name: 'streak_critical',
    priority: 100,
    condition: (ctx) => {
      if (!ctx.streak || ctx.streak.currentDays === 0) {return false;}
      if (ctx.hasCompletedSessionToday) {return false;}
      const hoursLeft = getHoursUntilEndOfDay(ctx.currentTime);
      return hoursLeft <= 4 && hoursLeft > 0;
    },
    generate: (ctx) => ({
      id: `streak-critical-${Date.now()}`,
      type: 'protect_streak',
      priority: 100,
      urgency: 'critical',
      headline: `Protect your ${ctx.streak!.currentDays}-day streak`,
      subtext: `${getHoursUntilEndOfDay(ctx.currentTime)} hours left today`,
      ctaText: 'Quick 15-min session',
      ctaAction: 'start_focus',
      ctaParams: { duration: 15, reason: 'streak_protection' },
      aiCoachMessage: `Your ${ctx.streak!.currentDays}-day streak needs protection. One short session keeps it alive.`,
      visualCue: 'urgent',
    }),
  },

  // HIGH: Streak at risk (< 8 hours left, no session yet)
  {
    name: 'streak_at_risk',
    priority: 90,
    condition: (ctx) => {
      if (!ctx.streak || ctx.streak.currentDays === 0) {return false;}
      if (ctx.hasCompletedSessionToday) {return false;}
      const hoursLeft = getHoursUntilEndOfDay(ctx.currentTime);
      return hoursLeft <= 8 && hoursLeft > 4;
    },
    generate: (ctx) => ({
      id: `streak-risk-${Date.now()}`,
      type: 'protect_streak',
      priority: 90,
      urgency: 'high',
      headline: 'Keep your momentum going',
      subtext: `${ctx.streak!.currentDays} days strong — don't break the chain`,
      ctaText: 'Start focus session',
      ctaAction: 'start_focus',
      ctaParams: { reason: 'streak_maintenance' },
      aiCoachMessage: `You're building something. ${ctx.streak!.currentDays} days isn't luck — it's commitment.`,
      visualCue: 'glow',
    }),
  },

  // HIGH: Boss battle opportunity (boss active, health < 30%)
  {
    name: 'boss_opportunity',
    priority: 85,
    condition: (ctx) => {
      if (!ctx.activeBoss) {return false;}
      const healthPercent = (ctx.activeBoss.healthRemaining / ctx.activeBoss.maxHealth) * 100;
      return healthPercent < 30 && healthPercent > 0;
    },
    generate: (ctx) => ({
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

  // MEDIUM: Active study plan in progress
  {
    name: 'continue_study_plan',
    priority: 80,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {return false;}
      const progress = ctx.activeStudyPlan.completedTasks / ctx.activeStudyPlan.totalTasks;
      return progress < 1 && progress > 0; // Started but not complete
    },
    generate: (ctx) => {
      const plan = ctx.activeStudyPlan!;
      const remaining = plan.totalTasks - plan.completedTasks;
      return {
        id: `study-continue-${Date.now()}`,
        type: 'study_plan',
        priority: 80,
        urgency: 'medium',
        headline: `Continue ${plan.title}`,
        subtext: `${remaining} tasks remaining · ${plan.completedTasks} of ${plan.totalTasks} done`,
        ctaText: 'Resume studying',
        ctaAction: 'start_study',
        ctaParams: { planId: plan.generationId },
        aiCoachMessage: `You're making real progress on ${plan.title}. ${remaining} more tasks and you're done.`,
        visualCue: 'none',
      };
    },
  },

  // MEDIUM: New study plan available (hasn't started)
  {
    name: 'start_study_plan',
    priority: 75,
    condition: (ctx) => {
      if (!ctx.activeStudyPlan) {return false;}
      return ctx.activeStudyPlan.completedTasks === 0;
    },
    generate: (ctx) => ({
      id: `study-start-${Date.now()}`,
      type: 'study_plan',
      priority: 75,
      urgency: 'medium',
      headline: `Start ${ctx.activeStudyPlan!.title}`,
      subtext: `${ctx.activeStudyPlan!.totalTasks} tasks · ${ctx.activeStudyPlan!.remainingMinutes} min estimated`,
      ctaText: 'Begin study session',
      ctaAction: 'start_study',
      ctaParams: { planId: ctx.activeStudyPlan!.generationId },
      aiCoachMessage: `Ready to tackle ${ctx.activeStudyPlan!.title}? I've broken it down into manageable pieces.`,
      visualCue: 'none',
    }),
  },

  // MEDIUM: Streak building (2+ days, already did session today)
  {
    name: 'streak_building',
    priority: 70,
    condition: (ctx) => {
      if (!ctx.streak || ctx.streak.currentDays < 2) {return false;}
      if (!ctx.hasCompletedSessionToday) {return false;}
      return true;
    },
    generate: (ctx) => ({
      id: `streak-building-${Date.now()}`,
      type: 'focus_session',
      priority: 70,
      urgency: 'low',
      headline: `${ctx.streak!.currentDays} days strong`,
      subtext: 'Your streak is safe — want to build more momentum?',
      ctaText: 'Another session',
      ctaAction: 'start_focus',
      ctaParams: { reason: 'momentum_building' },
      aiCoachMessage: 'Great work protecting your streak. Another session would be bonus progress.',
      visualCue: 'none',
    }),
  },

  // MEDIUM: Boss battle available (boss active, health good)
  {
    name: 'boss_active',
    priority: 65,
    condition: (ctx) => {
      if (!ctx.activeBoss) {return false;}
      const healthPercent = (ctx.activeBoss.healthRemaining / ctx.activeBoss.maxHealth) * 100;
      return healthPercent >= 30;
    },
    generate: (ctx) => {
      const healthPercent = Math.round((ctx.activeBoss!.healthRemaining / ctx.activeBoss!.maxHealth) * 100);
      return {
        id: `boss-active-${Date.now()}`,
        type: 'boss_battle',
        priority: 65,
        urgency: 'medium',
        headline: 'Boss awaits',
        subtext: `${healthPercent}% health remaining — focus to deal damage`,
        ctaText: 'Battle now',
        ctaAction: 'view_boss',
        aiCoachMessage: 'The boss is still standing. Every focused minute chips away at it.',
        visualCue: 'none',
      };
    },
  },

  // LOW: New user, build first streak
  {
    name: 'start_first_streak',
    priority: 60,
    condition: (ctx) => {
      if (ctx.totalSessions > 3) {return false;}
      if (ctx.streak && ctx.streak.currentDays > 0) {return false;}
      return true;
    },
    generate: (ctx) => ({
      id: `start-streak-${Date.now()}`,
      type: 'start_streak',
      priority: 60,
      urgency: 'low',
      headline: 'Start your streak',
      subtext: 'One session today begins your journey',
      ctaText: 'Begin focus session',
      ctaAction: 'start_focus',
      ctaParams: { duration: 25, reason: 'first_streak' },
      aiCoachMessage: 'Every master was once a beginner. Your streak starts with one session.',
      visualCue: 'none',
    }),
  },

  // LOW: Comeback opportunity (streak broken recently)
  {
    name: 'comeback',
    priority: 55,
    condition: (ctx) => {
      if (!ctx.streak || ctx.streak.currentDays !== 0) {return false;}
      if (ctx.totalSessions < 5) {return false;} // Not a comeback if new user
      if (!ctx.lastSessionTimestamp) {return false;}
      const daysSinceLastSession = (Date.now() - ctx.lastSessionTimestamp) / (1000 * 60 * 60 * 24);
      return daysSinceLastSession < 7; // Within comeback window
    },
    generate: (ctx) => ({
      id: `comeback-${Date.now()}`,
      type: 'comeback',
      priority: 55,
      urgency: 'medium',
      headline: 'Ready to restart?',
      subtext: 'Your progress is still here — one session begins again',
      ctaText: 'Comeback session',
      ctaAction: 'start_focus',
      ctaParams: { duration: 15, reason: 'comeback' },
      aiCoachMessage: 'Streaks break. What matters is showing up again. Ready?',
      visualCue: 'glow',
    }),
  },

  // DEFAULT: Generic focus session
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
      aiCoachMessage: ctx.totalSessions > 10
        ? 'You\'re becoming someone who follows through. Let\'s continue.'
        : 'Focus is a skill. Every session makes you stronger.',
      visualCue: 'none',
    }),
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getHoursUntilEndOfDay(date: Date): number {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return Math.max(0, (endOfDay.getTime() - date.getTime()) / (1000 * 60 * 60));
}

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class HomeRecommendationEngine {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  /**
   * Generate the best recommendation for current user state
   */
  getRecommendation(): HomeRecommendation {
    const startTime = performance.now();

    // Find first matching rule (rules are in priority order)
    for (const rule of RECOMMENDATION_RULES) {
      try {
        if (rule.condition(this.context)) {
          const recommendation = rule.generate(this.context);
          debug.info(`[HomeRecommendationEngine] Selected: ${rule.name}`, {
            priority: recommendation.priority,
            type: recommendation.type,
            urgency: recommendation.urgency,
            duration: Math.round(performance.now() - startTime),
          });
          return recommendation;
        }
      } catch (error) {
        debug.error(`[HomeRecommendationEngine] Rule ${rule.name} failed`, error as Error);
      }
    }

    // Fallback to default
    const defaultRule = RECOMMENDATION_RULES[RECOMMENDATION_RULES.length - 1];
    return defaultRule.generate(this.context);
  }

  /**
   * Get all applicable recommendations (for debugging/analytics)
   */
  getAllApplicable(): HomeRecommendation[] {
    return RECOMMENDATION_RULES
      .filter(rule => rule.condition(this.context))
      .map(rule => rule.generate(this.context));
  }

  /**
   * Check if recommendation should refresh
   */
  shouldRefresh(lastRefreshTime: number, currentRec: HomeRecommendation): boolean {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const timeSinceRefresh = Date.now() - lastRefreshTime;

    // Refresh if: 5+ minutes passed, or recommendation expired
    if (timeSinceRefresh > FIVE_MINUTES) {return true;}
    if (currentRec.expiresAt && Date.now() > currentRec.expiresAt) {return true;}

    return false;
  }
}

// ============================================================================
// HOOK
// ============================================================================

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { useActiveStudyPlan } from '../../../features/content-study/hooks/useActiveStudyPlan';
import { useStreakSummary } from '../../../features/streaks/hooks';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { useActiveBoss } from '../../../features/boss/hooks';
import { useSessionStats } from '../../../session/hooks/useSession';
import { useAuthStore } from '../../../store';

export function useHomeRecommendation(): {
  recommendation: HomeRecommendation | null;
  isLoading: boolean;
  refresh: () => void;
} {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const { data: activeStudyPlan, isLoading: studyLoading } = useActiveStudyPlan();
  const { data: streak, isLoading: streakLoading } = useStreakSummary(userId);
  const { data: progression, isLoading: progLoading } = useProgressionSummary(userId);
  const { data: activeBoss, isLoading: bossLoading } = useActiveBoss(userId);
  const { stats, isLoading: statsLoading } = useSessionStats(userId);

  const [recommendation, setRecommendation] = useState<HomeRecommendation | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const lastRecRef = useRef<HomeRecommendation | null>(null);

  const generateRecommendation = useCallback(() => {
    if (!userId) {return;}

    const context: RecommendationContext = {
      userId,
      currentTime: new Date(),
      streak: streak ?? null,
      progression: progression ?? null,
      activeStudyPlan: activeStudyPlan ?? null,
      activeBoss: activeBoss ?? null,
      hasCompletedSessionToday: stats?.completedSessions ? stats.completedSessions > 0 : false,
      lastSessionTimestamp: undefined,
      totalSessions: stats?.totalSessions ?? 0,
      currentLevel: progression?.level ?? 1,
    };

    const engine = new HomeRecommendationEngine(context);

    // Check if we should refresh
    if (lastRecRef.current && !engine.shouldRefresh(lastRefreshRef.current, lastRecRef.current)) {
      return;
    }

    const newRec = engine.getRecommendation();
    lastRecRef.current = newRec;
    lastRefreshRef.current = Date.now();
    setRecommendation(newRec);
  }, [userId, activeStudyPlan, streak, progression, activeBoss, stats]);

  // Generate on mount and when dependencies change
  useEffect(() => {
    generateRecommendation();
  }, [generateRecommendation]);

  const refresh = useCallback(() => {
    lastRefreshRef.current = 0;
    generateRecommendation();
  }, [generateRecommendation]);

  const isLoading = studyLoading || streakLoading || progLoading || bossLoading || statsLoading;

  return { recommendation, isLoading, refresh };
}
