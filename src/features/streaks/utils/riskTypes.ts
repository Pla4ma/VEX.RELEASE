export type RiskLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskFactors {
  hoursSinceLastSession: number;
  typicalSessionHour: number;
  currentHour: number;
  historicalPattern: "CONSISTENT" | "VARIABLE" | "DECLINING";
  daysUntilStreakBreak: number;
  recentSessionQuality: number;
  weekendRisk: boolean;
  vacationMode: boolean;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  factors: RiskFactors;
  recommendation: string;
  urgency: "NONE" | "SOON" | "URGENT" | "CRITICAL";
  suggestedAction: "NONE" | "REMINDER" | "PUSH" | "INTERVENTION";
}

export const WEIGHTS = {
  TIME_DRIFT: 0.25,
  HOURS_ELAPSED: 0.3,
  PATTERN_DECLINE: 0.2,
  QUALITY_DROP: 0.15,
  WEEKEND_FACTOR: 0.1,
} as const;

export const DAY_HOURS = 24;
export const CRITICAL_THRESHOLD = 20;
export const HIGH_THRESHOLD = 12;
export const MEDIUM_THRESHOLD = 6;
