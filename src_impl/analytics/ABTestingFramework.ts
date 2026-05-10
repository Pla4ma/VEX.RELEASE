/**
 * A/B Testing Framework
 *
 * Phase 6.2 - Analytics & Experimentation
 * Testing framework for optimizing:
 * - Home recommendation algorithms
 * - Paywall timing and copy
 * - Session duration defaults
 * - Coach intervention frequency
 *
 * Dependencies:
 * - Analytics (event tracking)
 * - Home (recommendations)
 * - Monetization (paywalls)
 * - AI Coach (interventions)
 */

import { eventBus } from '../events';

// ============================================================================
// Experiment Types
// ============================================================================

export type ExperimentType = 'HOME_RECOMMENDATION' | 'PAYWALL_TIMING' | 'PAYWALL_COPY' | 'SESSION_DURATION' | 'COACH_FREQUENCY' | 'ONBOARDING_FLOW' | 'STREAK_UI' | 'BOSS_DIFFICULTY';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  type: ExperimentType;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startDate: number;
  endDate?: number;

  // Variants
  controlVariant: Variant;
  treatmentVariants: Variant[];

  // Traffic allocation (sum must be 100)
  trafficAllocation: Record<string, number>; // variantId -> percentage

  // Targeting
  targeting: {
    userSegments?: string[]; // 'new', 'active', 'churned', etc.
    minSessions?: number;
    maxSessions?: number;
    platforms?: ('ios' | 'android' | 'web')[];
    premiumStatus?: 'free' | 'premium' | 'both';
  };

  // Success metrics
  primaryMetric: string;
  secondaryMetrics: string[];
  minSampleSize: number;
  minDurationDays: number;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: number;
  userId: string;
}

// ============================================================================
// Predefined Experiments (from Phase 6 plan)
// ============================================================================

export const PREDEFINED_EXPERIMENTS: Omit<Experiment, 'id' | 'startDate'>[] = [
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
      {
        id: 'ml_ranked',
        name: 'ML Ranked',
        description: 'ML-based ranking with engagement prediction',
        config: { algorithm: 'ml_ranked', diversityWeight: 0.5 },
      },
      {
        id: 'popularity_boost',
        name: 'Popularity Boost',
        description: 'Boost recently popular items',
        config: { algorithm: 'popularity_boost', diversityWeight: 0.2 },
      },
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
      {
        id: 'earlier',
        name: 'Earlier Paywall',
        description: 'Show after first session completion',
        config: { trigger: 'first_session_complete', delay: 0 },
      },
      {
        id: 'delayed',
        name: 'Delayed Paywall',
        description: 'Show on 3rd study plan attempt',
        config: { trigger: 'third_plan_attempt', delay: 0 },
      },
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
      {
        id: 'social_proof',
        name: 'Social Proof',
        description: 'Emphasize community and popularity',
        config: { headline: 'Join 10,000+ Focus Masters', subtext: 'The choice of serious students' },
      },
      {
        id: 'fomo',
        name: 'FOMO',
        description: 'Emphasize missing out',
        config: { headline: 'Do not Miss Your Streak', subtext: 'Premium includes streak insurance' },
      },
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
      {
        id: 'short',
        name: '10 Minutes',
        description: 'Shorter initial commitment',
        config: { defaultDuration: 10, options: [10, 15, 25, 45] },
      },
      {
        id: 'long',
        name: '25 Minutes',
        description: 'Pomodoro-style default',
        config: { defaultDuration: 25, options: [15, 25, 45, 60] },
      },
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
      {
        id: 'more_frequent',
        name: 'More Frequent',
        description: 'Up to 5 interventions per day',
        config: { maxInterventionsPerDay: 5, cooldownHours: 2 },
      },
      {
        id: 'less_frequent',
        name: 'Less Frequent',
        description: 'Max 2 interventions per day',
        config: { maxInterventionsPerDay: 2, cooldownHours: 6 },
      },
    ],
    trafficAllocation: { control: 34, more_frequent: 33, less_frequent: 33 },
    targeting: { premiumStatus: 'both', minSessions: 3 },
    primaryMetric: 'intervention_engagement_rate',
    secondaryMetrics: ['session_start_rate', 'coach_persona_satisfaction'],
    minSampleSize: 1000,
    minDurationDays: 21,
  },
];

// ============================================================================
// Experiment Management
// ============================================================================

const experiments = new Map<string, Experiment>();
const userAssignments = new Map<string, ExperimentAssignment[]>(); // userId -> assignments

/**
 * Create and start experiment
 */
export function createExperiment(experimentData: Omit<Experiment, 'id' | 'startDate'>): Experiment {
  const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const experiment: Experiment = {
    ...experimentData,
    id,
    startDate: Date.now(),
  };

  experiments.set(id, experiment);

  eventBus.publish('experiment:created', {
    experimentId: id,
    name: experiment.name,
    type: experiment.type,
  });

  return experiment;
}

/**
 * Get experiment by ID
 */
export function getExperiment(id: string): Experiment | null {
  return experiments.get(id) || null;
}

/**
 * Assign user to experiment variant
 */
export function assignUserToExperiment(
  userId: string,
  experimentId: string,
  userProfile: {
    sessions: number;
    isPremium: boolean;
    platform: 'ios' | 'android' | 'web';
    segment: string;
  },
): string | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }
  if (experiment.status !== 'RUNNING') {
    return null;
  }

  // Check targeting
  if (!isUserEligible(experiment, userProfile)) {
    return null;
  }

  // Check if already assigned
  const userExps = userAssignments.get(userId) || [];
  const existing = userExps.find((a) => a.experimentId === experimentId);
  if (existing) {
    return existing.variantId;
  }

  // Assign based on traffic allocation
  const variantId = selectVariant(experiment.trafficAllocation);
  if (!variantId) {
    return null;
  }

  const assignment: ExperimentAssignment = {
    experimentId,
    variantId,
    assignedAt: Date.now(),
    userId,
  };

  userExps.push(assignment);
  userAssignments.set(userId, userExps);

  eventBus.publish('experiment:assigned', {
    userId,
    experimentId,
    variantId,
  });

  return variantId;
}

/**
 * Check if user is eligible for experiment
 */
function isUserEligible(experiment: Experiment, profile: { sessions: number; isPremium: boolean; platform: string; segment: string }): boolean {
  const { targeting } = experiment;

  // Check session count
  if (targeting.minSessions && profile.sessions < targeting.minSessions) {
    return false;
  }
  if (targeting.maxSessions && profile.sessions > targeting.maxSessions) {
    return false;
  }

  // Check premium status
  if (targeting.premiumStatus === 'free' && profile.isPremium) {
    return false;
  }
  if (targeting.premiumStatus === 'premium' && !profile.isPremium) {
    return false;
  }

  // Check platform
  if (targeting.platforms && !targeting.platforms.includes(profile.platform as never)) {
    return false;
  }

  // Check segment
  if (targeting.userSegments && !targeting.userSegments.includes(profile.segment)) {
    return false;
  }

  return true;
}

/**
 * Select variant based on traffic allocation
 */
function selectVariant(allocation: Record<string, number>): string | null {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const [variantId, percentage] of Object.entries(allocation)) {
    cumulative += percentage;
    if (random <= cumulative) {
      return variantId;
    }
  }

  return null;
}

/**
 * Get user's variant for an experiment
 */
export function getUserVariant(userId: string, experimentId: string): string | null {
  const userExps = userAssignments.get(userId) || [];
  const assignment = userExps.find((a) => a.experimentId === experimentId);
  return assignment?.variantId || null;
}

/**
 * Get variant config for user
 */
export function getVariantConfig(userId: string, experimentId: string): Record<string, unknown> | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  const variantId = getUserVariant(userId, experimentId);
  if (!variantId) {
    return null;
  }

  if (variantId === experiment.controlVariant.id) {
    return experiment.controlVariant.config;
  }

  const variant = experiment.treatmentVariants.find((v) => v.id === variantId);
  return variant?.config || null;
}

// ============================================================================
// Experiment Results
// ============================================================================

export interface ExperimentResults {
  experimentId: string;
  experimentName: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startDate: number;
  endDate?: number;
  totalParticipants: number;
  variants: VariantResult[];
  winner?: string; // variantId
  confidence: number; // 0-1
  recommendedAction: 'CONTINUE' | 'STOP' | 'IMPLEMENT_WINNER';
}

export interface VariantResult {
  variantId: string;
  variantName: string;
  participants: number;
  metrics: Record<string, { value: number; confidenceInterval: [number, number] }>;
  liftVsControl?: Record<string, number>; // percentage lift
  isWinning?: boolean;
}

const experimentResults = new Map<string, ExperimentResults>();

/**
 * Record experiment event
 */
export function recordExperimentEvent(userId: string, experimentId: string, event: { metric: string; value: number }): void {
  const userVariant = getUserVariant(userId, experimentId);
  if (userVariant) {
    eventBus.publish('experiment:event', {
      userId,
      experimentId,
      variantId: userVariant,
      metric: event.metric,
      value: event.value,
    });
  }
}

/**
 * Calculate experiment results
 */
export function calculateResults(experimentId: string): ExperimentResults | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  // In real implementation, this would query aggregated metrics
  // For now, return placeholder structure

  const results: ExperimentResults = {
    experimentId,
    experimentName: experiment.name,
    status: experiment.status,
    startDate: experiment.startDate,
    endDate: experiment.endDate,
    totalParticipants: 0,
    variants: [],
    confidence: 0,
    recommendedAction: 'CONTINUE',
  };

  experimentResults.set(experimentId, results);
  return results;
}

/**
 * Complete experiment and declare winner
 */
export function completeExperiment(experimentId: string, winnerVariantId?: string): ExperimentResults | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  experiment.status = 'COMPLETED';
  experiment.endDate = Date.now();

  const results = calculateResults(experimentId);
  if (results && winnerVariantId) {
    results.winner = winnerVariantId;
    results.recommendedAction = 'IMPLEMENT_WINNER';
  }

  if (winnerVariantId && results) {
    eventBus.publish('experiment:completed', {
      experimentId,
      winner: winnerVariantId,
      results,
    });
  }

  return results;
}

/**
 * Get all active experiments
 */
export function getActiveExperiments(): Experiment[] {
  return Array.from(experiments.values()).filter((e) => e.status === 'RUNNING');
}

/**
 * Get user's active experiments
 */
export function getUserExperiments(userId: string): ExperimentAssignment[] {
  return userAssignments.get(userId) || [];
}

// ============================================================================
// Exports (types already exported above)
// ============================================================================
