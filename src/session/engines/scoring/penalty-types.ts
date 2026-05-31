import type { FocusQualityMetrics } from '../../types';

export interface PausePenaltyInput {
  pauseCount: number;
  totalPauseDurationSeconds: number;
}

export type InterruptionSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export interface InterruptionPenaltyInput {
  interruptions: Array<{
    severity: InterruptionSeverity;
    duration: number;
    autoRecovered: boolean;
  }>;
}

export interface QualityPenaltyInput {
  focusMetrics: FocusQualityMetrics;
  distractionTime: number;
  totalSessionTime: number;
}

export type AntiCheatViolationType =
  | 'TIME_MANIPULATION'
  | 'DEVICE_CHANGE'
  | 'RAPID_COMPLETION'
  | 'SUSPICIOUS_PATTERN'
  | 'IMPOSSIBLE_SCORE';

export interface AntiCheatPenaltyInput {
  violations: Array<{
    type: AntiCheatViolationType;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: number;
  }>;
}

export interface AbandonPenaltyInput {
  progressPercentage: number;
  streakAtRisk: boolean;
  timeInvestedSeconds: number;
  hasStreakSave: boolean;
}

export interface AbandonPenaltyResult {
  totalPenalty: number;
  scorePenalty: number;
  streakPreserved: boolean;
  partialCredit: boolean;
  creditPercentage: number;
}

export interface TotalPenaltyInput {
  pausePenalty: number;
  interruptionPenalty: number;
  qualityPenalty: number;
  antiCheatPenalty: number;
  baseScore: number;
}

export type PenaltyAction = 'WARNING' | 'PENALTY' | 'DISQUALIFY' | 'BAN';

export interface InterruptionPenaltyResult {
  total: number;
  breakdown: Record<InterruptionSeverity, number>;
}

export interface AntiCheatViolationResult {
  type: AntiCheatViolationType;
  penalty: number;
}

export interface AntiCheatPenaltyResult {
  total: number;
  violations: Array<AntiCheatViolationResult>;
  actionRequired: PenaltyAction;
}

export interface TotalPenaltyResult {
  total: number;
  capped: boolean;
  percentage: number;
  breakdown: Record<string, number>;
}
