import type { SignalType } from "../schemas";

export interface SignalProcessingConfig {
  signalWeights: Record<SignalType, number>;
  decayFactors: Record<SignalType, number>;
  confidenceThresholds: { low: number; medium: number; high: number };
  coldStartThreshold: number;
  highConfidenceThreshold: number;
}

export const DEFAULT_SIGNAL_CONFIG: SignalProcessingConfig = {
  signalWeights: {
    SESSION_FREQUENCY: 1.0,
    SESSION_QUALITY_TREND: 0.9,
    STREAK_MAINTENANCE_RATE: 0.95,
    PREFERRED_TIME_OF_DAY: 0.8,
    FOCUS_DURATION_PREFERENCE: 0.75,
    DIFFICULTY_PREFERENCE: 0.7,
    SOCIAL_ENGAGEMENT: 0.6,
    CHALLENGE_COMPLETION_RATE: 0.85,
    BOSS_PARTICIPATION: 0.9,
    MORNING_PERSON: 0.75,
    NIGHT_OWL: 0.75,
    WEEKEND_WARRIOR: 0.7,
    CONSISTENCY_SCORE: 0.9,
    RESPONSIVENESS_TO_REMINDERS: 0.65,
    COMEBACK_VELOCITY: 0.8,
  },
  decayFactors: {
    SESSION_FREQUENCY: 0.95,
    SESSION_QUALITY_TREND: 0.9,
    STREAK_MAINTENANCE_RATE: 0.98,
    PREFERRED_TIME_OF_DAY: 0.99,
    FOCUS_DURATION_PREFERENCE: 0.95,
    DIFFICULTY_PREFERENCE: 0.95,
    SOCIAL_ENGAGEMENT: 0.9,
    CHALLENGE_COMPLETION_RATE: 0.95,
    BOSS_PARTICIPATION: 0.95,
    MORNING_PERSON: 0.99,
    NIGHT_OWL: 0.99,
    WEEKEND_WARRIOR: 0.95,
    CONSISTENCY_SCORE: 0.95,
    RESPONSIVENESS_TO_REMINDERS: 0.9,
    COMEBACK_VELOCITY: 0.9,
  },
  confidenceThresholds: { low: 0.3, medium: 0.6, high: 0.8 },
  coldStartThreshold: 5,
  highConfidenceThreshold: 20,
};
