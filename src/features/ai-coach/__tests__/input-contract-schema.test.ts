import { describe, expect, it } from '@jest/globals';
import {
  CoachInputContractSchema,
  containsForbiddenPII,
  validateCoachInput,
} from '../input-contract';
import { createMockCoachInput } from './input-contract-test-utils';

describe('Coach input contract schema', () => {
  it('accepts valid coach input', () => {
    expect(() =>
      CoachInputContractSchema.parse(createMockCoachInput()),
    ).not.toThrow();
  });

  it('rejects excessive session grades', () => {
    const invalidInput = createMockCoachInput({
      recentSessionGrades: Array.from({ length: 11 }, (_, i) => ({
        sessionId: `session-${i}`,
        grade: 80,
        duration: 1500,
        completedAt: Date.now() - i * 86400000,
        difficulty: 'NORMAL',
      })),
    });

    expect(() => CoachInputContractSchema.parse(invalidInput)).toThrow();
  });

  it('rejects invalid grade, streak, and hour values', () => {
    expect(() =>
      CoachInputContractSchema.parse(
        createMockCoachInput({
          recentSessionGrades: [
            {
              sessionId: 'session-1',
              grade: 150,
              duration: 1500,
              completedAt: Date.now(),
              difficulty: 'NORMAL',
            },
          ],
        }),
      ),
    ).toThrow();

    expect(() =>
      CoachInputContractSchema.parse(
        createMockCoachInput({
          streakState: {
            currentStreak: -5,
            streakAtRisk: true,
            hoursSinceLastSession: 18,
            streakRecord: 12,
            missedDays: 0,
          },
        }),
      ),
    ).toThrow();

    expect(() =>
      CoachInputContractSchema.parse(
        createMockCoachInput({
          completionTimes: [25, 30, 35],
        }),
      ),
    ).toThrow();
  });

  it('validates and sanitizes proper input', () => {
    const result = validateCoachInput(
      createMockCoachInput({
        timeContext: {
          currentHour: 14,
          dayOfWeek: 3,
          isWeekend: false,
          localTimezone: 'Invalid-Timezone-123',
        },
      }),
    );

    expect(result.timeContext.localTimezone).toBe('UTC');
  });

  it('detects forbidden PII fields', () => {
    expect(
      containsForbiddenPII({
        ...createMockCoachInput(),
        rawPrivateNotes: 'user secret data',
        emailAddresses: ['user@example.com'],
      }),
    ).toBe(true);
    expect(containsForbiddenPII(createMockCoachInput())).toBe(false);
  });
});
