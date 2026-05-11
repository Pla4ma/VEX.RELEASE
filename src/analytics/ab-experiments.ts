/**
 * Predefined Experiments
 *
 * Phase 6.2 - Analytics & Experimentation
 * Pre-configured experiments from the Phase 6 plan.
 */

import type { Experiment } from './ab-types';

type ExperimentWithoutIdAndDate = Omit<Experiment, 'id' | 'startDate'>;

export const PREDEFINED_EXPERIMENTS: ExperimentWithoutIdAndDate[] = [
  {
    name: 'Home Recommendation Algorithm',
    description: 'Test different recommendation ranking algorithms',
    type: 'HOME_RECOMMENDATION',
    status: 'DRAFT',
    controlVariant: {
      id: 'control',
      name: 'Current Algorithm',
      description: 'Existing rule-based recommendations',
      config: { algorithm: 'rule_based', diversityWeight: 0.3 },
    },
    treatmentVariants: [
      { id: 'ml_ranked', name: 'ML Ranked', description: 'ML-based ranking with engagement prediction', config: { algorithm: 'ml_ranked', diversityWeight: 0.5 } },
      { id: 'popularity_boost', name: 'Popularity Boost', description: 'Boost recently popular items', config: { algorithm: 'popularity_boost', diversityWeight: 0.2 } },
    ],
    trafficAllocation: { control: 50, ml_ranked: 25, popularity_boost: 25 },
    targeting: { userSegments: ['active'], premiumStatus: 'both' },
    primaryMetric: 'home_recommendation_click_rate',
    secondaryMetrics: ['session_start_rate', 'study_plan_start_rate'],
    minSampleSize: 1000,
    minDurationDays: 14,
  },
  {
    name: 'Paywall Timing Optimization',
    description: 'Test when to show paywall for best conversion',
    type: 'PAYWALL_TIMING',
    status: 'DRAFT',
    controlVariant: {
      id: 'control',
      name: 'Current Timing',
      description: 'Show paywall on 2nd study plan attempt',
      config: { trigger: 'second_plan_attempt', delay: 0 },
    },
    treatmentVariants: [
      { id: 'earlier', name: 'Earlier Paywall', description: 'Show after first session completion', config: { trigger: 'first_session_complete', delay: 0 } },
      { id: 'delayed', name: 'Delayed Paywall', description: 'Show on 3rd study plan attempt', config: { trigger: 'third_plan_attempt', delay: 0 } },
    ],
    trafficAllocation: { control: 34, earlier: 33, delayed: 33 },
    targeting: { userSegments: ['new'], premiumStatus: 'free', maxSessions: 10 },
    primaryMetric: 'paywall_conversion_rate',
    secondaryMetrics: ['d1_retention', 'session_completion_rate'],
    minSampleSize: 500,
    minDurationDays: 7,
  },
  {
    name: 'Paywall Copy Variants',
    description: 'Test different paywall messaging',
    type: 'PAYWALL_COPY',
    status: 'DRAFT',
    controlVariant: {
      id: 'control',
      name: 'Value First',
      description: 'Lead with value proposition',
      config: { headline: 'Study 3x Faster', subtext: 'Premium users complete 78% more plans' },
    },
    treatmentVariants: [
      { id: 'social_proof', name: 'Social Proof', description: 'Emphasize community and popularity', config: { headline: 'Join 10,000+ Focus Masters', subtext: 'The choice of serious students' } },
      { id: 'fomo', name: 'FOMO', description: 'Emphasize missing out', config: { headline: 'Do not Miss Your Streak', subtext: 'Premium includes streak insurance' } },
    ],
    trafficAllocation: { control: 34, social_proof: 33, fomo: 33 },
    targeting: { premiumStatus: 'free' },
    primaryMetric: 'paywall_conversion_rate',
    secondaryMetrics: ['paywall_dismiss_rate', 'trial_start_rate'],
    minSampleSize: 1000,
    minDurationDays: 14,
  },
  {
    name: 'Default Session Duration',
    description: 'Test optimal default session length',
    type: 'SESSION_DURATION',
    status: 'DRAFT',
    controlVariant: {
      id: 'control',
      name: '15 Minutes',
      description: 'Current default',
      config: { defaultDuration: 15, options: [15, 25, 45, 60] },
    },
    treatmentVariants: [
      { id: 'short', name: '10 Minutes', description: 'Shorter initial commitment', config: { defaultDuration: 10, options: [10, 15, 25, 45] } },
      { id: 'long', name: '25 Minutes', description: 'Pomodoro-style default', config: { defaultDuration: 25, options: [15, 25, 45, 60] } },
    ],
    trafficAllocation: { control: 34, short: 33, long: 33 },
    targeting: { userSegments: ['new'], premiumStatus: 'both' },
    primaryMetric: 'session_completion_rate',
    secondaryMetrics: ['session_count_week1', 'd7_retention'],
    minSampleSize: 500,
    minDurationDays: 14,
  },
  {
    name: 'Coach Intervention Frequency',
    description: 'Test how often coach should intervene',
    type: 'COACH_FREQUENCY',
    status: 'DRAFT',
    controlVariant: {
      id: 'control',
      name: 'Current Frequency',
      description: 'Show when relevant',
      config: { maxInterventionsPerDay: 3, cooldownHours: 4 },
    },
    treatmentVariants: [
      { id: 'more_frequent', name: 'More Frequent', description: 'Up to 5 interventions per day', config: { maxInterventionsPerDay: 5, cooldownHours: 2 } },
      { id: 'less_frequent', name: 'Less Frequent', description: 'Max 2 interventions per day', config: { maxInterventionsPerDay: 2, cooldownHours: 6 } },
    ],
    trafficAllocation: { control: 34, more_frequent: 33, less_frequent: 33 },
    targeting: { premiumStatus: 'both', minSessions: 3 },
    primaryMetric: 'intervention_engagement_rate',
    secondaryMetrics: ['session_start_rate', 'coach_persona_satisfaction'],
    minSampleSize: 1000,
    minDurationDays: 21,
  },
];
