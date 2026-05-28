import { jest } from "@jest/globals";
import type { Streak } from "../schemas";

export const mockRepository = {
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
  fetchActiveRepairQuest: jest.fn(),
  saveRepairQuest: jest.fn(),
  updateRepairQuest: jest.fn(),
  fetchExpiredRepairQuests: jest.fn(),
  fetchUsersWithActiveStreaks: jest.fn(),
};

jest.mock("../repository", () => mockRepository);

export const mockStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: "streak-1",
  userId: "user-1",
  currentDays: 5,
  longestDays: 10,
  lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000,
  currentDayCompletedAt: Date.now() - 12 * 60 * 60 * 1000,
  frozenUntil: null,
  shieldsAvailable: 1,
  gracePeriodUsed: false,
  timezone: "America/New_York",
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
  ...overrides,
});
