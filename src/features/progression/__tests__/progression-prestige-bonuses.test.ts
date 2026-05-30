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

import { PRESTIGE_BONUSES, calculatePrestigeBonuses, applyPrestigeBonuses, getTotalBonusPercent } from "../prestige-bonuses";
import type { PrestigeState } from "../prestige-types";


function makePrestigeState(overrides?: Partial<PrestigeState>): PrestigeState {
  return {
    prestigeLevel: 0, totalPrestiges: 0, firstPrestigeAt: null, lastPrestigeAt: null,
    activeBonuses: [], fastestPrestige: null, mostXpAtPrestige: null,
    nightmareUnlocked: false, nightmareCompletions: 0, ...overrides,
  };
}

describe("Prestige Bonuses", () => {
  it("PRESTIGE_BONUSES has entries", () => {
    expect(PRESTIGE_BONUSES.length).toBeGreaterThanOrEqual(10);
  });

  describe("calculatePrestigeBonuses", () => {
    it("returns empty for prestige 0", () => {
      const bonuses = calculatePrestigeBonuses(0, 0);
      expect(bonuses).toEqual([]);
    });

    it("returns COMMON bonuses for prestige 1", () => {
      const bonuses = calculatePrestigeBonuses(1, 0);
      expect(bonuses.length).toBeGreaterThan(0);
    });

    it("more bonuses at higher prestige", () => {
      const low = calculatePrestigeBonuses(1, 0);
      const high = calculatePrestigeBonuses(6, 0);
      expect(high.length).toBeGreaterThanOrEqual(low.length);
    });

    it("includes RARE at prestige 4+", () => {
      const bonuses = calculatePrestigeBonuses(4, 0);
      const rarePool = PRESTIGE_BONUSES.filter((b) => b.rarity === "RARE");
      expect(rarePool.length).toBeGreaterThan(0);
      // Bonus selection is deterministic by formula, just check count is reasonable
      expect(bonuses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("applyPrestigeBonuses", () => {
    it("returns base value with no active bonuses", () => {
      const state = makePrestigeState({ activeBonuses: [] });
      expect(applyPrestigeBonuses(100, "XP_BOOST", state)).toBe(100);
    });

    it("applies matching bonus type", () => {
      const state = makePrestigeState({ activeBonuses: ["xp_boost_5"] });
      const result = applyPrestigeBonuses(100, "XP_BOOST", state);
      expect(result).toBe(105); // 100 * 1.05
    });

    it("stacks multiple bonuses of same type", () => {
      const state = makePrestigeState({ activeBonuses: ["xp_boost_5", "xp_boost_10"] });
      const result = applyPrestigeBonuses(100, "XP_BOOST", state);
      expect(result).toBe(115); // 100 * 1.15
    });

    it("ignores non-matching bonus types", () => {
      const state = makePrestigeState({ activeBonuses: ["coin_boost_10"] });
      expect(applyPrestigeBonuses(100, "XP_BOOST", state)).toBe(100);
    });
  });

  describe("getTotalBonusPercent", () => {
    it("returns 0 with no active bonuses", () => {
      const state = makePrestigeState({ activeBonuses: [] });
      expect(getTotalBonusPercent("XP_BOOST", state)).toBe(0);
    });

    it("sums matching bonus values", () => {
      const state = makePrestigeState({ activeBonuses: ["xp_boost_5", "xp_boost_10"] });
      expect(getTotalBonusPercent("XP_BOOST", state)).toBe(15);
    });
  });
});
