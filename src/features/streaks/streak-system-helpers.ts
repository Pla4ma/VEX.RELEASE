import { jest } from '@jest/globals';
import type { Streak } from './schemas';

export const mockRepository = {
  fetchStreak: jest.fn<() => Promise<Streak | null>>(),
  updateStreak: jest.fn<(streak: Streak) => Promise<Streak>>(),
  createStreak: jest.fn<(streak: Streak) => Promise<Streak>>(),
  getAvailableShield: jest.fn<() => Promise<string | null>>(),
  recordShieldEarned: jest.fn<(userId: string) => Promise<void>>(),
  recordShieldUsed: jest.fn<(userId: string, shieldId: string) => Promise<void>>(),
  fetchActiveRepairQuest: jest.fn<() => Promise<unknown>>(),
  saveRepairQuest: jest.fn<(quest: unknown) => Promise<void>>(),
  updateRepairQuest: jest.fn<(quest: unknown) => Promise<void>>(),
};

export const mockStreak = (overrides: Partial<Streak> = {}): Streak => ({
  userId: 'user-1',
  id: 'streak-1',
  timezone: 'UTC',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  currentDays: 1,
  longestDays: 1,
  lastQualifyingSessionAt: Date.now(),
  currentDayCompletedAt: null,
  frozenUntil: null,
  shieldsAvailable: 0,
  gracePeriodUsed: false,
  ...overrides,
});
