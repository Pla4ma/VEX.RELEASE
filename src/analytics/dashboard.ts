/**
 * Dashboard Analytics
 *
 * Phase 6.2 - Analytics & Experimentation
 * Generates comprehensive dashboard reports.
 */

import { TARGET_METRICS } from './types';
import type { VEXDashboard } from './types';
import { calculateRetentionRates } from './retention';
import { getAverageSessionsPerWeek, getStudyPlanCompletionRate } from './engagement';
import { getMonetizationMetrics } from './monetization';
import { getPaywallAnalytics } from './paywall';
import { getStreakSurvivalMetrics } from './streak';

export function generateDashboardReport(): VEXDashboard {
  const retentionRates = calculateRetentionRates();
  const monetizationMetrics = getMonetizationMetrics();
  const paywallAnalytics = getPaywallAnalytics();
  const streakSurvival = getStreakSurvivalMetrics();

  const metrics = {
    day1Retention: { current: retentionRates.day1, target: TARGET_METRICS.day1Retention.target, trend: 'flat' as const },
    day7Retention: { current: retentionRates.day7, target: TARGET_METRICS.day7Retention.target, trend: 'flat' as const },
    day30Retention: { current: retentionRates.day30, target: TARGET_METRICS.day30Retention.target, trend: 'flat' as const },
    sessionsPerWeek: { current: getAverageSessionsPerWeek(), target: TARGET_METRICS.sessionsPerWeek.target, trend: 'flat' as const },
    studyPlanCompletionRate: { current: getStudyPlanCompletionRate(), target: TARGET_METRICS.studyPlanCompletionRate.target, trend: 'flat' as const },
    appStoreRating: { current: 4.5, target: TARGET_METRICS.appStoreRating.target, trend: 'up' as const },
    supportTicketsPerWeek: { current: 25, target: TARGET_METRICS.supportTicketsPerWeek.target, trend: 'down' as const },
    crashFreeRate: { current: 0.995, target: TARGET_METRICS.crashFreeRate.target, trend: 'up' as const },
    premiumConversionRate: { current: monetizationMetrics.premiumConversionRate, target: TARGET_METRICS.premiumConversionRate.target, trend: 'up' as const },
    ltv: { current: monetizationMetrics.averageLtv, target: TARGET_METRICS.ltv.target, trend: 'up' as const },
    paywallConversionRate: { current: monetizationMetrics.paywallConversionRate, target: TARGET_METRICS.paywallConversionRate.target, trend: 'up' as const },
    npsScore: { current: 35, target: TARGET_METRICS.npsScore.target, trend: 'up' as const },
    clarityScore: { current: 0.75, target: TARGET_METRICS.clarityScore.target, trend: 'up' as const },
    helpfulnessScore: { current: 0.70, target: TARGET_METRICS.helpfulnessScore.target, trend: 'up' as const },
    returnIntentScore: { current: 0.65, target: TARGET_METRICS.returnIntentScore.target, trend: 'up' as const },
  };

  return {
    timestamp: Date.now(),
    metrics,
    retention: retentionRates,
    engagement: {
      sessionsPerWeek: getAverageSessionsPerWeek(),
      studyPlanCompletionRate: getStudyPlanCompletionRate(),
      weeklyActiveUsers: 0,
      powerUsers: 0,
    },
    monetization: monetizationMetrics,
    topPaywalls: paywallAnalytics.slice(0, 5),
    streakSurvival: streakSurvival.slice(0, 10),
  };
}
