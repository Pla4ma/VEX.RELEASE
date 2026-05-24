import { describe, expect, it } from '@jest/globals';
import {
  CoachInputContractSchema,
  createFallbackInsight,
  createMockCoachInput,
  FORBIDDEN_DATA_FIELDS,
} from '../input-contract';

function testUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    return (char === 'x' ? value : 8 + (value % 4)).toString(16);
  });
}

describe('Coach input fallback and boundaries', () => {
  it('handles empty, sparse, sufficient, and streak-only fallback data', () => {
    expect(createFallbackInsight({}).canCoach).toBe(false);

    const sparse = createFallbackInsight({
      recentSessionGrades: [{
        sessionId: 'session-1',
        grade: 80,
        duration: 1500,
        completedAt: Date.now(),
        difficulty: 'NORMAL',
      }],
    });
    expect(sparse.canCoach).toBe(true);
    expect(sparse.reason).toContain('Limited data');

    expect(createFallbackInsight(createMockCoachInput()).fallbackMessage).toBeUndefined();
    expect(createFallbackInsight({
      streakState: {
        currentStreak: 3,
        streakAtRisk: true,
        hoursSinceLastSession: 20,
        streakRecord: 5,
        missedDays: 1,
      },
    }).canCoach).toBe(true);
  });

  it('creates mock input with overrides and realistic time context', () => {
    const customInput = createMockCoachInput({
      streakState: {
        currentStreak: 10,
        streakAtRisk: false,
        hoursSinceLastSession: 5,
        streakRecord: 15,
        missedDays: 0,
      },
      premiumStatus: {
        isActive: true,
        tier: 'premium',
        features: ['ai_coach', 'advanced_analytics'],
      },
    });

    expect(customInput.streakState.currentStreak).toBe(10);
    expect(customInput.premiumStatus.tier).toBe('premium');
    expect(customInput.timeContext.currentHour).toBeLessThanOrEqual(23);
  });

  it('handles maximum and minimum allowed values', () => {
    const now = Date.now();
    const maxInput = createMockCoachInput({
      recentSessionGrades: Array.from({ length: 10 }, (_, i) => ({
        sessionId: testUuid(),
        grade: 100,
        duration: 7200,
        completedAt: Math.floor(now - i * 86400000),
        difficulty: 'PUSH',
      })),
      preferredSessionLengths: Array.from({ length: 5 }, () => 7200),
      completionTimes: [23, 22, 21, 20, 19, 18, 17],
      streakState: {
        currentStreak: 1000,
        streakAtRisk: false,
        hoursSinceLastSession: 0,
        streakRecord: 1000,
        missedDays: 0,
      },
    });

    const minInput = createMockCoachInput({
      recentSessionGrades: [{
        sessionId: testUuid(),
        grade: 0,
        duration: 60,
        completedAt: now,
        difficulty: 'EASY',
      }],
      preferredSessionLengths: [60],
      completionTimes: [0],
      notificationPreferences: {
        enabled: false,
        quietHoursStart: 0,
        quietHoursEnd: 0,
        maxPerDay: 0,
      },
    });

    expect(() => CoachInputContractSchema.parse(maxInput)).not.toThrow();
    expect(() => CoachInputContractSchema.parse(minInput)).not.toThrow();
  });

  it('contains all required forbidden fields', () => {
    expect(FORBIDDEN_DATA_FIELDS).toEqual(expect.arrayContaining([
      'rawPrivateNotes',
      'secrets',
      'apiKeys',
      'passwords',
      'emailAddresses',
      'phoneNumbers',
      'realNames',
      'locationData',
      'unvalidatedStorageData',
      'rawUserInput',
      'piifield',
    ]));
  });
});
