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

describe("Schemas", () => {
  it("XpSourceSchema rejects invalid source", () => {
    const { XpSourceSchema } = require("../schemas-xp");
    expect(() => XpSourceSchema.parse("INVALID_SOURCE")).toThrow();
  });

  it("XpSourceSchema accepts valid source", () => {
    const { XpSourceSchema } = require("../schemas-xp");
    expect(XpSourceSchema.parse("SESSION_COMPLETE")).toBe("SESSION_COMPLETE");
  });

  it("ProgressionSchema validates valid object", () => {
    const { ProgressionSchema } = require("../schemas");
    const valid = {
      id: "00000000-0000-0000-0000-000000000001",
      userId: "00000000-0000-0000-0000-000000000002",
      level: 5,
      xp: 50,
      totalXp: 500,
      nextLevelThreshold: 100,
      lastLevelUpAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => ProgressionSchema.parse(valid)).not.toThrow();
  });

  it("ProgressionSchema rejects invalid level", () => {
    const { ProgressionSchema } = require("../schemas");
    const invalid = {
      id: "00000000-0000-0000-0000-000000000001",
      userId: "00000000-0000-0000-0000-000000000002",
      level: 0,
      xp: 0,
      totalXp: 0,
      nextLevelThreshold: 100,
      lastLevelUpAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => ProgressionSchema.parse(invalid)).toThrow();
  });

  it("AddXpInputSchema validates valid input", () => {
    const { AddXpInputSchema } = require("../schemas");
    const valid = {
      userId: "00000000-0000-0000-0000-000000000001",
      amount: 50,
      source: "SESSION_COMPLETE",
    };
    expect(() => AddXpInputSchema.parse(valid)).not.toThrow();
  });

  it("AddXpInputSchema rejects negative amount", () => {
    const { AddXpInputSchema } = require("../schemas");
    const invalid = {
      userId: "00000000-0000-0000-0000-000000000001",
      amount: -10,
      source: "SESSION_COMPLETE",
    };
    expect(() => AddXpInputSchema.parse(invalid)).toThrow();
  });

  it("UnlockTypeSchema accepts all valid types", () => {
    const { UnlockTypeSchema } = require("../schemas");
    const types = ["FEATURE", "BLOCKER_INSIGHT", "SHOP_ITEM", "COSMETIC", "TITLE", "MODE_ADAPTATION"];
    for (const t of types) {
      expect(UnlockTypeSchema.parse(t)).toBe(t);
    }
  });

  it("MilestoneTypeSchema accepts valid types", () => {
    const { MilestoneTypeSchema } = require("../schemas");
    expect(MilestoneTypeSchema.parse("LEVEL")).toBe("LEVEL");
    expect(MilestoneTypeSchema.parse("XP_TOTAL")).toBe("XP_TOTAL");
  });
});
