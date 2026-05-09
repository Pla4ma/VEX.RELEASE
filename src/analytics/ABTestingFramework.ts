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

import { eventBus } from "../events";

// ============================================================================
// Experiment Types
// ============================================================================

export type ExperimentType = "HOME_RECOMMENDATION" | "PAYWALL_TIMING" | "PAYWALL_COPY" | "SESSION_DURATION" | "COACH_FREQUENCY" | "ONBOARDING_FLOW" | "STREAK_UI" | "BOSS_DIFFICULTY";

export interface Experiment {
  id: string;
  name: string;
  description: string;
  type: ExperimentType;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED";
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
    platforms?: ("ios" | "android" | "web")[];
    premiumStatus?: "free" | "premium" | "both";
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

export const PREDEFINED_EXPERIMENTS: Omit<Experiment, "id" | "startDate">[] = [
  {
    name: "Home Recommendation Algorithm",
    description: "Test different recommendation ranking algorithms",
    type: "HOME_RECOMMENDATION",
    status: "DRAFT",
    controlVariant: {
      id: "control",
      name: "Current Algorithm",
      description: "Existing rule-based recommendations",
      config: { algorithm: "rule_based", diversityWeight: 0.3 },
    },
    treatmentVariants: [
      {
        id: "ml_ranked",
        name: "ML Ranked",
        description: "ML-based ranking with engagement prediction",
        config: { algorithm: "ml_ranked", diversityWeight: 0.5 },
      },
      {
        id: "popularity_boost",
        name: "Popularity Boost",
        description: "Boost recently popular items",
        config: { algorithm: "popularity_boost", diversityWeight: 0.2 },
      },
    ],
    trafficAllocation: { control: 50, ml_ranked: 25, popularity_boost: 25 },
    targeting: { userSegments: ["active"], premiumStatus: "both" },
    primaryMetric: "home_recommendation_click_rate",
    secondaryMetrics: ["session_start_rate", "study_plan_start_rate"],
    minSampleSize: 1000,
    minDurationDays: 14,
  },
  {
    name: "Paywall Timing Optimization",
    description: "Test when to show paywall for best conversion",
    type: "PAYWALL_TIMING",
    status: "DRAFT",
    controlVariant: {
      id: "control",
      name: "Current Timing",
      description: "Show paywall on 2nd study plan attempt",
      config: { trigger: "second_plan_attempt", delay: 0 },
    },
    treatmentVariants: [
      {
        id: "earlier",
        name: "Earlier Paywall",
        description: "Show after first session completion",
        config: { trigger: "first_session_complete", delay: 0 },
      },
      {
        id: "delayed",
        name: "Delayed Paywall",
        description: "Show on 3rd study plan attempt",
        config: { trigger: "third_plan_attempt", delay: 0 },
      },
    ],
    trafficAllocation: { control: 34, earlier: 33, delayed: 33 },
    targeting: { userSegments: ["new"], premiumStatus: "free", maxSessions: 10 },
    primaryMetric: "paywall_conversion_rate",
    secondaryMetrics: ["d1_retention", "session_completion_rate"],
    minSampleSize: 500,
    minDurationDays: 7,
  },
  {
    name: "Paywall Copy Variants",
    description: "Test different paywall messaging",
    type: "PAYWALL_COPY",
    status: "DRAFT",
    controlVariant: {
      id: "control",
      name: "Value First",
      description: "Lead with value proposition",
      config: { headline: "Study 3x Faster", subtext: "Premium users complete 78% more plans" },
    },
    treatmentVariants: [
      {
        id: "social_proof",
        name: "Social Proof",
        description: "Emphasize community and popularity",
        config: { headline: "Join 10,000+ Focus Masters", subtext: "The choice of serious students" },
      },
      {
        id: "fomo",
        name: "FOMO",
        description: "Emphasize missing out",
        config: { headline: "Do not Miss Your Streak", subtext: "Premium includes streak insurance" },
      },
    ],
    trafficAllocation: { control: 34, social_proof: 33, fomo: 33 },
    targeting: { premiumStatus: "free" },
    primaryMetric: "paywall_conversion_rate",
    secondaryMetrics: ["paywall_dismiss_rate", "trial_start_rate"],
    minSampleSize: 1000,
    minDurationDays: 14,
  },
  {
    name: "Default Session Duration",
    description: "Test optimal default session length",
    type: "SESSION_DURATION",
    status: "DRAFT",
    controlVariant: {
      id: "control",
      name: "15 Minutes",
      description: "Current default",
      config: { defaultDuration: 15, options: [15, 25, 45, 60] },
    },
    treatmentVariants: [
      {
        id: "short",
        name: "10 Minutes",
        description: "Shorter initial commitment",
        config: { defaultDuration: 10, options: [10, 15, 25, 45] },
      },
      {
        id: "long",
        name: "25 Minutes",
        description: "Pomodoro-style default",
        config: { defaultDuration: 25, options: [15, 25, 45, 60] },
      },
    ],
    trafficAllocation: { control: 34, short: 33, long: 33 },
    targeting: { userSegments: ["new"], premiumStatus: "both" },
    primaryMetric: "session_completion_rate",
    secondaryMetrics: ["session_count_week1", "d7_retention"],
    minSampleSize: 500,
    minDurationDays: 14,
  },
  {
    name: "Coach Intervention Frequency",
    description: "Test how often coach should intervene",
    type: "COACH_FREQUENCY",
    status: "DRAFT",
    controlVariant: {
      id: "control",
      name: "Current Frequency",
      description: "Show when relevant",
      config: { maxInterventionsPerDay: 3, cooldownHours: 4 },
    },
    treatmentVariants: [
      {
        id: "more_frequent",
        name: "More Frequent",
        description: "Up to 5 interventions per day",
        config: { maxInterventionsPerDay: 5, cooldownHours: 2 },
      },
      {
        id: "less_frequent",
        name: "Less Frequent",
        description: "Max 2 interventions per day",
        config: { maxInterventionsPerDay: 2, cooldownHours: 6 },
      },
    ],
    trafficAllocation: { control: 34, more_frequent: 33, less_frequent: 33 },
    targeting: { premiumStatus: "both", minSessions: 3 },
    primaryMetric: "intervention_engagement_rate",
    secondaryMetrics: ["session_start_rate", "coach_persona_satisfaction"],
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
export function createExperiment(experimentData: Omit<Experiment, "id" | "startDate">): Experiment {
  const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const experiment: Experiment = {
    ...experimentData,
    id,
    startDate: Date.now(),
  };

  experiments.set(id, experiment);

  eventBus.publish("experiment:created", { experiment });
  return experiment;
}

/**
 * Get experiment by ID
 */
export function getExperiment(id: string): Experiment | undefined {
  return experiments.get(id);
}

/**
 * Get all experiments
 */
export function getAllExperiments(): Experiment[] {
  return Array.from(experiments.values());
}

/**
 * Get active experiments
 */
export function getActiveExperiments(): Experiment[] {
  return Array.from(experiments.values()).filter(
    (exp) => exp.status === "RUNNING"
  );
}

/**
 * Assign user to experiment variant
 */
export function assignUserToExperiment(
  userId: string,
  experimentId: string,
  forceVariant?: string
): ExperimentAssignment | null {
  const experiment = experiments.get(experimentId);
  if (!experiment || experiment.status !== "RUNNING") {
    return null;
  }

  // Check if user is already assigned
  const existingAssignments = userAssignments.get(userId) || [];
  const existingAssignment = existingAssignments.find((a) => a.experimentId === experimentId);
  if (existingAssignment) {
    return existingAssignment;
  }

  // Check targeting criteria
  if (!isUserEligibleForExperiment(userId, experiment)) {
    return null;
  }

  // Select variant
  const variantId = forceVariant || selectVariant(userId, experiment);
  if (!variantId) {
    return null;
  }

  const assignment: ExperimentAssignment = {
    experimentId,
    variantId,
    assignedAt: Date.now(),
    userId,
  };

  // Store assignment
  userAssignments.set(userId, [...existingAssignments, assignment]);

  eventBus.publish("experiment:assigned", { assignment, experiment });
  return assignment;
}

/**
 * Get user's variant for experiment
 */
export function getUserVariant(userId: string, experimentId: string): Variant | null {
  const assignments = userAssignments.get(userId) || [];
  const assignment = assignments.find((a) => a.experimentId === experimentId);
  if (!assignment) {
    return null;
  }

  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  return (
    experiment.controlVariant.id === assignment.variantId
      ? experiment.controlVariant
      : experiment.treatmentVariants.find((v) => v.id === assignment.variantId)
  ) || null;
}

/**
 * Get variant config
 */
export function getVariantConfig<T = Record<string, unknown>>(
  userId: string,
  experimentId: string
): T | null {
  const variant = getUserVariant(userId, experimentId);
  return (variant?.config as T) || null;
}

/**
 * Record experiment event
 */
export function recordExperimentEvent(
  userId: string,
  experimentId: string,
  eventName: string,
  value?: number,
  properties?: Record<string, unknown>
): void {
  const assignment = userAssignments
    .get(userId)
    ?.find((a) => a.experimentId === experimentId);
  
  if (!assignment) {
    return;
  }

  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return;
  }

  eventBus.publish("experiment:event", {
    userId,
    experimentId,
    variantId: assignment.variantId,
    eventName,
    value,
    properties,
    timestamp: Date.now(),
  });
}

/**
 * Calculate experiment results
 */
export interface ExperimentResults {
  experimentId: string;
  variantResults: Record<string, VariantResult>;
  winner?: string;
  confidence: number;
  significance: number;
  sampleSize: number;
  duration: number;
}

export interface VariantResult {
  variantId: string;
  sampleSize: number;
  conversionRate?: number;
  averageValue?: number;
  uplift?: number;
  confidence: number;
}

export function calculateResults(experimentId: string): ExperimentResults | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  // In a real implementation, this would query the analytics database
  // For now, return placeholder results
  const variantResults: Record<string, VariantResult> = {
    [experiment.controlVariant.id]: {
      variantId: experiment.controlVariant.id,
      sampleSize: 500,
      conversionRate: 0.05,
      confidence: 0.95,
    },
  };

  experiment.treatmentVariants.forEach((variant) => {
    variantResults[variant.id] = {
      variantId: variant.id,
      sampleSize: 480,
      conversionRate: 0.06,
      uplift: 0.01,
      confidence: 0.92,
    };
  });

  return {
    experimentId,
    variantResults,
    confidence: 0.92,
    significance: 0.05,
    sampleSize: 980,
    duration: Date.now() - experiment.startDate,
  };
}

/**
 * Complete experiment
 */
export function completeExperiment(experimentId: string, winner?: string): void {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return;
  }

  experiment.status = "COMPLETED";
  experiment.endDate = Date.now();

  eventBus.publish("experiment:completed", { experiment, winner });
}

// ============================================================================
// Helper Functions
// ============================================================================

function isUserEligibleForExperiment(_userId: string, _experiment: Experiment): boolean {
  // In a real implementation, this would check user properties
  // For now, assume all users are eligible
  return true;
}

function selectVariant(userId: string, experiment: Experiment): string | null {
  // Hash user ID for consistent assignment
  const hash = hashString(userId + experiment.id);
  const bucket = hash % 100;

  let cumulativePercentage = 0;
  for (const [variantId, percentage] of Object.entries(experiment.trafficAllocation)) {
    cumulativePercentage += percentage;
    if (bucket < cumulativePercentage) {
      return variantId;
    }
  }

  return experiment.controlVariant.id;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ============================================================================
// User Assignment Management
// ============================================================================

/**
 * Get all experiments for a user
 */
export function getUserExperiments(userId: string): ExperimentAssignment[] {
  return userAssignments.get(userId) || [];
}

/**
 * Remove user from experiment
 */
export function removeUserFromExperiment(userId: string, experimentId: string): boolean {
  const assignments = userAssignments.get(userId) || [];
  const filtered = assignments.filter((a) => a.experimentId !== experimentId);
  
  if (filtered.length === assignments.length) {
    return false; // No assignment found
  }

  userAssignments.set(userId, filtered);
  eventBus.publish("experiment:unassigned", { userId, experimentId });
  return true;
}

/**
 * Clear all user assignments
 */
export function clearUserAssignments(userId: string): void {
  userAssignments.delete(userId);
  eventBus.publish("experiment:assignments_cleared", { userId });
}

// ============================================================================
// Experiment Analytics
// ============================================================================

/**
 * Get experiment statistics
 */
export function getExperimentStats(experimentId: string): {
  totalAssignments: number;
  variantAssignments: Record<string, number>;
  dailyAssignments: Array<{ date: string; count: number }>;
} | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  const allAssignments = Array.from(userAssignments.values())
    .flat()
    .filter((a) => a.experimentId === experimentId);

  const variantAssignments: Record<string, number> = {};
  allAssignments.forEach((assignment) => {
    variantAssignments[assignment.variantId] = (variantAssignments[assignment.variantId] || 0) + 1;
  });

  // Group by date
  const dailyAssignments = allAssignments.reduce((acc, assignment) => {
    const date = new Date(assignment.assignedAt).toISOString().split("T")[0];
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, [] as Array<{ date: string; count: number }>);

  return {
    totalAssignments: allAssignments.length,
    variantAssignments,
    dailyAssignments: dailyAssignments.sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * Get platform-wide experiment overview
 */
export function getExperimentOverview(): {
  totalExperiments: number;
  runningExperiments: number;
  completedExperiments: number;
  totalAssignments: number;
  experimentsByType: Record<ExperimentType, number>;
} {
  const allExperiments = Array.from(experiments.values());
  const allAssignments = Array.from(userAssignments.values()).flat();

  const experimentsByType = allExperiments.reduce((acc, exp) => {
    acc[exp.type] = (acc[exp.type] || 0) + 1;
    return acc;
  }, {} as Record<ExperimentType, number>);

  return {
    totalExperiments: allExperiments.length,
    runningExperiments: allExperiments.filter((e) => e.status === "RUNNING").length,
    completedExperiments: allExperiments.filter((e) => e.status === "COMPLETED").length,
    totalAssignments: allAssignments.length,
    experimentsByType,
  };
}
