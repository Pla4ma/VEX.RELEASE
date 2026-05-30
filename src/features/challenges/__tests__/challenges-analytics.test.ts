/**
 * Tests for Challenges — Analytics (Metrics + Health)
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock("../repository");
jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(), lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(), or: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(), update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  })),
}));

// ─── Imports under test ─────────────────────────────────────────────────────

import {
  calculateChallengeMetrics,
  calculateDifficultyMetrics,
} from "../analytics/metrics";
import { checkChallengesHealth } from "../analytics/health";
import { ChallengeSchema, UserChallengeSchema } from "../schemas";

const NOW = Date.now();

function makeChallenge(overrides: Record<string, unknown> = {}) {
  return ChallengeSchema.parse({
    id: "c-1", seasonId: "season-1", type: "DAILY", category: "SESSIONS",
    title: "Test Challenge", description: "Do the thing", targetValue: 5,
    targetType: "SESSIONS", rewardType: "XP", rewardAmount: 100, ...overrides,
  });
}

function makeUserChallenge(overrides: Record<string, unknown> = {}) {
  return UserChallengeSchema.parse({
    id: "uc-1", userId: "user-1", challengeId: "c-1",
    currentValue: 0, status: "ACTIVE", assignedAt: NOW - 10000, ...overrides,
  });
}

describe("Analytics — Metrics", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("calculateChallengeMetrics", () => {
    it("returns zeros for empty input", () => {
      const result = calculateChallengeMetrics([], []);
      expect(result.totalIssued).toBe(0);
      expect(result.completionRate).toBe(0);
      expect(result.claimRate).toBe(0);
      expect(result.rerollRate).toBe(0);
      expect(result.expirationRate).toBe(0);
    });

    it("calculates completion rate correctly", () => {
      const ucs = [
        makeUserChallenge({ id: "uc1", status: "COMPLETED", completedAt: NOW, assignedAt: NOW - 5000 }),
        makeUserChallenge({ id: "uc2", status: "ACTIVE" }),
        makeUserChallenge({ id: "uc3", status: "CLAIMED", completedAt: NOW, assignedAt: NOW - 3000, claimedAt: NOW }),
      ];
      const challenges = [makeChallenge({ id: "c-1" })];
      const result = calculateChallengeMetrics(ucs as any, challenges as any);
      expect(result.totalIssued).toBe(3);
      expect(result.completionRate).toBeCloseTo(2 / 3, 2);
    });

    it("calculates expiration rate", () => {
      const ucs = [
        makeUserChallenge({ id: "uc1", status: "EXPIRED" }),
        makeUserChallenge({ id: "uc2", status: "ACTIVE" }),
      ];
      const result = calculateChallengeMetrics(ucs as any, []);
      expect(result.expirationRate).toBeCloseTo(0.5, 2);
    });

    it("calculates reroll rate", () => {
      const ucs = [
        makeUserChallenge({ id: "uc1", rerollCount: 1 }),
        makeUserChallenge({ id: "uc2", rerollCount: 0 }),
        makeUserChallenge({ id: "uc3", rerollCount: 0 }),
      ];
      const result = calculateChallengeMetrics(ucs as any, []);
      expect(result.rerollRate).toBeCloseTo(1 / 3, 2);
    });
  });

  describe("calculateDifficultyMetrics", () => {
    it("returns zero rates for empty data", () => {
      const result = calculateDifficultyMetrics([], []);
      expect(result.easy.completionRate).toBe(0);
      expect(result.medium.completionRate).toBe(0);
      expect(result.hard.completionRate).toBe(0);
    });

    it("groups challenges by difficulty", () => {
      const challenges = [
        makeChallenge({ id: "c-easy", difficulty: "EASY" }),
        makeChallenge({ id: "c-medium", difficulty: "MEDIUM" }),
        makeChallenge({ id: "c-hard", difficulty: "HARD" }),
      ];
      const ucs = [
        makeUserChallenge({ id: "uc1", challengeId: "c-easy", status: "COMPLETED", completedAt: NOW, assignedAt: NOW - 1000 }),
        makeUserChallenge({ id: "uc2", challengeId: "c-medium", status: "ACTIVE" }),
        makeUserChallenge({ id: "uc3", challengeId: "c-hard", status: "ACTIVE" }),
      ];
      const result = calculateDifficultyMetrics(ucs as any, challenges as any);
      expect(result.easy.completionRate).toBe(1);
      expect(result.medium.completionRate).toBe(0);
      expect(result.hard.completionRate).toBe(0);
    });
  });
});

describe("Analytics — Health", () => {
  it("returns healthy status by default", async () => {
    const result = await checkChallengesHealth();
    expect(result.status).toBe("healthy");
    expect(result.issues).toEqual([]);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.activeChallenges).toBe(0);
  });
});
