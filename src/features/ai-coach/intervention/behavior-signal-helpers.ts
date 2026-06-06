import type {
  BehaviorProfile,
  BehaviorSignal,
  SignalType,
  CoachUserState,
} from '../schemas';
import { HIGH_CONFIDENCE_THRESHOLD_DATA_POINTS } from '../session/session-analyzer-types';

// ─── Signal confidence mapping ──────────────────────────────────
const BASE_CONFIDENCE: Record<SignalType, number> = {
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

export function calculateSignalConfidence(
  signalType: SignalType,
  _value: number,
): number {
  return BASE_CONFIDENCE[signalType] ?? 0.7;
}

export function calculateConfidenceLevel(
  dataPoints: number,
): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (dataPoints < 10) {
    return 'LOW';
  }
  if (dataPoints < HIGH_CONFIDENCE_THRESHOLD_DATA_POINTS) {
    return 'MEDIUM';
  }
  return 'HIGH';
}

export function aggregateSignals(signals: BehaviorSignal[]): BehaviorSignal[] {
  const grouped = new Map<SignalType, BehaviorSignal>();
  for (const signal of signals) {
    const existing = grouped.get(signal.signalType);
    if (!existing || signal.timestamp > existing.timestamp) {
      grouped.set(signal.signalType, signal);
    }
  }
  return Array.from(grouped.values());
}

export function determineUserState(
  _userId: string,
  profile: BehaviorProfile | null,
): CoachUserState {
  if (!profile || profile.coldStart) {
    return 'COLD_START';
  }
  if (profile.confidenceLevel === 'LOW') {
    return 'LOW_CONFIDENCE';
  }
  return 'HIGH_CONFIDENCE';
}
