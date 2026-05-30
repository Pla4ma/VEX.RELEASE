// Deep Session-Start Tests – adaptiveDifficulty
// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));
jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      upsert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));
jest.mock("../../boss/repository", () => ({
  fetchBossTemplate: jest.fn(() => Promise.resolve(null)),
  fetchActiveEncounter: jest.fn(() => Promise.resolve(null)),
}));
jest.mock("../../challenges/repository", () => ({
  fetchActiveChallengeDetails: jest.fn(() => Promise.resolve([])),
}));
jest.mock("../../streaks/repository", () => ({
  fetchStreak: jest.fn(() => Promise.resolve(null)),
}));
jest.mock("../../../session/modes", () => {
  const { z } = require("zod");
  return {
    SessionMode: {
      STUDY: "STUDY",
      SPRINT: "SPRINT",
      CREATIVE: "CREATIVE",
      LIGHT_FOCUS: "LIGHT_FOCUS",
      RECOVERY: "RECOVERY",
    },
    SessionModeSchema: z.enum(["STUDY", "SPRINT", "CREATIVE", "LIGHT_FOCUS", "RECOVERY"]),
  };
});
jest.mock("../../lane-engine/schemas", () => {
  const { z } = require("zod");
  return {
    LaneSchema: z.enum(["student", "game_like", "deep_creative", "minimal_normal"]),
  };
});

// ── Imports ────────────────────────────────────────────────────────────────
import {
  getAdaptiveDifficultySuggestion,
  shouldShowSuggestion,
  getDifficultyDisplayName,
  getDifficultyXPMultiplier,
} from "../service/adaptiveDifficulty";

// ============================================================================

describe("adaptiveDifficulty", () => {
  describe("getAdaptiveDifficultySuggestion", () => {
    it("returns null suggestion when not enough sessions", () => {
      const result = getAdaptiveDifficultySuggestion(
        [
          { id: "1", grade: "A", purityScore: 80 },
          { id: "2", grade: "B", purityScore: 70 },
        ],
        "CASUAL",
      );
      expect(result.suggestion).toBeNull();
      expect(result.confidence).toBe("low");
    });

    it("suggests upgrade from CASUAL when performing well", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "S",
        purityScore: 90,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "CASUAL");
      expect(result.suggestion).toBe("FOCUSED");
    });

    it("suggests downgrade from FOCUSED when struggling", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "D",
        purityScore: 40,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "FOCUSED");
      expect(result.suggestion).toBe("CASUAL");
    });

    it("suggests upgrade from FOCUSED when excelling", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "S",
        purityScore: 95,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "FOCUSED");
      expect(result.suggestion).toBe("INTENSE");
    });

    it("suggests downgrade from INTENSE when struggling", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "D",
        purityScore: 30,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "INTENSE");
      expect(result.suggestion).toBe("FOCUSED");
    });

    it("returns no suggestion when performing at expected level", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "B",
        purityScore: 75,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "FOCUSED");
      expect(result.suggestion).toBeNull();
      expect(result.stats.sessionsAnalyzed).toBe(5);
    });
  });

  describe("shouldShowSuggestion", () => {
    it("returns true when never shown", () => {
      expect(shouldShowSuggestion(null)).toBe(true);
    });

    it("returns true when shown long ago", () => {
      expect(
        shouldShowSuggestion(Date.now() - 48 * 60 * 60 * 1000),
      ).toBe(true);
    });

    it("returns false when shown recently", () => {
      expect(shouldShowSuggestion(Date.now() - 1000)).toBe(false);
    });

    it("respects custom minIntervalMs", () => {
      expect(
        shouldShowSuggestion(Date.now() - 5000, 10000),
      ).toBe(false);
      expect(
        shouldShowSuggestion(Date.now() - 15000, 10000),
      ).toBe(true);
    });
  });

  describe("getDifficultyDisplayName", () => {
    it("returns display names for all difficulties", () => {
      expect(getDifficultyDisplayName("CASUAL")).toBe("Casual");
      expect(getDifficultyDisplayName("FOCUSED")).toBe("Focused");
      expect(getDifficultyDisplayName("INTENSE")).toBe("Intense");
    });
  });

  describe("getDifficultyXPMultiplier", () => {
    it("returns correct multipliers", () => {
      expect(getDifficultyXPMultiplier("CASUAL")).toBe(1);
      expect(getDifficultyXPMultiplier("FOCUSED")).toBe(2);
      expect(getDifficultyXPMultiplier("INTENSE")).toBe(3);
    });
  });
});
