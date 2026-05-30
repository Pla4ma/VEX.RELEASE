/**
 * Schema tests — SurfaceId, PrimaryAction, ModeHomeSurface,
 * QuickContractQuestion, ModeQuickContract
 */

import { describe, it, expect } from "@jest/globals";

import {
  SurfaceIdSchema,
  PrimaryActionSchema,
  ModeHomeSurfaceSchema,
  QuickContractQuestionSchema,
  ModeQuickContractSchema,
} from "../schemas";

// ═══════════════════════════════════════════════════════════════════════
// SCHEMA TESTS — foundational schemas
// ═══════════════════════════════════════════════════════════════════════

describe("mode-native schemas", () => {
  describe("SurfaceIdSchema", () => {
    it("accepts all valid surface IDs", () => {
      const validIds = [
        "home", "quick_contract", "active_session", "pause",
        "completion", "rescue", "day3_memory", "weekly_intelligence", "premium_trigger",
      ];
      for (const id of validIds) {
        expect(SurfaceIdSchema.safeParse(id).success).toBe(true);
      }
    });

    it("rejects an invalid surface ID", () => {
      expect(SurfaceIdSchema.safeParse("invalid_surface").success).toBe(false);
    });
  });

  describe("PrimaryActionSchema", () => {
    it("accepts all valid primary actions", () => {
      const validActions = [
        "start_session", "resume_project", "review_weak_topics",
        "start_study_block", "start_clean_run", "start_project_block",
        "re_enter_project", "do_mini_session",
      ];
      for (const action of validActions) {
        expect(PrimaryActionSchema.safeParse(action).success).toBe(true);
      }
    });

    it("rejects an invalid primary action", () => {
      expect(PrimaryActionSchema.safeParse("do_something_else").success).toBe(false);
    });
  });

  describe("ModeHomeSurfaceSchema", () => {
    it("parses a valid home surface object", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "Test feeling",
        headline: "Test headline",
        body: "Test body",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start study block",
        suggestedDurationMinutes: 20,
        secondaryHint: "Test hint",
        rhythmLabel: "Morning rhythm",
      });
      expect(result.success).toBe(true);
    });

    it("rejects home surface with missing required fields", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("rejects home surface with duration out of range", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "Test",
        headline: "Test",
        body: "Test",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 2, // below min of 5
        secondaryHint: "hint",
        rhythmLabel: null,
      });
      expect(result.success).toBe(false);
    });

    it("accepts null for nullable fields", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "minimal_normal",
        primaryFeeling: "Test",
        headline: "Test",
        body: "Test",
        primaryAction: "start_session",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 15,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("QuickContractQuestionSchema", () => {
    it("parses a valid question", () => {
      const result = QuickContractQuestionSchema.safeParse({
        key: "topic",
        label: "What are you studying?",
        placeholder: "e.g. Graph traversal",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a question with empty key", () => {
      const result = QuickContractQuestionSchema.safeParse({
        key: "",
        label: "Question?",
        placeholder: "placeholder",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeQuickContractSchema", () => {
    it("parses a valid quick contract", () => {
      const result = ModeQuickContractSchema.safeParse({
        lane: "student",
        title: "Quick contract: Study",
        questions: [
          { key: "topic", label: "What?", placeholder: "e.g. Math" },
        ],
        durationLabel: "Study for",
        suggestedDurationMinutes: 20,
        startLabel: "Start study block",
        showAdvancedSettings: false,
      });
      expect(result.success).toBe(true);
    });

    it("rejects quick contract with zero questions", () => {
      const result = ModeQuickContractSchema.safeParse({
        lane: "student",
        title: "Test",
        questions: [],
        durationLabel: "Duration",
        suggestedDurationMinutes: 20,
        startLabel: "Start",
        showAdvancedSettings: false,
      });
      expect(result.success).toBe(false);
    });
  });
});
