import type { Streak } from "../schemas";

/** Default base for building mock Streak objects in tests. */
export const BASE_MOCK_STREAK: Streak = {
  id: "streak-1",
  userId: "user-1",
  currentDays: 5,
  longestDays: 10,
  lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000,
  currentDayCompletedAt: null,
  frozenUntil: null,
  shieldsAvailable: 2,
  gracePeriodUsed: false,
  timezone: "UTC",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/** Merge partial overrides onto BASE_MOCK_STREAK for test cases. */
export function mockStreak(overrides: Partial<Streak> = {}): Streak {
  return { ...BASE_MOCK_STREAK, ...overrides };
}
