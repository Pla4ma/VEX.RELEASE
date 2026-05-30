/**
 * Streaks Comprehensive Tests — Comeback
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect, jest } from "@jest/globals";

import type { Streak } from "../schemas";

import {
  calculateRiskLevel,
  calculateNextDeadline,
} from "../service-comeback";

// ============================================================================
// Mocks
// ============================================================================
const mockRepository = {
  fetchStreak: jest.fn<() => Promise<Streak | null>>(),
  createStreak: jest.fn<() => Promise<Streak>>(),
  updateStreak: jest.fn<() => Promise<Streak>>(),
  recordShieldEarned: jest.fn<() => Promise<void>>(),
  recordShieldUsed: jest.fn<() => Promise<void>>(),
  getAvailableShield: jest.fn<() => Promise<string | null>>(),
  fetchActiveRepairQuest: jest.fn(),
  saveRepairQuest: jest.fn(),
  updateRepairQuest: jest.fn(),
  fetchExpiredRepairQuests: jest.fn(),
  fetchUsersWithActiveStreaks: jest.fn(),
};

jest.mock("../repository", () => mockRepository);

jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
  },
}));

jest.mock("../../../utils/uuid", () => ({
  v4: () => "mock-uuid-" + Math.random().toString(36).slice(2, 8),
}));

jest.mock("../restore-quest", () => ({
  hasUsedStreakRestoreThisMonth: jest.fn<() => Promise<boolean>>().mockResolvedValue(false),
}));

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: { code: "PGRST116" } })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          gt: jest.fn(() => Promise.resolve({ data: [], error: null })),
          lt: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ error: null })),
  })),
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

// ============================================================================
// Fixtures
// ============================================================================
const BASE_MOCK_STREAK: Streak = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  userId: "550e8400-e29b-41d4-a716-446655440001",
  currentDays: 5,
  longestDays: 10,
  lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000,
  currentDayCompletedAt: null,
  frozenUntil: null,
  shieldsAvailable: 2,
  gracePeriodUsed: false,
  timezone: "UTC",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function mockStreak(overrides: Partial<Streak> = {}): Streak {
  return { ...BASE_MOCK_STREAK, ...overrides };
}

describe("calculateRiskLevel", () => {
  it("returns NONE for 0 current days", () => {
    expect(calculateRiskLevel(mockStreak({ currentDays: 0 }))).toBe("NONE");
  });

  it("returns NONE when frozen", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      frozenUntil: Date.now() + 100000,
    }))).toBe("NONE");
  });

  it("returns LOW for no last session", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: null,
    }))).toBe("LOW");
  });

  it("returns NONE for recent session (< 18h)", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 10 * 60 * 60 * 1000,
    }))).toBe("NONE");
  });

  it("returns LOW for 18-22h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000,
    }))).toBe("LOW");
  });

  it("returns MEDIUM for 22-30h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 25 * 60 * 60 * 1000,
    }))).toBe("MEDIUM");
  });

  it("returns HIGH for 30-40h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 35 * 60 * 60 * 1000,
    }))).toBe("HIGH");
  });

  it("returns CRITICAL for >40h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 41 * 60 * 60 * 1000,
    }))).toBe("CRITICAL");
  });
});

// ============================================================================
// calculateNextDeadline
// ============================================================================
describe("calculateNextDeadline", () => {
  it("returns null for 0 current days", () => {
    expect(calculateNextDeadline(mockStreak({ currentDays: 0 }))).toBeNull();
  });

  it("returns null for no last session", () => {
    expect(calculateNextDeadline(mockStreak({ lastQualifyingSessionAt: null }))).toBeNull();
  });

  it("returns 24h after last session", () => {
    const lastSession = Date.now() - 5 * 60 * 60 * 1000;
    const deadline = calculateNextDeadline(mockStreak({ lastQualifyingSessionAt: lastSession }));
    expect(deadline).toBe(lastSession + 24 * 60 * 60 * 1000);
  });
});

