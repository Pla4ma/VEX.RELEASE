import type { BehaviorSignal, SignalType } from '../schemas';
import { v4 } from '../../../utils/uuid';
import { DEFAULT_SIGNAL_CONFIG } from './signal-config';

export function applyDecayAndWeight(
  signals: BehaviorSignal[],
): BehaviorSignal[] {
  const now = Date.now();
  return signals.map((signal) => {
    const ageMs = now - signal.timestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const decayFactor =
      DEFAULT_SIGNAL_CONFIG.decayFactors[signal.signalType] || 0.95;
    const decayMultiplier = Math.pow(decayFactor, ageDays);
    const weight =
      DEFAULT_SIGNAL_CONFIG.signalWeights[signal.signalType] || 0.7;
    const adjustedValue = signal.value * decayMultiplier;
    const adjustedConfidence = signal.confidence * weight;
    return { ...signal, value: adjustedValue, confidence: adjustedConfidence };
  });
}

export function aggregateSignals(signals: BehaviorSignal[]): BehaviorSignal[] {
  const grouped = new Map<SignalType, BehaviorSignal[]>();
  for (const signal of signals) {
    const existing = grouped.get(signal.signalType) || [];
    existing.push(signal);
    grouped.set(signal.signalType, existing);
  }
  const aggregated: BehaviorSignal[] = [];
  for (const [, typeSignals] of grouped) {
    const sorted = typeSignals.sort((a, b) => b.timestamp - a.timestamp);
    const mostRecent = sorted[0]!;
    const recentWindow = sorted.slice(0, 5);
    const weightedSum = recentWindow.reduce(
      (sum, s, idx) => sum + s.value * (recentWindow.length - idx),
      0,
    );
    const weightSum = recentWindow.reduce(
      (sum, _, idx) => sum + (recentWindow.length - idx),
      0,
    );
    const averageValue = weightedSum / weightSum;
    const averageConfidence =
      recentWindow.reduce((sum, s) => sum + s.confidence, 0) /
      recentWindow.length;
    aggregated.push({
      ...mostRecent,
      value: averageValue,
      confidence: averageConfidence,
    });
  }
  return aggregated;
}

export function calculateSignalConfidence(
  signalType: SignalType,
  value: number,
  metadata: Record<string, unknown>,
): number {
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
  if (metadata.sampleSize && typeof metadata.sampleSize === 'number') {
    if (metadata.sampleSize < 3) {
      confidence *= 0.7;
    } else if (metadata.sampleSize < 10) {
      confidence *= 0.9;
    }
  }
  if (metadata.quality === 'high') {
    confidence *= 1.1;
  }
  if (metadata.quality === 'low') {
    confidence *= 0.8;
  }
  return Math.min(1, confidence);
}

export function calculateConfidenceLevel(
  dataPoints: number,
  signals: BehaviorSignal[],
): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (dataPoints < DEFAULT_SIGNAL_CONFIG.coldStartThreshold) {
    return 'LOW';
  }
  if (dataPoints >= DEFAULT_SIGNAL_CONFIG.highConfidenceThreshold) {
    return 'HIGH';
  }
  const avgConfidence =
    signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
  const { medium, high } = DEFAULT_SIGNAL_CONFIG.confidenceThresholds;
  if (avgConfidence >= high && dataPoints >= 15) {
    return 'HIGH';
  }
  if (avgConfidence >= medium && dataPoints >= 10) {
    return 'MEDIUM';
  }
  return 'LOW';
}

export function calculateExpiration(signalType: SignalType): number {
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

export function generateSignalUUID(): string {
  return v4();
}
