/**
 * Schema tests — ModeActiveIndicator, ModeCompletionSurface,
 * ModeRescueSurface, ModeWeeklyIntelligence
 */

import { describe, it, expect } from "@jest/globals";

import {
  ModeActiveIndicatorSchema,
  ModeCompletionSurfaceSchema,
  ModeRescueSurfaceSchema,
  ModeWeeklyIntelligenceSchema,
} from "../schemas";

// ═══════════════════════════════════════════════════════════════════════
// SCHEMA TESTS — mode surface schemas
// ═══════════════════════════════════════════════════════════════════════

describe("mode-native schemas", () => {
  describe("ModeActiveIndicatorSchema", () => {
    it("parses a valid active indicator", () => {
      const result = ModeActiveIndicatorSchema.safeParse({
        lane: "student",
        targetLabel: "Studying",
        topLine: "Stay focused",
        showProgressBar: true,
        showCompanion: false,
        allowNotes: true,
        density: "medium",
        quiet: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid density value", () => {
      const result = ModeActiveIndicatorSchema.safeParse({
        lane: "student",
        targetLabel: "Test",
        topLine: "Test",
        showProgressBar: true,
        showCompanion: false,
        allowNotes: true,
        density: "ultra_high",
        quiet: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeCompletionSurfaceSchema", () => {
    it("parses a valid completion surface", () => {
      const result = ModeCompletionSurfaceSchema.safeParse({
        lane: "student",
        headline: "Study block done",
        body: "You studied algorithms.",
        primaryActionLabel: "Mark what needs review",
        secondaryHint: "Next: recall key ideas",
        insightLabel: "VEX tracked your weak spots",
        showRewards: false,
        showStreak: false,
        showXp: false,
      });
      expect(result.success).toBe(true);
    });

    it("accepts null for nullable fields", () => {
      const result = ModeCompletionSurfaceSchema.safeParse({
        lane: "minimal_normal",
        headline: "Done",
        body: "Complete.",
        primaryActionLabel: "Close",
        secondaryHint: null,
        insightLabel: null,
        showRewards: false,
        showStreak: false,
        showXp: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ModeRescueSurfaceSchema", () => {
    it("parses a valid rescue surface", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Review one weak section",
        body: "Just open your notes.",
        suggestedDurationMinutes: 8,
        actionLabel: "Start review",
      });
      expect(result.success).toBe(true);
    });

    it("rejects rescue surface with duration below minimum", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
        body: "Test",
        suggestedDurationMinutes: 2, // below min of 3
        actionLabel: "Start",
      });
      expect(result.success).toBe(false);
    });

    it("rejects rescue surface with duration above maximum", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
        body: "Test",
        suggestedDurationMinutes: 20, // above max of 15
        actionLabel: "Start",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeWeeklyIntelligenceSchema", () => {
    it("parses a valid weekly intelligence", () => {
      const result = ModeWeeklyIntelligenceSchema.safeParse({
        lane: "student",
        headline: "Study week in review",
        body: "Your study rhythm is forming.",
        primaryMetric: "Review consistency",
        primaryMetricValue: "3 of 5 blocks held",
        adjustment: "Start by naming the topic.",
        nextSessionType: "Study block",
      });
      expect(result.success).toBe(true);
    });

    it("accepts null for nullable nextSessionType", () => {
      const result = ModeWeeklyIntelligenceSchema.safeParse({
        lane: "minimal_normal",
        headline: "Test",
        body: "Test",
        primaryMetric: "Metric",
        primaryMetricValue: "Value",
        adjustment: "Adjustment",
        nextSessionType: null,
      });
      expect(result.success).toBe(true);
    });
  });
});
