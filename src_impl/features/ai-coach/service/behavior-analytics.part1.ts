import { type BehaviorSignal, type BehaviorProfile, type SignalType, BehaviorProfileSchema, BehaviorSignalSchema } from "../schemas";
import * as repository from "../repository";
import { withRetry } from "../utils/retry";


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