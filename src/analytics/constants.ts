/**
 * Analytics Constants
 *
 * Target metrics and configuration values
 */

import { VEXTargetMetrics } from './types';

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