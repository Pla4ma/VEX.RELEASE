/**
 * Behavior Analytics
 *
 * Production-grade behavior signal processing and pattern detection.
 * Aggregates user signals into actionable behavioral profiles.
 */

import { type BehaviorSignal, type BehaviorProfile, type SignalType, BehaviorProfileSchema, BehaviorSignalSchema } from '../schemas';
import * as repository from '../repository';
import { withRetry } from '../utils/retry';

// ============================================================================
// Signal Processing Configuration
// ============================================================================

interface SignalProcessingConfig {
  signalWeights: Record<SignalType, number>;
  decayFactors: Record<SignalType, number>; // How quickly signals age
  confidenceThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  coldStartThreshold: number;
  highConfidenceThreshold: number;
}

const DEFAULT_SIGNAL_CONFIG: SignalProcessingConfig = {
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
    SESSION_FREQUENCY: 0.95, // Recent sessions matter most
    SESSION_QUALITY_TREND: 0.9,
    STREAK_MAINTENANCE_RATE: 0.98, // Streaks persist
    PREFERRED_TIME_OF_DAY: 0.99, // Preferences stable
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
  confidenceThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
  },
  coldStartThreshold: 5,
  highConfidenceThreshold: 20,
};

// ============================================================================
// Signal Processing
// ============================================================================
// ============================================================================
// Signal Aggregation
// ============================================================================

function applyDecayAndWeight(signals: BehaviorSignal[]): BehaviorSignal[] {
  const now = Date.now();

  return signals.map((signal) => {
    const ageMs = now - signal.timestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    // Get decay factor for this signal type
    const decayFactor = DEFAULT_SIGNAL_CONFIG.decayFactors[signal.signalType] || 0.95;

    // Calculate decay
    const decayMultiplier = Math.pow(decayFactor, ageDays);

    // Get weight for this signal type
    const weight = DEFAULT_SIGNAL_CONFIG.signalWeights[signal.signalType] || 0.7;

    // Apply decay and weight
    const adjustedValue = signal.value * decayMultiplier;
    const adjustedConfidence = signal.confidence * weight;

    return {
      ...signal,
      value: adjustedValue,
      confidence: adjustedConfidence,
    };
  });
}

function aggregateSignals(signals: BehaviorSignal[]): BehaviorSignal[] {
  // Group by signal type
  const grouped = new Map<SignalType, BehaviorSignal[]>();

  for (const signal of signals) {
    const existing = grouped.get(signal.signalType) || [];
    existing.push(signal);
    grouped.set(signal.signalType, existing);
  }

  // Aggregate each group
  const aggregated: BehaviorSignal[] = [];

  for (const [signalType, typeSignals] of grouped) {
    // Sort by timestamp (newest first)
    const sorted = typeSignals.sort((a, b) => b.timestamp - a.timestamp);

    // Take most recent
    const mostRecent = sorted[0];

    // Calculate weighted average of recent signals
    const recentWindow = sorted.slice(0, 5); // Last 5 signals
    const weightedSum = recentWindow.reduce((sum, s, idx) => sum + s.value * (recentWindow.length - idx), 0);
    const weightSum = recentWindow.reduce((sum, _, idx) => sum + (recentWindow.length - idx), 0);
    const averageValue = weightedSum / weightSum;

    // Calculate average confidence
    const averageConfidence = recentWindow.reduce((sum, s) => sum + s.confidence, 0) / recentWindow.length;

    aggregated.push({
      ...mostRecent,
      value: averageValue,
      confidence: averageConfidence,
    });
  }

  return aggregated;
}

// ============================================================================
// Confidence Calculation
// ============================================================================

function calculateSignalConfidence(signalType: SignalType, value: number, metadata: Record<string, unknown>): number {
  // Base confidence varies by signal type reliability
  const baseConfidence: Record<SignalType, number> = {
    SESSION_FREQUENCY: 0.9,
    SESSION_QUALITY_TREND: 0.85,
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
  };

  let confidence = baseConfidence[signalType] || 0.7;

  // Adjust based on sample size in metadata
  if (metadata.sampleSize && typeof metadata.sampleSize === 'number') {
    if (metadata.sampleSize < 3) {
      confidence *= 0.7;
    } else if (metadata.sampleSize < 10) {
      confidence *= 0.9;
    }
  }

  // Adjust based on data quality
  if (metadata.quality === 'high') {
    confidence *= 1.1;
  }
  if (metadata.quality === 'low') {
    confidence *= 0.8;
  }

  return Math.min(1, confidence);
}

function calculateConfidenceLevel(dataPoints: number, signals: BehaviorSignal[]): 'LOW' | 'MEDIUM' | 'HIGH' {
  // Check minimum data points
  if (dataPoints < DEFAULT_SIGNAL_CONFIG.coldStartThreshold) {
    return 'LOW';
  }

  if (dataPoints >= DEFAULT_SIGNAL_CONFIG.highConfidenceThreshold) {
    return 'HIGH';
  }

  // Check signal confidences
  const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

  const { low, medium, high } = DEFAULT_SIGNAL_CONFIG.confidenceThresholds;

  if (avgConfidence >= high && dataPoints >= 15) {
    return 'HIGH';
  }
  if (avgConfidence >= medium && dataPoints >= 10) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function calculateExpiration(signalType: SignalType): number {
  // Different signals expire at different rates
  const expirationDays: Record<SignalType, number> = {
    SESSION_FREQUENCY: 30,
    SESSION_QUALITY_TREND: 30,
    STREAK_MAINTENANCE_RATE: 90,
    PREFERRED_TIME_OF_DAY: 60,
    FOCUS_DURATION_PREFERENCE: 45,
    DIFFICULTY_PREFERENCE: 45,
    SOCIAL_ENGAGEMENT: 30,
    CHALLENGE_COMPLETION_RATE: 60,
    BOSS_PARTICIPATION: 60,
    MORNING_PERSON: 90,
    NIGHT_OWL: 90,
    WEEKEND_WARRIOR: 60,
    CONSISTENCY_SCORE: 30,
    RESPONSIVENESS_TO_REMINDERS: 30,
    COMEBACK_VELOCITY: 60,
  };

  const days = expirationDays[signalType] || 30;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

// ============================================================================
// Pattern Detection
// ============================================================================
// ============================================================================
// Utilities
// ============================================================================

function generateSignalId(): string {
  return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Analytics Export
// ============================================================================
export * from "./behavior-analytics.types";
export * from "./behavior-analytics.types";
export * from "./behavior-analytics.part1";
