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

import { trackXpAdded, trackLevelUp, trackProgressionError, setupProgressionAnalytics } from "../analytics";

describe("Analytics", () => {
  it("trackXpAdded calls Sentry breadcrumb", () => {
    const Sentry = require("@sentry/react-native");
    trackXpAdded("user1", 100, "SESSION_COMPLETE", 5);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: "progression", message: "XP added" }),
    );
  });

  it("trackLevelUp calls Sentry breadcrumb", () => {
    const Sentry = require("@sentry/react-native");
    trackLevelUp("user1", 10, 9, 5000);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Level up: 9 → 10" }),
    );
  });

  it("trackProgressionError calls Sentry breadcrumb with error level", () => {
    const Sentry = require("@sentry/react-native");
    trackProgressionError("addXp", new Error("test"), "user1");
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: "error" }),
    );
  });

  it("setupProgressionAnalytics returns cleanup function", () => {
    const cleanup = setupProgressionAnalytics();
    expect(typeof cleanup).toBe("function");
    cleanup();
  });
});
