/**
 * VEX Analytics Infrastructure
 *
 * Phase 6.2 - Analytics & Experimentation
 * Comprehensive analytics system tracking the 10/10 success metrics:
 * - Retention: Day 1/7/30
 * - Engagement: Sessions/week, plan completion
 * - Monetization: Premium conversion, LTV
 * - Product Quality: NPS, crash-free rate
 *
 * Dependencies:
 * - Analytics (base system)
 * - Sessions (engagement tracking)
 * - Content Study (plan completion)
 * - Monetization (conversion tracking)
 * - Streaks (survival rate)
 */

import { eventBus } from '../events';

// ============================================================================
// Success Metrics (10/10 Definition)
// ============================================================================

export interface MetricWithTarget {
  current: number;
  target: number;
  trend: 'up' | 'down' | 'flat';
}

export interface VEXSuccessMetrics {
  // User Engagement
  day1Retention: MetricWithTarget;
  day7Retention: MetricWithTarget;
  day30Retention: MetricWithTarget;
  sessionsPerWeek: MetricWithTarget;
  studyPlanCompletionRate: MetricWithTarget;

  // Product Quality
  appStoreRating: MetricWithTarget;
  supportTicketsPerWeek: MetricWithTarget;
  crashFreeRate: MetricWithTarget;

  // Monetization
  premiumConversionRate: MetricWithTarget;
  ltv: MetricWithTarget;
  paywallConversionRate: MetricWithTarget;

  // User Sentiment
  npsScore: MetricWithTarget;
  clarityScore: MetricWithTarget; // "I know exactly what to do"
  helpfulnessScore: MetricWithTarget; // "Helps me study better"
  returnIntentScore: MetricWithTarget; // "Want to come back tomorrow"
}

type TargetOnlyMetric = { target: number };

export type VEXTargetMetrics = {
  [K in keyof VEXSuccessMetrics]: TargetOnlyMetric;
};

// Target metrics from the 10/10 plan
export const TARGET_METRICS: VEXTargetMetrics = {
  day1Retention: { target: 0.8 }, // 80% (from 60%)
  day7Retention: { target: 0.45 }, // 45% (from 25%)
  day30Retention: { target: 0.25 }, // 25% (from 10%)
  sessionsPerWeek: { target: 6 }, // 6 sessions (from 3)
  studyPlanCompletionRate: { target: 0.7 }, // 70% (from 30%)
  appStoreRating: { target: 4.8 }, // 4.8 stars (from 4.2)
  supportTicketsPerWeek: { target: 10 }, // 10 tickets (from 50)
  crashFreeRate: { target: 0.999 }, // 99.9% (from 98%)
  premiumConversionRate: { target: 0.08 }, // 8% (from 2%)
  ltv: { target: 45 }, // $45 (from $12)
  paywallConversionRate: { target: 0.15 }, // 15% (from 5%)
  npsScore: { target: 50 }, // 50 (from 20)
  clarityScore: { target: 0.9 }, // 90% (from 40%)
  helpfulnessScore: { target: 0.85 }, // 85% (from 50%)
  returnIntentScore: { target: 0.8 }, // 80% (from 45%)
};

// ============================================================================
// Retention Tracking
// ============================================================================

export interface RetentionCohort {
  cohortDate: string; // YYYY-MM-DD
  cohortSize: number;
  day1: number;
  day7: number;
  day30: number;
  day90?: number;
}

const retentionCohorts = new Map<string, RetentionCohort>();

/**
 * Track user retention
 */
export function trackRetentionEvent(
  userId: string,
  event: 'first_open' | 'session' | 'return'
): void {
  const today = new Date().toISOString().split('T')[0];
  const userFirstOpen = getUserFirstOpen(userId);

  if (event === 'first_open') {
    // New cohort
    const cohort = retentionCohorts.get(today) || {
      cohortDate: today,
      cohortSize: 0,
      day1: 0,
      day7: 0,
      day30: 0,
    };
    cohort.cohortSize++;
    retentionCohorts.set(today, cohort);
    storeUserFirstOpen(userId, today);
    return;
  }

  if (!userFirstOpen) {return;}

  // Calculate days since first open
  const daysSince = daysBetween(userFirstOpen, today);
  const cohort = retentionCohorts.get(userFirstOpen);
  if (!cohort) {return;}

  // Update retention for appropriate day
  if (daysSince === 1) {cohort.day1++;}
  if (daysSince === 7) {cohort.day7++;}
  if (daysSince === 30) {cohort.day30++;}
}

function getUserFirstOpen(userId: string): string | null {
  // Would integrate with persistent storage
  return null;
}

function storeUserFirstOpen(userId: string, date: string): void {
  // Would integrate with persistent storage
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate current retention rates
 */
export function calculateRetentionRates(): {
  day1: number;
  day7: number;
  day30: number;
} {
  const cohorts = Array.from(retentionCohorts.values());
  if (cohorts.length === 0) {return { day1: 0, day7: 0, day30: 0 };}

  // Use cohorts old enough to have day30 data
  const matureCohorts = cohorts.filter((c) => {
    const cohortDate = new Date(c.cohortDate);
    const daysSince = (Date.now() - cohortDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  });

  if (matureCohorts.length === 0) {return { day1: 0, day7: 0, day30: 0 };}

  const totalSize = matureCohorts.reduce((sum, c) => sum + c.cohortSize, 0);
  if (totalSize === 0) {return { day1: 0, day7: 0, day30: 0 };}

  return {
    day1: matureCohorts.reduce((sum, c) => sum + c.day1, 0) / totalSize,
    day7: matureCohorts.reduce((sum, c) => sum + c.day7, 0) / totalSize,
    day30: matureCohorts.reduce((sum, c) => sum + c.day30, 0) / totalSize,
  };
}

// ============================================================================
// Engagement Tracking
// ============================================================================

export interface EngagementMetrics {
  userId: string;
  sessionsLast7Days: number;
  sessionsLast30Days: number;
  totalFocusMinutes: number;
  avgSessionDuration: number;
  studyPlansCompleted: number;
  studyPlansStarted: number;
  bossBattlesCompleted: number;
  streakDays: number;
  weeklyActive: boolean;
  powerUser: boolean; // 5+ sessions/week
}

const engagementData = new Map<string, EngagementMetrics>();

/**
 * Record engagement event
 */
export function recordEngagementEvent(
  userId: string,
  event: {
    type: 'session_complete' | 'plan_start' | 'plan_complete' | 'boss_defeat' | 'streak_milestone';
    value?: number;
  }
): void {
  let metrics = engagementData.get(userId);
  if (!metrics) {
    metrics = {
      userId,
      sessionsLast7Days: 0,
      sessionsLast30Days: 0,
      totalFocusMinutes: 0,
      avgSessionDuration: 0,
      studyPlansCompleted: 0,
      studyPlansStarted: 0,
      bossBattlesCompleted: 0,
      streakDays: 0,
      weeklyActive: false,
      powerUser: false,
    };
  }

  switch (event.type) {
    case 'session_complete':
      metrics.sessionsLast7Days++;
      metrics.sessionsLast30Days++;
      if (event.value) {
        metrics.totalFocusMinutes += event.value;
        metrics.avgSessionDuration =
          metrics.totalFocusMinutes / metrics.sessionsLast30Days;
      }
      break;
    case 'plan_start':
      metrics.studyPlansStarted++;
      break;
    case 'plan_complete':
      metrics.studyPlansCompleted++;
      break;
    case 'boss_defeat':
      metrics.bossBattlesCompleted++;
      break;
    case 'streak_milestone':
      if (event.value) {metrics.streakDays = event.value;}
      break;
  }

  // Recalculate segments
  metrics.weeklyActive = metrics.sessionsLast7Days > 0;
  metrics.powerUser = metrics.sessionsLast7Days >= 5;

  engagementData.set(userId, metrics);

  eventBus.publish('analytics:engagement', {
    userId,
    event: event.type,
    metrics,
  });
}

/**
 * Get average sessions per week
 */
export function getAverageSessionsPerWeek(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {return 0;}
  return users.reduce((sum, u) => sum + u.sessionsLast7Days, 0) / users.length;
}

/**
 * Get study plan completion rate
 */
export function getStudyPlanCompletionRate(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {return 0;}

  const totalStarted = users.reduce((sum, u) => sum + u.studyPlansStarted, 0);
  const totalCompleted = users.reduce((sum, u) => sum + u.studyPlansCompleted, 0);

  if (totalStarted === 0) {return 0;}
  return totalCompleted / totalStarted;
}

// ============================================================================
// Monetization Tracking
// ============================================================================

export interface MonetizationMetrics {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  trialUsers: number;
  conversionRate: number;
  trialConversionRate: number;
  averageLTV: number;
  totalRevenue: number;
  arpu: number; // Average revenue per user
  mrr: number; // Monthly recurring revenue
}

let monetizationMetrics: MonetizationMetrics = {
  totalUsers: 0,
  freeUsers: 0,
  premiumUsers: 0,
  trialUsers: 0,
  conversionRate: 0,
  trialConversionRate: 0,
  averageLTV: 0,
  totalRevenue: 0,
  arpu: 0,
  mrr: 0,
};

/**
 * Track monetization event
 */
export function trackMonetizationEvent(
  event: {
    type: 'subscription_start' | 'trial_start' | 'trial_convert' | 'cancellation' | 'renewal';
    userId: string;
    value?: number;
    tier?: 'FREE' | 'PREMIUM';
  }
): void {
  switch (event.type) {
    case 'trial_start':
      monetizationMetrics.trialUsers++;
      break;
    case 'trial_convert':
      monetizationMetrics.trialUsers--;
      monetizationMetrics.premiumUsers++;
      monetizationMetrics.freeUsers--;
      break;
    case 'subscription_start':
      monetizationMetrics.premiumUsers++;
      if (event.value) {
        monetizationMetrics.totalRevenue += event.value;
        monetizationMetrics.mrr += event.value / 12; // Assume annual
      }
      break;
    case 'cancellation':
      monetizationMetrics.premiumUsers--;
      monetizationMetrics.freeUsers++;
      if (event.value) {
        monetizationMetrics.mrr -= event.value / 12;
      }
      break;
  }

  // Recalculate rates
  monetizationMetrics.totalUsers =
    monetizationMetrics.freeUsers + monetizationMetrics.premiumUsers;
  monetizationMetrics.conversionRate =
    monetizationMetrics.totalUsers > 0
      ? monetizationMetrics.premiumUsers / monetizationMetrics.totalUsers
      : 0;
  monetizationMetrics.trialConversionRate =
    monetizationMetrics.trialUsers > 0
      ? monetizationMetrics.premiumUsers /
        (monetizationMetrics.premiumUsers + monetizationMetrics.trialUsers)
      : 0;
  monetizationMetrics.arpu =
    monetizationMetrics.totalUsers > 0
      ? monetizationMetrics.totalRevenue / monetizationMetrics.totalUsers
      : 0;

  eventBus.publish('analytics:monetization', {
    event: event.type,
    userId: event.userId,
    metrics: { ...monetizationMetrics },
  });
}

/**
 * Get monetization metrics
 */
export function getMonetizationMetrics(): MonetizationMetrics {
  return { ...monetizationMetrics };
}

// ============================================================================
// Paywall Conversion Tracking
// ============================================================================

export interface PaywallAnalytics {
  totalShows: number;
  totalDismisses: number;
  totalConversions: number;
  conversionRate: number;
  byContext: Record<string, { shows: number; conversions: number; rate: number }>;
}

const paywallAnalytics: PaywallAnalytics = {
  totalShows: 0,
  totalDismisses: 0,
  totalConversions: 0,
  conversionRate: 0,
  byContext: {},
};

/**
 * Track paywall event
 */
export function trackPaywallEvent(
  event: 'show' | 'dismiss' | 'convert',
  context: string
): void {
  if (!paywallAnalytics.byContext[context]) {
    paywallAnalytics.byContext[context] = { shows: 0, conversions: 0, rate: 0 };
  }

  switch (event) {
    case 'show':
      paywallAnalytics.totalShows++;
      paywallAnalytics.byContext[context].shows++;
      break;
    case 'dismiss':
      paywallAnalytics.totalDismisses++;
      break;
    case 'convert':
      paywallAnalytics.totalConversions++;
      paywallAnalytics.byContext[context].conversions++;
      break;
  }

  // Recalculate rates
  paywallAnalytics.conversionRate =
    paywallAnalytics.totalShows > 0
      ? paywallAnalytics.totalConversions / paywallAnalytics.totalShows
      : 0;

  for (const ctx of Object.keys(paywallAnalytics.byContext)) {
    const data = paywallAnalytics.byContext[ctx];
    data.rate = data.shows > 0 ? data.conversions / data.shows : 0;
  }
}

/**
 * Get paywall analytics
 */
export function getPaywallAnalytics(): PaywallAnalytics {
  return { ...paywallAnalytics };
}

/**
 * Get best converting paywall context
 */
export function getBestPaywallContext(): string | null {
  let bestContext: string | null = null;
  let bestRate = 0;

  for (const [context, data] of Object.entries(paywallAnalytics.byContext)) {
    if (data.rate > bestRate && data.shows > 10) {
      bestRate = data.rate;
      bestContext = context;
    }
  }

  return bestContext;
}

// ============================================================================
// Streak Survival Tracking
// ============================================================================

export interface StreakSurvivalMetrics {
  totalStreaksStarted: number;
  streaksBroken: number;
  streaksProtected: number;
  survivalRate: number;
  avgStreakLength: number;
  insuranceUsageRate: number;
}

let streakMetrics: StreakSurvivalMetrics = {
  totalStreaksStarted: 0,
  streaksBroken: 0,
  streaksProtected: 0,
  survivalRate: 0,
  avgStreakLength: 0,
  insuranceUsageRate: 0,
};

/**
 * Track streak event
 */
export function trackStreakEvent(
  event: 'start' | 'break' | 'protect' | 'milestone',
  data?: { length?: number; insuranceUsed?: boolean }
): void {
  switch (event) {
    case 'start':
      streakMetrics.totalStreaksStarted++;
      break;
    case 'break':
      streakMetrics.streaksBroken++;
      break;
    case 'protect':
      streakMetrics.streaksProtected++;
      break;
    case 'milestone':
      if (data?.length) {
        // Update average
        const totalLength =
          streakMetrics.avgStreakLength * (streakMetrics.totalStreaksStarted - 1) + data.length;
        streakMetrics.avgStreakLength = totalLength / streakMetrics.totalStreaksStarted;
      }
      break;
  }

  // Recalculate rates
  const completedStreaks = streakMetrics.streaksBroken + streakMetrics.streaksProtected;
  streakMetrics.survivalRate =
    completedStreaks > 0 ? streakMetrics.streaksProtected / completedStreaks : 1;
  streakMetrics.insuranceUsageRate =
    streakMetrics.streaksProtected > 0
      ? streakMetrics.streaksProtected / (streakMetrics.streaksProtected + streakMetrics.streaksBroken)
      : 0;
}

/**
 * Get streak survival metrics
 */
export function getStreakSurvivalMetrics(): StreakSurvivalMetrics {
  return { ...streakMetrics };
}

// ============================================================================
// Dashboard Report
// ============================================================================

export interface VEXDashboard {
  generatedAt: number;
  successMetrics: VEXSuccessMetrics;
  retention: ReturnType<typeof calculateRetentionRates>;
  engagement: {
    avgSessionsPerWeek: number;
    studyPlanCompletionRate: number;
    powerUserPercentage: number;
  };
  monetization: MonetizationMetrics;
  paywall: PaywallAnalytics;
  streaks: StreakSurvivalMetrics;
  trends: {
    dayOverDay: Record<string, number>;
    weekOverWeek: Record<string, number>;
  };
}

/**
 * Generate comprehensive dashboard report
 */
export function generateDashboardReport(): VEXDashboard {
  const retention = calculateRetentionRates();
  const engagement = {
    avgSessionsPerWeek: getAverageSessionsPerWeek(),
    studyPlanCompletionRate: getStudyPlanCompletionRate(),
    powerUserPercentage: calculatePowerUserPercentage(),
  };

  // Build success metrics with current values
  const successMetrics: VEXSuccessMetrics = {
    day1Retention: {
      current: retention.day1,
      target: TARGET_METRICS.day1Retention.target,
      trend: 'flat',
    },
    day7Retention: {
      current: retention.day7,
      target: TARGET_METRICS.day7Retention.target,
      trend: 'flat',
    },
    day30Retention: {
      current: retention.day30,
      target: TARGET_METRICS.day30Retention.target,
      trend: 'flat',
    },
    sessionsPerWeek: {
      current: engagement.avgSessionsPerWeek,
      target: TARGET_METRICS.sessionsPerWeek.target,
      trend: 'flat',
    },
    studyPlanCompletionRate: {
      current: engagement.studyPlanCompletionRate,
      target: TARGET_METRICS.studyPlanCompletionRate.target,
      trend: 'flat',
    },
    appStoreRating: { current: 0, target: TARGET_METRICS.appStoreRating.target, trend: 'flat' },
    supportTicketsPerWeek: {
      current: 0,
      target: TARGET_METRICS.supportTicketsPerWeek.target,
      trend: 'flat',
    },
    crashFreeRate: { current: 0.98, target: TARGET_METRICS.crashFreeRate.target, trend: 'flat' },
    premiumConversionRate: {
      current: monetizationMetrics.conversionRate,
      target: TARGET_METRICS.premiumConversionRate.target,
      trend: 'flat',
    },
    ltv: { current: monetizationMetrics.averageLTV, target: TARGET_METRICS.ltv.target, trend: 'flat' },
    paywallConversionRate: {
      current: paywallAnalytics.conversionRate,
      target: TARGET_METRICS.paywallConversionRate.target,
      trend: 'flat',
    },
    npsScore: { current: 0, target: TARGET_METRICS.npsScore.target, trend: 'flat' },
    clarityScore: { current: 0, target: TARGET_METRICS.clarityScore.target, trend: 'flat' },
    helpfulnessScore: { current: 0, target: TARGET_METRICS.helpfulnessScore.target, trend: 'flat' },
    returnIntentScore: {
      current: 0,
      target: TARGET_METRICS.returnIntentScore.target,
      trend: 'flat',
    },
  };

  return {
    generatedAt: Date.now(),
    successMetrics,
    retention,
    engagement,
    monetization: getMonetizationMetrics(),
    paywall: getPaywallAnalytics(),
    streaks: getStreakSurvivalMetrics(),
    trends: {
      dayOverDay: {},
      weekOverWeek: {},
    },
  };
}

function calculatePowerUserPercentage(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {return 0;}
  const powerUsers = users.filter((u) => u.powerUser).length;
  return powerUsers / users.length;
}

// ============================================================================
// Exports (types already exported above)
// ============================================================================
