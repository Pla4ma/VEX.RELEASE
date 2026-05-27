/**
 * A/B Testing Types
 *
 * Type definitions for experiment framework
 */

export type ExperimentType =
  | "HOME_RECOMMENDATION"
  | "PAYWALL_TIMING"
  | "PAYWALL_COPY"
  | "SESSION_DURATION"
  | "COACH_FREQUENCY"
  | "ONBOARDING_FLOW"
  | "STREAK_UI"
  | "BOSS_DIFFICULTY";

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

export interface ExperimentResults {
  experimentId: string;
  status: "RUNNING" | "COMPLETED" | "INCONCLUSIVE";
  startDate: number;
  endDate?: number;
  totalParticipants: number;
  participantsPerVariant: Record<string, number>;

  // Results per variant
  variantResults: Record<string, VariantResult>;

  // Statistical significance
  significance: number; // p-value
  confidence: number; // 0-1
  winner?: string; // variant ID

  // Recommendation
  recommendation:
    | "CONTROL_WINS"
    | "TREATMENT_WINS"
    | "INCONCLUSIVE"
    | "NEED_MORE_DATA";
  reasoning: string;
}

export interface VariantResult {
  variantId: string;
  participants: number;
  conversionRate?: number;
  averageValue?: number;
  primaryMetricValue: number;
  secondaryMetricValues: Record<string, number>;
  statisticalSignificance: number;
  confidenceInterval: [number, number];
  improvement: number; // percentage over control
}
