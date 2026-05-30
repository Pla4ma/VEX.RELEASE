// Deep Session-Start Tests – setup-helpers
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
  parseSessionSetupParams,
  buildSessionStartSummary,
  getOfflineSessionStartMessage,
  shouldOpenCustomizationByDefault,
  shouldAutoApplySmartSuggestion,
  createStarterSessionConfig,
} from "../setup-helpers";
describe("setup-helpers", () => {
  describe("parseSessionSetupParams", () => {
    it("returns params for valid input", () => {
      const result = parseSessionSetupParams({ presetId: "sprint-15" });
      expect(result.params.presetId).toBe("sprint-15");
      expect(result.warningMessage).toBeNull();
    });

    it("handles null input gracefully", () => {
      const result = parseSessionSetupParams(null);
      expect(result.params).toEqual({});
      expect(result.warningMessage).toBeNull();
    });

    it("handles undefined input gracefully", () => {
      const result = parseSessionSetupParams(undefined);
      expect(result.params).toEqual({});
    });
  });

  describe("buildSessionStartSummary", () => {
    it("builds correct summary", () => {
      const result = buildSessionStartSummary({
        currentThemeName: "calm",
        durationMinutes: 25,
        hasCustomizations: false,
      });
      expect(result.ctaLabel).toContain("25");
      expect(result.subtitle).toContain("calm");
      expect(result.customizationLabel).toBe("Tune session");
    });

    it("shows hide options when customizations active", () => {
      const result = buildSessionStartSummary({
        currentThemeName: "focus",
        durationMinutes: 15,
        hasCustomizations: true,
      });
      expect(result.customizationLabel).toBe("Hide options");
    });
  });

  describe("getOfflineSessionStartMessage", () => {
    it("returns message when offline", () => {
      expect(getOfflineSessionStartMessage(true)).toBeTruthy();
    });

    it("returns null when online", () => {
      expect(getOfflineSessionStartMessage(false)).toBeNull();
    });
  });

  describe("shouldOpenCustomizationByDefault", () => {
    it("returns true for custom preset", () => {
      expect(
        shouldOpenCustomizationByDefault({ presetId: "custom" }),
      ).toBe(true);
    });

    it("returns false for non-custom preset", () => {
      expect(
        shouldOpenCustomizationByDefault({ presetId: "sprint-15" }),
      ).toBe(false);
    });

    it("returns false when no presetId", () => {
      expect(shouldOpenCustomizationByDefault({})).toBe(false);
    });
  });

  describe("shouldAutoApplySmartSuggestion", () => {
    it("returns true when all conditions met", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: "sprint-15",
        }),
      ).toBe(true);
    });

    it("returns false when has saved draft", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: true,
          params: {},
          smartSuggestionPresetId: "sprint-15",
        }),
      ).toBe(false);
    });

    it("returns false when no suggestion available", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: null,
        }),
      ).toBe(false);
    });

    it("returns false when params have presetId", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: { presetId: "custom" },
          smartSuggestionPresetId: "sprint-15",
        }),
      ).toBe(false);
    });
  });

  describe("createStarterSessionConfig", () => {
    it("creates config with correct duration", () => {
      const config = createStarterSessionConfig({ durationMinutes: 15 });
      expect(config.duration).toBe(900);
      expect(config.mode).toBe("STARTER");
    });

    it("includes metadata flags", () => {
      const config = createStarterSessionConfig({ durationMinutes: 25 });
      expect(config.metadata.isFromOnboarding).toBe(true);
      expect(config.metadata.isStarterSession).toBe(true);
    });

    it("sets category to null when not provided", () => {
      const config = createStarterSessionConfig({ durationMinutes: 15 });
      expect(config.category).toBeNull();
    });

    it("preserves category when provided", () => {
      const config = createStarterSessionConfig({
        durationMinutes: 15,
        category: "WORK",
      });
      expect(config.category).toBe("WORK");
    });
  });
});
