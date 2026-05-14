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

/**
 * Process a new behavior signal
 * Real domain logic with weighting, decay, and confidence calculation
 */
export async function processBehaviorSignal(userId: string, signalType: SignalType, value: number, metadata: Record<string, unknown> = {}): Promise<BehaviorProfile> {
  // Create signal record
  const signal: BehaviorSignal = {
    id: generateSignalId(),
    userId,
    signalType,
    value,
    confidence: calculateSignalConfidence(signalType, value, metadata),
    timestamp: Date.now(),
    metadata,
    expiresAt: calculateExpiration(signalType),
  };

  // Validate signal
  const validatedSignal = BehaviorSignalSchema.parse(signal);

  // Persist signal
  await withRetry(() => repository.addBehaviorSignal(validatedSignal), { maxAttempts: 3 }, 'add-behavior-signal');

  // Rebuild profile with new signal
  const profile = await rebuildBehaviorProfile(userId);

  return profile;
}

/**
 * Rebuild behavior profile from all signals
 */
export async function rebuildBehaviorProfile(userId: string): Promise<BehaviorProfile> {
  // Fetch recent signals
  const signals = await withRetry(() => repository.fetchRecentBehaviorSignals(userId, 100), { maxAttempts: 3 }, 'fetch-behavior-signals');

  // Apply decay and weight signals
  const weightedSignals = applyDecayAndWeight(signals);

  // Aggregate by type
  const aggregatedSignals = aggregateSignals(weightedSignals);

  // Calculate confidence
  const dataPoints = signals.length;
  const confidenceLevel = calculateConfidenceLevel(dataPoints, aggregatedSignals);

  // Build profile
  const profile: BehaviorProfile = {
    userId,
    signals: aggregatedSignals,
    lastUpdated: Date.now(),
    confidenceLevel,
    coldStart: dataPoints < DEFAULT_SIGNAL_CONFIG.coldStartThreshold,
    dataPoints,
  };

  // Persist profile
  const validatedProfile = BehaviorProfileSchema.parse(profile);
  await withRetry(() => repository.upsertBehaviorProfile(validatedProfile), { maxAttempts: 3 }, 'upsert-behavior-profile');

  return validatedProfile;
}

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

export interface DetectedPattern {
  patternType: string;
  description: string;
  confidence: number;
  evidence: string[];
  recommendation?: string;
}

/**
 * Detect behavioral patterns from signals
 */
export function detectPatterns(profile: BehaviorProfile): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (!profile || profile.coldStart) {
    return patterns;
  }

  const signals = new Map(profile.signals.map((s) => [s.signalType, s]));

  // Pattern: Consistent Morning Person
  const morningSignal = signals.get('MORNING_PERSON');
  const nightSignal = signals.get('NIGHT_OWL');

  if (morningSignal && morningSignal.value > 0.7 && morningSignal.confidence > 0.6) {
    if (!nightSignal || morningSignal.value > nightSignal.value) {
      patterns.push({
        patternType: 'CHRONOTYPE',
        description: 'Consistent morning performer',
        confidence: morningSignal.confidence,
        evidence: ['High morning session frequency', 'Better quality scores before noon'],
        recommendation: 'Schedule important focus sessions in the morning',
      });
    }
  }

  // Pattern: Night Owl
  if (nightSignal && nightSignal.value > 0.7 && nightSignal.confidence > 0.6) {
    if (!morningSignal || nightSignal.value > morningSignal.value) {
      patterns.push({
        patternType: 'CHRONOTYPE',
        description: 'Evening focus champion',
        confidence: nightSignal.confidence,
        evidence: ['Higher evening session completion', 'Better focus quality after 6pm'],
        recommendation: 'Plan deep work sessions for evening hours',
      });
    }
  }

  // Pattern: Streak Maintainer
  const streakSignal = signals.get('STREAK_MAINTENANCE_RATE');
  if (streakSignal && streakSignal.value > 0.8) {
    patterns.push({
      patternType: 'CONSISTENCY',
      description: 'Elite streak maintainer',
      confidence: streakSignal.confidence,
      evidence: ['High streak completion rate', 'Regular daily sessions'],
      recommendation: 'Keep your momentum! Your consistency is building compound benefits.',
    });
  }

  // Pattern: Challenge Seeker
  const challengeSignal = signals.get('CHALLENGE_COMPLETION_RATE');
  if (challengeSignal && challengeSignal.value > 0.75) {
    patterns.push({
      patternType: 'ENGAGEMENT',
      description: 'Challenge-driven achiever',
      confidence: challengeSignal.confidence,
      evidence: ['High challenge completion rate', 'Engagement with difficult tasks'],
      recommendation: 'Continue accepting challenges to accelerate progress',
    });
  }

  // Pattern: Weekend Warrior
  const weekendSignal = signals.get('WEEKEND_WARRIOR');
  if (weekendSignal && weekendSignal.value > 0.6) {
    patterns.push({
      patternType: 'SCHEDULING',
      description: 'Weekend focus specialist',
      confidence: weekendSignal.confidence,
      evidence: ['Higher session frequency on weekends', 'Longer weekend sessions'],
      recommendation: 'Use weekends for extended deep work sessions',
    });
  }

  // Pattern: Responsive to Reminders
  const reminderSignal = signals.get('RESPONSIVENESS_TO_REMINDERS');
  if (reminderSignal && reminderSignal.value > 0.6) {
    patterns.push({
      patternType: 'INTERACTION',
      description: 'Reminder-responsive user',
      confidence: reminderSignal.confidence,
      evidence: ['Higher session start rate after reminders', 'Engagement with coach messages'],
      recommendation: 'Reminders are effective for you - enable smart notifications',
    });
  }

  return patterns;
}

// ============================================================================
// Utilities
// ============================================================================

function generateSignalId(): string {
  return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Analytics Export
// ============================================================================

export interface BehaviorAnalytics {
  userId: string;
  timestamp: number;
  signalsCount: number;
  patternsDetected: number;
  confidenceLevel: string;
  dominantChronotype?: 'morning' | 'evening' | 'variable';
  consistencyScore: number;
  engagementScore: number;
}

export function generateBehaviorAnalytics(profile: BehaviorProfile): BehaviorAnalytics {
  const patterns = detectPatterns(profile);

  // Determine dominant chronotype
  const morningSignal = profile.signals.find((s) => s.signalType === 'MORNING_PERSON');
  const nightSignal = profile.signals.find((s) => s.signalType === 'NIGHT_OWL');

  let dominantChronotype: 'morning' | 'evening' | 'variable' | undefined;
  if (morningSignal && nightSignal) {
    if (morningSignal.value > nightSignal.value + 0.2) {
      dominantChronotype = 'morning';
    } else if (nightSignal.value > morningSignal.value + 0.2) {
      dominantChronotype = 'evening';
    } else {
      dominantChronotype = 'variable';
    }
  }

  // Calculate consistency score
  const consistencySignal = profile.signals.find((s) => s.signalType === 'CONSISTENCY_SCORE');
  const consistencyScore = consistencySignal?.value || 0.5;

  // Calculate engagement score (average of engagement signals)
  const engagementSignals = profile.signals.filter((s) => ['CHALLENGE_COMPLETION_RATE', 'BOSS_PARTICIPATION', 'SOCIAL_ENGAGEMENT'].includes(s.signalType));
  const engagementScore = engagementSignals.length > 0 ? engagementSignals.reduce((sum, s) => sum + s.value, 0) / engagementSignals.length : 0.5;

  return {
    userId: profile.userId,
    timestamp: Date.now(),
    signalsCount: profile.signals.length,
    patternsDetected: patterns.length,
    confidenceLevel: profile.confidenceLevel,
    dominantChronotype,
    consistencyScore,
    engagementScore,
  };
}
