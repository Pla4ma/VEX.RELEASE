/**
 * Tests extracted from progression-comprehensive.test.ts
 */

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../config/supabase", () => ({
  supabase: { from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })) })) })), rpc: jest.fn(() => ({ data: null, error: null })) },
  getSupabaseClient: jest.fn(() => ({ from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })) })), gte: jest.fn(() => ({})), lte: jest.fn(() => ({})), order: jest.fn(() => ({})), limit: jest.fn(() => ({})) })), rpc: jest.fn(() => ({ data: null, error: null })) })),
}));
jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));
jest.mock("../../../utils/uuid", () => ({
  v4: () => "test-uuid-" + Math.random().toString(36).slice(2, 8),
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(), error: jest.fn(), warn: jest.fn(), log: jest.fn(),
  }),
}));
jest.mock("../../../utils/supabase-resilience", () => ({
  withResilience: (q: unknown) => q,
}));
jest.mock("@theme/tokens/colors", () => ({
  lightColors: {
    accent: { teal: "#008080", orange: "#FFA500", purple: "#800080", pink: "#FFC0CB" },
    primary: { 400: "#4A90D9", 600: "#2D5F8A" },
    error: { 500: "#FF0000" },
  },
}));
jest.mock("@theme/tokens/launch-colors", () => ({
  launchColors: {
    hex_8b4513: "#8b4513", hex_4a5568: "#4a5568", hex_4169e1: "#4169e1",
    hex_9400d3: "#9400d3", hex_ffd700: "#ffd700", hex_ff00ff: "#ff00ff",
  },
}));
jest.mock("../../../progression/ProgressionService", () => ({
  getProgressionService: jest.fn(),
}));

import { configureProgressionService } from "../service-config";
import { getLevelUpRewards, getLevelUpCelebrationRewards } from "../service-level-rewards";

describe("Level Rewards", () => {
  describe("getLevelUpRewards", () => {
    beforeEach(() => {
      configureProgressionService({ prestigeEnabled: true });
    });

    it("returns empty for non-milestone level", () => {
      expect(getLevelUpRewards(2)).toEqual([]);
    });

    it("returns bundle for every 5th level", () => {
      expect(getLevelUpRewards(5)).toContain("LEVEL_5_BUNDLE");
      expect(getLevelUpRewards(10)).toContain("LEVEL_10_BUNDLE");
      expect(getLevelUpRewards(15)).toContain("LEVEL_15_BUNDLE");
    });

    it("returns TITLE_ADEPT at level 10", () => {
      expect(getLevelUpRewards(10)).toContain("TITLE_ADEPT");
    });

    it("returns TITLE_EXPERT at level 25", () => {
      expect(getLevelUpRewards(25)).toContain("TITLE_EXPERT");
    });

    it("returns TITLE_MASTER at level 50", () => {
      expect(getLevelUpRewards(50)).toContain("TITLE_MASTER");
    });

    it("returns PRESTIGE_AVAILABLE at level 100 when prestige enabled", () => {
      expect(getLevelUpRewards(100)).toContain("PRESTIGE_AVAILABLE");
    });

    it("no prestige reward when prestige disabled", () => {
      configureProgressionService({ prestigeEnabled: false });
      expect(getLevelUpRewards(100)).not.toContain("PRESTIGE_AVAILABLE");
    });
  });

  describe("getLevelUpCelebrationRewards", () => {
    it("returns default message for single non-milestone level", () => {
      const rewards = getLevelUpCelebrationRewards(1, 2);
      expect(rewards).toContain("Level 2 reached");
    });

    it("returns milestone messages for level 10", () => {
      const rewards = getLevelUpCelebrationRewards(9, 10);
      expect(rewards).toContain("100 coin milestone reward");
      expect(rewards).toContain("Adept tier reached");
    });

    it("returns milestone messages for level 25", () => {
      const rewards = getLevelUpCelebrationRewards(24, 25);
      // 25 is NOT divisible by 10, so no coin reward; only tier reached
      expect(rewards).toContain("Expert tier reached");
    });

    it("returns milestone messages for level 50", () => {
      const rewards = getLevelUpCelebrationRewards(49, 50);
      expect(rewards).toContain("500 coin milestone reward");
      expect(rewards).toContain("Master tier reached");
    });

    it("returns milestone messages for level 100", () => {
      const rewards = getLevelUpCelebrationRewards(99, 100);
      expect(rewards).toContain("1000 coin milestone reward");
      expect(rewards).toContain("Centurion tier reached");
    });

    it("handles multi-level jumps", () => {
      const rewards = getLevelUpCelebrationRewards(8, 11);
      // 9, 10, 11 -> 9 has 90 coin (90, not 10 multiple), 10 has 100 coin + Adept, 11 has 110 coin
      expect(rewards).toContain("100 coin milestone reward");
      expect(rewards).toContain("Adept tier reached");
    });
  });
});
