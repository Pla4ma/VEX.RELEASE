/**
 * A/B Testing Types
 *
 * Phase 6.2 - Analytics & Experimentation
 * Core type definitions for the A/B testing framework.
 */

export type ExperimentType =
  | 'HOME_RECOMMENDATION'
  | 'PAYWALL_TIMING'
  | 'PAYWALL_COPY'
  | 'SESSION_DURATION'
  | 'COACH_FREQUENCY'
  | 'ONBOARDING_FLOW'
  | 'STREAK_UI'
  | 'BOSS_DIFFICULTY';

export interface Variant {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  type: ExperimentType;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startDate: number;
  endDate?: number;
  controlVariant: Variant;
  treatmentVariants: Variant[];
  trafficAllocation: Record<string, number>;
  targeting: {
    userSegments?: string[];
    minSessions?: number;
    maxSessions?: number;
    platforms?: ('ios' | 'android' | 'web')[];
    premiumStatus?: 'free' | 'premium' | 'both';
  };
  primaryMetric: string;
  secondaryMetrics: string[];
  minSampleSize: number;
  minDurationDays: number;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: number;
  userId: string;
}

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
