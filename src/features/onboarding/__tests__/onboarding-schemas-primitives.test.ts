/**
 * Comprehensive Onboarding Feature Tests — Schema Tests (Primitives)
 */

import "./onboarding-mock-setup";

import {
  FocusGoalSchema,
  FocusDurationSchema,
  OnboardingStepSchema,
} from "../schemas";

import {
  OnboardingNameSchema,
} from "../utils/schemas";

// ── Schema Tests ──────────────────────────────────────────────────────────────

describe("Onboarding Schemas", () => {
  describe("FocusGoalSchema", () => {
    it("accepts valid goals", () => {
      expect(FocusGoalSchema.parse("WORK")).toBe("WORK");
      expect(FocusGoalSchema.parse("STUDY")).toBe("STUDY");
      expect(FocusGoalSchema.parse("CREATIVE")).toBe("CREATIVE");
      expect(FocusGoalSchema.parse("PERSONAL")).toBe("PERSONAL");
    });

    it("rejects invalid goals", () => {
      expect(() => FocusGoalSchema.parse("INVALID")).toThrow();
      expect(() => FocusGoalSchema.parse("")).toThrow();
      expect(() => FocusGoalSchema.parse(null)).toThrow();
    });
  });

  describe("FocusDurationSchema", () => {
    it("accepts valid durations", () => {
      expect(FocusDurationSchema.parse(10)).toBe(10);
      expect(FocusDurationSchema.parse(15)).toBe(15);
      expect(FocusDurationSchema.parse(25)).toBe(25);
      expect(FocusDurationSchema.parse(45)).toBe(45);
      expect(FocusDurationSchema.parse(60)).toBe(60);
    });

    it("rejects invalid durations", () => {
      expect(() => FocusDurationSchema.parse(20)).toThrow();
      expect(() => FocusDurationSchema.parse(0)).toThrow();
      expect(() => FocusDurationSchema.parse("25")).toThrow();
    });
  });

  describe("OnboardingNameSchema", () => {
    it("accepts valid names", () => {
      expect(OnboardingNameSchema.parse("Alice")).toBe("Alice");
      expect(OnboardingNameSchema.parse("Bob_123")).toBe("Bob_123");
      expect(OnboardingNameSchema.parse("  trimmed  ")).toBe("trimmed");
    });

    it("rejects names that are too short", () => {
      expect(() => OnboardingNameSchema.parse("A")).toThrow();
    });

    it("rejects names that are too long", () => {
      expect(() => OnboardingNameSchema.parse("A".repeat(31))).toThrow();
    });

    it("rejects names with invalid characters", () => {
      expect(() => OnboardingNameSchema.parse("Alice@!")).toThrow();
    });
  });

  describe("OnboardingStepSchema", () => {
    it("accepts valid steps", () => {
      expect(OnboardingStepSchema.parse("WELCOME")).toBe("WELCOME");
      expect(OnboardingStepSchema.parse("GOAL_SETTING")).toBe("GOAL_SETTING");
      expect(OnboardingStepSchema.parse("FOCUS_TIME")).toBe("FOCUS_TIME");
      expect(OnboardingStepSchema.parse("NAME_SETUP")).toBe("NAME_SETUP");
      expect(OnboardingStepSchema.parse("FIRST_SESSION_CTA")).toBe(
        "FIRST_SESSION_CTA",
      );
    });

    it("rejects invalid steps", () => {
      expect(() => OnboardingStepSchema.parse("INVALID")).toThrow();
    });
  });
});
