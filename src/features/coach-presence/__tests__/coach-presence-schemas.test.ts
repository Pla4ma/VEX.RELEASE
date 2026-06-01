/**
 * Coach Presence — Schema Validation Tests
 */

import {
  CoachPresenceMotivationStyleSchema,
  CoachActionIntentSchema,
  CoachPresenceSurfaceSchema,
  CoachPresenceToneSchema,
  CoachPresenceVisualStateSchema,
  CoachPresenceMemorySummarySchema,
  CoachPresenceActionSchema,
  CoachPresenceSchema,
  CoachPresenceProgressInputSchema,
  CompletionPresenceSummarySchema,
  CoachVisibilitySurfaceSchema,
  CoachVisibilityDecisionSchema,
} from '../schemas';

describe('coach-presence schemas', () => {
  test('CoachPresenceMotivationStyleSchema accepts all valid styles', () => {
    for (const style of ['CALM', 'FRIENDLY', 'STUDY_FOCUSED', 'GAME_LIKE', 'COACH_LED', 'INTENSE']) {
      expect(() => CoachPresenceMotivationStyleSchema.parse(style)).not.toThrow();
    }
    expect(() => CoachPresenceMotivationStyleSchema.parse('INVALID')).toThrow();
  });

  test('CoachActionIntentSchema accepts all valid intents', () => {
    for (const intent of ['START_SESSION', 'START_STUDY_SESSION', 'REVIEW_PROGRESS', 'TAKE_BREAK', 'CONTINUE_PLAN', 'REFLECT']) {
      expect(() => CoachActionIntentSchema.parse(intent)).not.toThrow();
    }
  });

  test('CoachPresenceSurfaceSchema accepts all valid surfaces', () => {
    for (const surface of ['HOME', 'SESSION_SETUP', 'SESSION_COMPLETION', 'CHAT', 'RESCUE', 'PREMIUM']) {
      expect(() => CoachPresenceSurfaceSchema.parse(surface)).not.toThrow();
    }
  });

  test('CoachPresenceToneSchema validates complete tone', () => {
    const valid = { motivationStyle: 'CALM', personality: 'steady', intensity: 'low' };
    expect(() => CoachPresenceToneSchema.parse(valid)).not.toThrow();
  });

  test('CoachPresenceToneSchema rejects extra fields', () => {
    const invalid = { motivationStyle: 'CALM', personality: 'steady', intensity: 'low', extra: true };
    expect(() => CoachPresenceToneSchema.parse(invalid)).toThrow();
  });

  test('CoachPresenceVisualStateSchema validates correctly', () => {
    const valid = { element: 'LUMINA', level: 1, mood: 'FOCUSED', phase: 'YOUNG', reaction: 'steady' };
    expect(() => CoachPresenceVisualStateSchema.parse(valid)).not.toThrow();
  });

  test('CoachPresenceMemorySummarySchema validates and defaults syncAvailable', () => {
    const parsed = CoachPresenceMemorySummarySchema.parse({
      coachMemoryCount: 0,
      companionMemoryCount: 0,
      latestMemory: null,
    });
    expect(parsed.syncAvailable).toBe(true);
  });

  test('CoachPresenceActionSchema validates intent, label, reason', () => {
    const valid = { intent: 'START_SESSION', label: 'Start focus', reason: 'Ready to go.' };
    expect(() => CoachPresenceActionSchema.parse(valid)).not.toThrow();
  });

  test('CoachPresenceProgressInputSchema validates min values', () => {
    const valid = { currentStreakDays: 0, highFocusStreak: 0, totalSessions: 0 };
    expect(() => CoachPresenceProgressInputSchema.parse(valid)).not.toThrow();
  });

  test('CompletionPresenceSummarySchema validates all fields', () => {
    const valid = {
      durationMinutes: 30,
      focusPurityScore: 85,
      isComeback: false,
      isFirstSession: true,
      isHighFocusStreak: false,
      isLowEnergyDay: false,
      isStreakRecovery: false,
      sessionMode: 'FOCUS',
      streakDays: 1,
    };
    expect(() => CompletionPresenceSummarySchema.parse(valid)).not.toThrow();
  });

  test('CoachVisibilitySurfaceSchema accepts all valid surfaces', () => {
    for (const surface of ['ONBOARDING', 'DAY_0_HOME', 'SESSION_SETUP', 'ACTIVE_SESSION', 'COMPLETION', 'RESCUE', 'PREMIUM', 'RETURN_HOME']) {
      expect(() => CoachVisibilitySurfaceSchema.parse(surface)).not.toThrow();
    }
  });

  test('CoachVisibilityDecisionSchema accepts all valid decisions', () => {
    for (const decision of ['VISIBLE', 'HIDDEN', 'SUBTLE_ONE_LINE', 'AVAILABLE_ON_REQUEST']) {
      expect(() => CoachVisibilityDecisionSchema.parse(decision)).not.toThrow();
    }
  });
});
