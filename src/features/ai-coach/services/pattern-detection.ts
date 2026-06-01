import type { BehaviorProfile } from '../schemas';
import type { DetectedPattern } from './behavior-analytics-types';

export function detectPatterns(profile: BehaviorProfile): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  if (!profile || profile.coldStart) {
    return patterns;
  }
  const signals = new Map(profile.signals.map((s) => [s.signalType, s]));
  const morningSignal = signals.get('MORNING_PERSON');
  const nightSignal = signals.get('NIGHT_OWL');
  if (
    morningSignal &&
    morningSignal.value > 0.7 &&
    morningSignal.confidence > 0.6
  ) {
    if (!nightSignal || morningSignal.value > nightSignal.value) {
      patterns.push({
        patternType: 'CHRONOTYPE',
        description: 'Consistent morning performer',
        confidence: morningSignal.confidence,
        evidence: [
          'High morning session frequency',
          'Better quality scores before noon',
        ],
        recommendation: 'Schedule important focus sessions in the morning',
      });
    }
  }
  if (nightSignal && nightSignal.value > 0.7 && nightSignal.confidence > 0.6) {
    if (!morningSignal || nightSignal.value > morningSignal.value) {
      patterns.push({
        patternType: 'CHRONOTYPE',
        description: 'Evening focus champion',
        confidence: nightSignal.confidence,
        evidence: [
          'Higher evening session completion',
          'Better focus quality after 6pm',
        ],
        recommendation: 'Plan deep work sessions for evening hours',
      });
    }
  }
  const streakSignal = signals.get('STREAK_MAINTENANCE_RATE');
  if (streakSignal && streakSignal.value > 0.8) {
    patterns.push({
      patternType: 'CONSISTENCY',
      description: 'Elite streak maintainer',
      confidence: streakSignal.confidence,
      evidence: ['High streak completion rate', 'Regular daily sessions'],
      recommendation:
        'Keep your momentum! Your consistency is building compound benefits.',
    });
  }
  const challengeSignal = signals.get('CHALLENGE_COMPLETION_RATE');
  if (challengeSignal && challengeSignal.value > 0.75) {
    patterns.push({
      patternType: 'ENGAGEMENT',
      description: 'Challenge-driven achiever',
      confidence: challengeSignal.confidence,
      evidence: [
        'High challenge completion rate',
        'Engagement with difficult tasks',
      ],
      recommendation: 'Continue accepting challenges to accelerate progress',
    });
  }
  const weekendSignal = signals.get('WEEKEND_WARRIOR');
  if (weekendSignal && weekendSignal.value > 0.6) {
    patterns.push({
      patternType: 'SCHEDULING',
      description: 'Weekend focus specialist',
      confidence: weekendSignal.confidence,
      evidence: [
        'Higher session frequency on weekends',
        'Longer weekend sessions',
      ],
      recommendation: 'Use weekends for extended deep work sessions',
    });
  }
  const reminderSignal = signals.get('RESPONSIVENESS_TO_REMINDERS');
  if (reminderSignal && reminderSignal.value > 0.6) {
    patterns.push({
      patternType: 'INTERACTION',
      description: 'Reminder-responsive user',
      confidence: reminderSignal.confidence,
      evidence: [
        'Higher session start rate after reminders',
        'Engagement with coach messages',
      ],
      recommendation:
        'Reminders are effective for you - enable smart notifications',
    });
  }
  return patterns;
}
