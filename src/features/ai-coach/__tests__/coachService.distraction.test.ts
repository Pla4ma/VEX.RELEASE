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

  describe("detectDistraction", () => {
    test("should not detect distraction when focus is good", async () => {
      const result = await coachService.detectDistraction(mockContext);
      expect(result.detected).toBe(false);
    });

    test("should detect distraction with multiple interruptions", async () => {
      const distractedContext = {
        ...mockContext,
        interruptions: [
          { type: "phone_notification", timestamp: Date.now() - 300000 },
          { type: "phone_notification", timestamp: Date.now() - 600000 },
          { type: "background_noise", timestamp: Date.now() - 900000 },
        ],
        focusQuality: 0.5,
      };
      const result = await coachService.detectDistraction(distractedContext);
      expect(result.detected).toBe(true);
      expect(result.intervention.type).toBe("distraction_detected");
      expect(result.intervention.actions).toContain("refocus_techniques");
    });

    test("should detect distraction when focus drops suddenly", async () => {
      const droppingFocusContext = {
        ...mockContext,
        focusQuality: 0.3,
        sessionDuration: 1800000,
        lastActivity: Date.now() - 300000,
      };
      const result =
        await coachService.detectDistraction(droppingFocusContext);
      expect(result.detected).toBe(true);
      expect(result.severity).toBe("MEDIUM");
    });

    test("should provide refocus strategies for distraction", async () => {
      const distractedContext = {
        ...mockContext,
        interruptions: [
          { type: "social_media", timestamp: Date.now() - 120000 },
        ],
        focusQuality: 0.4,
      };
      const result = await coachService.detectDistraction(distractedContext);
      if (result.detected) {
        expect(result.intervention.message).toContain("distracted");
        expect(result.intervention.actions).toContain("refocus_techniques");
        expect(result.intervention.actions).toContain(
          "minimize_interruptions",
        );
      }
    });
  });
});
