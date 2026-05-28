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

  describe("detectStudyStuck", () => {
    test("should not detect stuck when user is making progress", async () => {
      const result = await coachService.detectStudyStuck(mockContext);
      expect(result.detected).toBe(false);
      expect(result.severity).toBe("LOW");
    });

    test("should detect stuck when no progress for long time", async () => {
      const stuckContext = {
        ...mockContext,
        sessionDuration: 3600000,
        focusQuality: 0.3,
        lastActivity: Date.now() - 1800000,
        currentStreak: 0,
      };
      const result = await coachService.detectStudyStuck(stuckContext);
      expect(result.detected).toBe(true);
      expect(result.severity).toBe("HIGH");
      expect(result.intervention.type).toBe("study_stuck");
      expect(result.intervention.actions).toContain("summarize_progress");
    });

    test("should detect stuck when focus quality is very low", async () => {
      const lowFocusContext = {
        ...mockContext,
        focusQuality: 0.1,
        sessionDuration: 2400000,
        interruptions: [
          { type: "distraction", timestamp: Date.now() - 600000 },
          { type: "distraction", timestamp: Date.now() - 1200000 },
        ],
      };
      const result = await coachService.detectStudyStuck(lowFocusContext);
      expect(result.detected).toBe(true);
      expect(result.severity).toBe("MEDIUM");
    });

    test("should provide appropriate intervention for stuck state", async () => {
      const stuckContext = {
        ...mockContext,
        focusQuality: 0.2,
        sessionDuration: 3000000,
      };
      const result = await coachService.detectStudyStuck(stuckContext);
      if (result.detected) {
        expect(result.intervention.message).toContain("stuck");
        expect(result.intervention.actions).toContain("summarize_progress");
        expect(result.intervention.actions).toContain("suggest_break");
      }
    });
  });
});
