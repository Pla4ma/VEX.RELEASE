/**
 * Analytics Dashboard
 *
 * Comprehensive dashboard reporting and metrics aggregation
 */

import { VEXDashboard, VEXSuccessMetrics } from './types';
import { TARGET_METRICS } from './constants';
import { calculateRetentionRates } from './retention';
import { getAverageSessionsPerWeek, getStudyPlanCompletionRate, getAllEngagementMetrics } from './engagement';
import { getMonetizationMetrics } from './monetization';
import { getPaywallAnalytics } from './paywall';
import { getStreakSurvivalMetrics } from './streak';

/**
 * Generate comprehensive dashboard report
 */
export function generateDashboardReport(): VEXDashboard {
  const retention = calculateRetentionRates();
  const engagement = {
    averageSessionsPerWeek: getAverageSessionsPerWeek(),
    averageCompletionRate: getStudyPlanCompletionRate(),
    averageSessionDuration: calculateAverageSessionDuration(),
  };

  // Build success metrics with current values
  const successMetrics: VEXSuccessMetrics = {
    day1Retention: {
      current: retention.day1,
      target: TARGET_METRICS.day1Retention.target,
      trend: "flat",
    },
    day7Retention: {
      current: retention.day7,
      target: TARGET_METRICS.day7Retention.target,
      trend: "flat",
    },
    day30Retention: {
      current: retention.day30,
      target: TARGET_METRICS.day30Retention.target,
      trend: "flat",
    },
    sessionsPerWeek: {
      current: engagement.averageSessionsPerWeek,
      target: TARGET_METRICS.sessionsPerWeek.target,
      trend: "flat",
    },
    studyPlanCompletionRate: {
      current: engagement.averageCompletionRate,
      target: TARGET_METRICS.studyPlanCompletionRate.target,
      trend: "flat",
    },
    appStoreRating: { current: 0, target: TARGET_METRICS.appStoreRating.target, trend: "flat" },
    supportTicketsPerWeek: {
      current: 0,
      target: TARGET_METRICS.supportTicketsPerWeek.target,
      trend: "flat",
    },
    crashFreeRate: { current: 0.98, target: TARGET_METRICS.crashFreeRate.target, trend: "flat" },
    premiumConversionRate: {
      current: getMonetizationMetrics().conversionRate,
      target: TARGET_METRICS.premiumConversionRate.target,
      trend: "flat",
    },
    ltv: { current: getMonetizationMetrics().averageLTV, target: TARGET_METRICS.ltv.target, trend: "flat" },
    paywallConversionRate: {
      current: getPaywallAnalytics().conversionRate,
      target: TARGET_METRICS.paywallConversionRate.target,
      trend: "flat",
    },
    npsScore: { current: 0, target: TARGET_METRICS.npsScore.target, trend: "flat" },
    clarityScore: { current: 0, target: TARGET_METRICS.clarityScore.target, trend: "flat" },
    helpfulnessScore: { current: 0, target: TARGET_METRICS.helpfulnessScore.target, trend: "flat" },
    returnIntentScore: {
      current: 0,
      target: TARGET_METRICS.returnIntentScore.target,
      trend: "flat",
    },
  };

  return {
    timestamp: new Date().toISOString(),
    metrics: successMetrics,
    retention,
    engagement,
    monetization: getMonetizationMetrics(),
    trends: {
      weeklyGrowth: 0,
      monthlyGrowth: 0,
    },
  };
}

/**
 * Calculate average session duration across all users
 */
function calculateAverageSessionDuration(): number {
  const allMetrics = getAllEngagementMetrics();
  if (allMetrics.length === 0) {
    return 0;
  }
  
  const totalDuration = allMetrics.reduce((sum, metrics) => sum + metrics.avgSessionDuration, 0);
  return totalDuration / allMetrics.length;
}

/**
 * Get metrics summary for quick overview
 */
export function getMetricsSummary(): {
  retentionScore: number;
  engagementScore: number;
  monetizationScore: number;
  overallScore: number;
} {
  const dashboard = generateDashboardReport();
  
  const retentionScore = calculateScore(dashboard.metrics.day1Retention.current, dashboard.metrics.day1Retention.target);
  const engagementScore = calculateScore(dashboard.metrics.sessionsPerWeek.current, dashboard.metrics.sessionsPerWeek.target);
  const monetizationScore = calculateScore(dashboard.metrics.premiumConversionRate.current, dashboard.metrics.premiumConversionRate.target);
  
  const overallScore = (retentionScore + engagementScore + monetizationScore) / 3;
  
  return {
    retentionScore,
    engagementScore,
    monetizationScore,
    overallScore,
  };
}

/**
 * Calculate score as percentage of target
 */
function calculateScore(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, (current / target) * 100);
}