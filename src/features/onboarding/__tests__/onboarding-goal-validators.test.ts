/**
 * Comprehensive Onboarding Feature Tests — Goal Validators
 */

import "./onboarding-mock-setup";

import {
  GoalValidators,
} from "../utils/goal-validators";

// ── Goal Validators ───────────────────────────────────────────────────────────

describe("GoalValidators", () => {
  describe("validate", () => {
    it("accepts valid goal", () => {
      const result = GoalValidators.validate("WORK");
      expect(result.success).toBe(true);
      expect(result.data).toBe("WORK");
      expect(result.errors).toHaveLength(0);
    });

    it("rejects non-string goal", () => {
      const result = GoalValidators.validate(123);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.code).toBe("INVALID_GOAL");
    });

    it("rejects unknown goal string", () => {
      const result = GoalValidators.validate("INVALID");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_GOAL");
    });

    it("rejects null goal", () => {
      const result = GoalValidators.validate(null);
      expect(result.success).toBe(false);
    });
  });

  describe("getSuggestions", () => {
    it("returns suggestions for partial match", () => {
      const suggestions = GoalValidators.getSuggestions("wor");
      expect(suggestions).toContain("WORK");
    });

    it("returns empty for no match", () => {
      const suggestions = GoalValidators.getSuggestions("zzz");
      expect(suggestions).toHaveLength(0);
    });

    it("returns multiple suggestions for broad match", () => {
      const suggestions = GoalValidators.getSuggestions("o");
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
