/**
 * Mastery Feature — MasteryService Tests
 */

import { MasteryService } from "../service";

// ─── Mocks (needed because service imports mastery-helpers & repository) ───
jest.mock("../repository", () => ({
  loadStoredMasteryState: jest.fn().mockReturnValue(null),
  loadMasteryState: jest.fn().mockResolvedValue(null),
  persistMasteryState: jest.fn((state: Record<string, unknown>) => ({ ...state, updatedAt: Date.now() })),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getDefaultStorageAdapter: () => ({
    getJSONSync: jest.fn().mockReturnValue(null),
    setJSONSync: jest.fn(),
  }),
}));

jest.mock("../../../persistence/MMKVStorage", () => ({
  getMMKVStorage: () => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("../../../config/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock("../challenge-generator", () => ({
  generateMasteryChallenges: jest.fn().mockReturnValue([
    {
      id: "test-challenge-1",
      technique: "durationMastery",
      title: "Test Challenge",
      description: "A test challenge",
      difficulty: "EASY",
      target: 10,
      current: 0,
      unit: "sessions",
      masteryPoints: 3,
      status: "ACTIVE",
      completedAt: null,
    },
    {
      id: "test-challenge-2",
      technique: "purityMastery",
      title: "Test Challenge 2",
      description: "Another test challenge",
      difficulty: "MEDIUM",
      target: 5,
      current: 0,
      unit: "sessions",
      masteryPoints: 5,
      status: "ACTIVE",
      completedAt: null,
    },
    {
      id: "test-challenge-3",
      technique: "consistencyMastery",
      title: "Test Challenge 3",
      description: "Third test challenge",
      difficulty: "EASY",
      target: 3,
      current: 0,
      unit: "days",
      masteryPoints: 3,
      status: "ACTIVE",
      completedAt: null,
    },
  ]),
}));

describe("MasteryService", () => {
  describe("getOrCreateMasteryState", () => {
    it("returns a valid state for new user", () => {
      const state = MasteryService.getOrCreateMasteryState("user-new");
      expect(state.userId).toBe("user-new");
      expect(state.rank).toBe("APPRENTICE");
      expect(state.activeChallenges).toHaveLength(3);
    });
  });

  describe("applySessionXp", () => {
    it("applies XP gains and returns updated state", () => {
      const result = MasteryService.applySessionXp("user-xp", {
        durationMastery: 2,
        purityMastery: 1,
        consistencyMastery: 1,
        comebackMastery: 0,
        bossMastery: 0,
      });
      expect(result.pointsGained).toBeGreaterThanOrEqual(0);
      expect(result.updatedState).toBeDefined();
    });

    it("caps technique values at 25", () => {
      const result = MasteryService.applySessionXp("user-cap", {
        durationMastery: 100,
        purityMastery: 100,
        consistencyMastery: 100,
        comebackMastery: 100,
        bossMastery: 100,
      });
      expect(result.updatedState.techniques.durationMastery).toBeLessThanOrEqual(25);
      expect(result.updatedState.techniques.purityMastery).toBeLessThanOrEqual(25);
      expect(result.updatedState.techniques.bossMastery).toBeLessThanOrEqual(25);
    });

    it("returns updated state with correct rank", () => {
      const result = MasteryService.applySessionXp("user-rank", {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 5,
        bossMastery: 5,
      });
      expect(result.updatedState.rank).toBeDefined();
      expect(typeof result.updatedState.totalMasteryPoints).toBe("number");
    });
  });

  describe("claimChallenge", () => {
    it("returns false for non-existent challenge", () => {
      expect(
        MasteryService.claimChallenge("user-claim", "non-existent-id"),
      ).toBe(false);
    });
  });

  describe("refreshChallenges", () => {
    it("returns state with refreshed challenges", () => {
      const state = MasteryService.refreshChallenges("user-refresh");
      expect(state.activeChallenges).toHaveLength(3);
    });
  });
});
