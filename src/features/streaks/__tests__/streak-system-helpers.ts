import { jest } from '@jest/globals';
import type { Streak } from '../schemas';

export const mockRepository = {
  fetchStreak: jest.fn<() => Promise<Streak | null>>(),
  createStreak: jest.fn<() => Promise<Streak>>(),
  updateStreak: jest.fn<() => Promise<Streak>>(),
  recordShieldEarned: jest.fn<() => Promise<void>>(),
  recordShieldUsed: jest.fn<() => Promise<void>>(),
  getAvailableShield: jest.fn<() => Promise<Streak | null>>(),
  fetchActiveRepairQuest: jest.fn<() => Promise<unknown>>(),
  saveRepairQuest: jest.fn<() => Promise<void>>(),
  updateRepairQuest: jest.fn<() => Promise<void>>(),
  fetchExpiredRepairQuests: jest.fn<() => Promise<unknown[]>>(),
  fetchUsersWithActiveStreaks: jest.fn<() => Promise<unknown[]>>(),
};

jest.mock('../repository', () => mockRepository);

export const mockStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: 'streak-1',
  userId: 'user-1',
  currentDays: 5,
  longestDays: 10,
  lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000,
  currentDayCompletedAt: Date.now() - 12 * 60 * 60 * 1000,
  frozenUntil: null,
  shieldsAvailable: 1,
  gracePeriodUsed: false,
  timezone: 'America/New_York',
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
  ...overrides,
});
