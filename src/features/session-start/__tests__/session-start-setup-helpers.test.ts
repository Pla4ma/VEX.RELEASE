/**
 * Tests for session-start setup-helpers.
 */

import {
  parseSessionSetupParams,
  buildSessionStartSummary,
  getOfflineSessionStartMessage,
  shouldOpenCustomizationByDefault,
  shouldAutoApplySmartSuggestion,
  createStarterSessionConfig,
} from "../setup-helpers";

describe("session-start: setup-helpers", () => {
  describe("parseSessionSetupParams", () => {
    it("returns valid params with no warning when input is valid", () => {
      const result = parseSessionSetupParams({
        presetId: "pomodoro",
        goal: "Write",
        suggestedDurationSeconds: 1500,
      });
      expect(result.params.presetId).toBe("pomodoro");
      expect(result.params.goal).toBe("Write");
      expect(result.warningMessage).toBeNull();
    });

    it("returns empty params and warning for invalid input", () => {
      const result = parseSessionSetupParams({
        suggestedDurationSeconds: -1,
      });
      expect(result.params).toEqual({});
      expect(result.warningMessage).toBeTruthy();
    });

    it("handles null/undefined input gracefully", () => {
      const r1 = parseSessionSetupParams(null);
      const r2 = parseSessionSetupParams(undefined);
      // null and undefined should fall back to {} and succeed with defaults
      expect(r1.params).toBeDefined();
      expect(r2.params).toBeDefined();
    });
  });

  describe("buildSessionStartSummary", () => {
    it("builds a summary with the correct label and subtitle", () => {
      const s = buildSessionStartSummary({
        currentThemeName: "Forest",
        durationMinutes: 30,
        hasCustomizations: false,
      });
      expect(s.ctaLabel).toBe("Start 30 Min Session");
      expect(s.subtitle).toContain("30 min focus");
      expect(s.subtitle).toContain("Forest");
      expect(s.customizationLabel).toBe("Tune session");
    });

    it("uses 'Hide options' label when customizations are open", () => {
      const s = buildSessionStartSummary({
        currentThemeName: "Ocean",
        durationMinutes: 10,
        hasCustomizations: true,
      });
      expect(s.customizationLabel).toBe("Hide options");
    });
  });

  describe("getOfflineSessionStartMessage", () => {
    it("returns null when online", () => {
      expect(getOfflineSessionStartMessage(false)).toBeNull();
    });

    it("returns a helpful offline message when offline", () => {
      const msg = getOfflineSessionStartMessage(true);
      expect(msg).toBeTruthy();
      expect(msg).toContain("offline");
    });
  });

  describe("shouldOpenCustomizationByDefault", () => {
    it("returns true when presetId is 'custom'", () => {
      expect(shouldOpenCustomizationByDefault({ presetId: "custom" })).toBe(true);
    });

    it("returns false for any other presetId", () => {
      expect(shouldOpenCustomizationByDefault({ presetId: "pomodoro" })).toBe(false);
    });

    it("returns false when presetId is absent", () => {
      expect(shouldOpenCustomizationByDefault({})).toBe(false);
    });
  });

  describe("shouldAutoApplySmartSuggestion", () => {
    it("returns true when no draft, no preset, no suggested duration, and preset exists", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(true);
    });

    it("returns false when a saved draft exists", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: true,
          params: {},
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(false);
    });

    it("returns false when params already have a presetId", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: { presetId: "custom" },
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(false);
    });

    it("returns false when smartSuggestionPresetId is null", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: null,
        }),
      ).toBe(false);
    });

    it("returns false when suggestedDurationSeconds is set", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: { suggestedDurationSeconds: 1500 },
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(false);
    });
  });

  describe("createStarterSessionConfig", () => {
    it("produces a STARTER mode config with correct duration in seconds", () => {
      const config = createStarterSessionConfig({ durationMinutes: 10 });
      expect(config.duration).toBe(600);
      expect(config.mode).toBe("STARTER");
      expect(config.metadata.isStarterSession).toBe(true);
      expect(config.metadata.isFromOnboarding).toBe(true);
    });

    it("sets category to null when not provided", () => {
      const config = createStarterSessionConfig({ durationMinutes: 5 });
      expect(config.category).toBeNull();
    });

    it("passes category through when provided", () => {
      const config = createStarterSessionConfig({
        durationMinutes: 15,
        category: "focus",
      });
      expect(config.category).toBe("focus");
    });
  });
});
