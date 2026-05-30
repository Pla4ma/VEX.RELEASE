/**
 * Tests for home-spine core schemas
 * (HomeActionIntentSchema, HomeHighlightSchema, HomeReturnReasonStateSchema,
 *  HomeCardSchema, HomeSpineModelSchema)
 */

import {
  HomeActionIntentSchema,
  HomeHighlightSchema,
  HomeReturnReasonStateSchema,
  HomeCardSchema,
  HomeSpineModelSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Schema validation tests — core
// ---------------------------------------------------------------------------
describe("home-spine: schemas", () => {
  describe("HomeActionIntentSchema", () => {
    it("validates all known intents", () => {
      expect(HomeActionIntentSchema.safeParse("start-session").success).toBe(true);
      expect(HomeActionIntentSchema.safeParse("accept-coach-recommendation").success).toBe(true);
      expect(HomeActionIntentSchema.safeParse("continue-study-plan").success).toBe(true);
      expect(HomeActionIntentSchema.safeParse("invalid-intent").success).toBe(false);
    });
  });

  describe("HomeHighlightSchema", () => {
    it("validates a complete highlight", () => {
      const result = HomeHighlightSchema.safeParse({
        title: "Great job",
        message: "You did it",
        tone: "celebration",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const result = HomeHighlightSchema.safeParse({
        title: "",
        message: "msg",
        tone: "info",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid tone", () => {
      const result = HomeHighlightSchema.safeParse({
        title: "t",
        message: "m",
        tone: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("HomeReturnReasonStateSchema", () => {
    it("validates a complete return reason", () => {
      const result = HomeReturnReasonStateSchema.safeParse({
        eyebrow: "Return reason",
        title: "Focus",
        body: "Do it",
        ctaLabel: "Start",
        intent: "start-session",
        source: "next-best-action",
        tone: "default",
      });
      expect(result.success).toBe(true);
    });

    it("validates with optional fields", () => {
      const result = HomeReturnReasonStateSchema.safeParse({
        eyebrow: "Return reason",
        title: "Focus",
        body: "Do it",
        ctaLabel: "Start",
        intent: "start-session",
        source: "coach",
        tone: "default",
        recommendationId: "rec-1",
        suggestedDifficulty: "NORMAL",
        suggestedDurationSeconds: 1500,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("HomeCardSchema", () => {
    it("validates a complete card", () => {
      const result = HomeCardSchema.safeParse({
        eyebrow: "Primary",
        title: "Start",
        body: "Do it now",
        ctaLabel: "Go",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("HomeSpineModelSchema", () => {
    it("validates a complete model", () => {
      const card = { eyebrow: "e", title: "t", body: "b", ctaLabel: "c" };
      const result = HomeSpineModelSchema.safeParse({
        primaryAction: card,
        progressSignal: card,
        returnReason: {
          eyebrow: "Return reason",
          title: "Focus",
          body: "Do it",
          ctaLabel: "Start",
          intent: "start-session",
          source: "next-best-action",
          tone: "default",
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
