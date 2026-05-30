/**
 * Comprehensive Onboarding Feature Tests — Duration Validators
 */

import "./onboarding-mock-setup";

import { DurationValidators } from "../utils/duration-validators";

// ── Duration Validators ───────────────────────────────────────────────────────

describe("DurationValidators", () => {
  describe("validate", () => {
    it("accepts valid duration", () => {
      const result = DurationValidators.validate(25);
      expect(result.success).toBe(true);
      expect(result.data).toBe(25);
    });

    it("rejects non-number duration", () => {
      const result = DurationValidators.validate("25");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_DURATION_TYPE");
    });

    it("rejects NaN", () => {
      const result = DurationValidators.validate(NaN);
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_DURATION_TYPE");
    });

    it("rejects invalid number with suggestion", () => {
      const result = DurationValidators.validate(20);
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_DURATION_VALUE");
      expect(result.suggestions).toBeDefined();
    });

    it("warns on short duration (15 min)", () => {
      const result = DurationValidators.validate(15);
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.code).toBe("SHORT_DURATION_WARNING");
    });

    it("warns on long duration (60 min)", () => {
      const result = DurationValidators.validate(60);
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.code).toBe("LONG_DURATION_WARNING");
    });

    it("has no warnings for medium duration (25 min)", () => {
      const result = DurationValidators.validate(25);
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("recommendForGoal", () => {
    it("returns recommendations for WORK", () => {
      const recs = DurationValidators.recommendForGoal("WORK");
      expect(recs).toContain(25);
      expect(recs).toContain(45);
      expect(recs).toContain(60);
    });

    it("returns recommendations for STUDY", () => {
      const recs = DurationValidators.recommendForGoal("STUDY");
      expect(recs).toContain(25);
    });

    it("returns recommendations for CREATIVE", () => {
      const recs = DurationValidators.recommendForGoal("CREATIVE");
      expect(recs).toContain(45);
    });

    it("returns recommendations for PERSONAL", () => {
      const recs = DurationValidators.recommendForGoal("PERSONAL");
      expect(recs).toContain(25);
    });
  });
});
