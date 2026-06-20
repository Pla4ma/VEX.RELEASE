import { Streak } from '../schemas';

export function mockStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    id: 'test-streak-id',
    userId: 'test-user-id',
    currentDays: 0,
    longestDays: 0,
    lastQualifyingSessionAt: null,
    currentDayCompletedAt: null,
    frozenUntil: null,
    shieldsAvailable: 0,
    gracePeriodUsed: false,
    timezone: 'UTC',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}
