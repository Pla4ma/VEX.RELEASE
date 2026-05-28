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
  controlVariant: Variant;
  treatmentVariants: Variant[];
  trafficAllocation: Record<string, number>;
  targeting: {
    userSegments?: string[];
    minSessions?: number;
    maxSessions?: number;
    platforms?: ("ios" | "android" | "web")[];
    premiumStatus?: "free" | "premium" | "both";
  };
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
  experimentName: string;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED";
  startDate: number;
  endDate?: number;
  totalParticipants: number;
  variants: VariantResult[];
  winner?: string;
  confidence: number;
  recommendedAction: "CONTINUE" | "STOP" | "IMPLEMENT_WINNER";
}

export interface VariantResult {
  variantId: string;
  variantName: string;
  participants: number;
  metrics: Record<
    string,
    { value: number; confidenceInterval: [number, number] }
  >;
  liftVsControl?: Record<string, number>;
  isWinning?: boolean;
}
