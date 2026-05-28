import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { createCoachTestSetup } from "./coach-test-setup";
import type { InterventionContext } from "../types";

jest.mock("../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe("CoachService", () => {
  let coachService: ReturnType<typeof createCoachTestSetup>["coachService"];
  let mockContext: InterventionContext;

  beforeEach(() => {
    const setup = createCoachTestSetup();
    coachService = setup.coachService;
    mockContext = setup.mockContext;
  });

  describe("detectOptimalBreak", () => {
    test("should not suggest break early in session", async () => {
      const earlySessionContext = {
        ...mockContext,
        sessionDuration: 900000,
        focusQuality: 0.9,
      };
      const result =
        await coachService.detectOptimalBreak(earlySessionContext);
      expect(result.detected).toBe(false);
    });

    test("should suggest break after long work period", async () => {
      const longWorkContext = {
        ...mockContext,
        sessionDuration: 3600000,
        focusQuality: 0.7,
        currentPhase: "WORK",
      };
      const result = await coachService.detectOptimalBreak(longWorkContext);
      expect(result.detected).toBe(true);
      expect(result.intervention.type).toBe("optimal_break");
      expect(result.intervention.actions).toContain("take_break");
    });

    test("should suggest break when focus is declining", async () => {
      const decliningFocusContext = {
        ...mockContext,
        sessionDuration: 2700000,
        focusQuality: 0.4,
        currentStreak: 1,
      };
      const result = await coachService.detectOptimalBreak(
        decliningFocusContext,
      );
      expect(result.detected).toBe(true);
      expect(result.severity).toBe("MEDIUM");
    });

    test("should suggest break at natural completion points", async () => {
      const completionContext = {
        ...mockContext,
        sessionDuration: 3000000,
        focusQuality: 0.8,
        documentsStudied: ["doc-1"],
      };
      const result =
        await coachService.detectOptimalBreak(completionContext);
      expect(result.detected).toBe(true);
      if (result.detected) {
        expect(result.intervention.actions).toContain(
          "consolidate_learning",
        );
      }
    });
  });

  describe("getSessionAdvice", () => {
    test("should provide advice for active session", async () => {
      const advice = await coachService.getSessionAdvice(mockContext);
      expect(advice).toBeDefined();
      expect(advice.sessionId).toBe(mockContext.sessionId);
      expect(advice.recommendations).toBeDefined();
      expect(Array.isArray(advice.recommendations)).toBe(true);
    });

    test("should include focus improvement tips for low focus", async () => {
      const lowFocusContext = { ...mockContext, focusQuality: 0.3 };
      const advice = await coachService.getSessionAdvice(lowFocusContext);
      expect(
        advice.recommendations.some((r) => r.type === "focus_improvement"),
      ).toBe(true);
    });

    test("should include encouragement for good progress", async () => {
      const goodProgressContext = {
        ...mockContext,
        focusQuality: 0.9,
        currentStreak: 5,
        sessionDuration: 2400000,
      };
      const advice =
        await coachService.getSessionAdvice(goodProgressContext);
      expect(
        advice.recommendations.some((r) => r.type === "encouragement"),
      ).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("should handle missing context gracefully", async () => {
      const result = await coachService.detectStudyStuck(
        {} as InterventionContext,
      );
      expect(result.detected).toBe(false);
      expect(result.severity).toBe("LOW");
    });

    test("should handle invalid data types", async () => {
      const invalidContext = {
        ...mockContext,
        focusQuality: "invalid" as unknown as number,
        sessionDuration: "invalid" as unknown as number,
      };
      const result = await coachService.detectStudyStuck(invalidContext);
      expect(result.detected).toBe(false);
    });
  });

  describe("Performance", () => {
    test("should complete detection quickly", async () => {
      const startTime = Date.now();
      await coachService.detectStudyStuck(mockContext);
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });

    test("should handle concurrent requests", async () => {
      const promises = [
        coachService.detectStudyStuck(mockContext),
        coachService.detectDistraction(mockContext),
        coachService.detectOptimalBreak(mockContext),
      ];
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      expect(results.every((r) => r !== undefined)).toBe(true);
    });
  });
});
