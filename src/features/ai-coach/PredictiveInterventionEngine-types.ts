export type PredictionType =
  | "STREAK_AT_RISK"
  | "SESSION_ABANDON_RISK"
  | "BURNOUT_DETECTED"
  | "OPTIMAL_TIME_WINDOW"
  | "DIFFICULTY_MISMATCH"
  | "SOCIAL_ISOLATION"
  | "CREATURE_NEGLECT"
  | "RAID_PARTICIPATION_DROP"
  | "PRIME_TIME_MISSED"
  | "CREATURE_EVOLUTION_STALL";

export interface SessionRecord {
  date: string;
  completed: boolean;
  duration: number;
  hour: number;
  dayOfWeek: number;
}

export interface BehavioralPattern {
  userId: string;
  patternType: "consistent" | "inconsistent" | "declining" | "improving";
  daysOfWeek: number[];
  timeOfDay: number[];
  averageSessionDuration: number;
  completionRate: number;
  streakBreakFrequency: number;
  last30DaysTrend: "up" | "stable" | "down";
}

export interface RiskPrediction {
  id: string;
  userId: string;
  type: PredictionType;
  confidence: number;
  predictedAt: number;
  predictedToOccurAt: number;
  severity: "low" | "medium" | "high" | "critical";
  evidence: string[];
  recommendedAction: string;
  interventionSent: boolean;
  interventionType: string;
  actualOutcome: "prevented" | "occurred" | "unknown" | null;
  outcomeVerifiedAt: number | null;
}

export interface InterventionResult {
  predictionId: string;
  sentAt: number;
  channel: "push" | "in_app" | "coach_message";
  message: string;
  userResponded: boolean;
  outcome: "prevented" | "ignored" | "unknown";
}

export interface RiskAssessment {
  confidence: number;
  severity: RiskPrediction["severity"];
  evidence: string[];
  action: string;
}

export interface OptimalTimeResult {
  confidence: number;
  nextWindow: number;
  evidence: string[];
  action: string;
}
