import { describe, it, expect, beforeEach } from "@jest/globals";
import { CompanionService } from "../service";
import { eventBus } from "../../../events/EventBus";

jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn() },
}));
jest.mock("../analytics", () => ({
  trackCompanionGrowth: jest.fn(),
  trackCompanionEvolution: jest.fn(),
  trackCompanionMilestone: jest.fn(),
}));

describe("Companion Growth", () => {
  let service: CompanionService;
  const userId = "test-user";
  const sessionId = "test-session";

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompanionService({
      id: "companion-1",
      userId,
      phase: "YOUNG",
      level: 10,
      totalFocusMinutes: 150,
      element: "FLAME",
      elementAffinity: 50,
      currentMood: "CONTENT",
      sessionProgress: 0,
      purityScore: 80,
      energyLevel: 60,
      visualSeed: 12345,
      colorHue: 0,
      particleDensity: 50,
      sessionCount: 5,
      perfectSessions: 1,
      longestFocusStreak: 10,
      nextEvolutionAt: 300,
      updatedAt: Date.now(),
    });
  });

  describe("Session Completion Growth", () => {
    it("should grow companion after session completion", () => {
      const result = service.completeSession(25, 85, userId, sessionId);
      expect(result.leveledUp).toBe(true);
      expect(result.evolved).toBe(false);
      const state = service.getState();
      expect(state?.totalFocusMinutes).toBe(175);
      expect(state?.sessionCount).toBe(6);
      expect(state?.level).toBeGreaterThan(10);
    });

    it("should emit growth events on session completion", () => {
      service.completeSession(25, 85, userId, sessionId);
      expect(eventBus.publish).toHaveBeenCalledWith(
        "companion:state_changed",
        expect.objectContaining({
          userId,
          reason: "session_completed",
          sessionId,
        }),
      );
    });

    it("should evolve when threshold is reached", () => {
      service = new CompanionService({
        id: "companion-1",
        userId,
        phase: "YOUNG",
        level: 99,
        totalFocusMinutes: 295,
        element: "FLAME",
        elementAffinity: 50,
        currentMood: "CONTENT",
        sessionProgress: 0,
        purityScore: 80,
        energyLevel: 60,
        visualSeed: 12345,
        colorHue: 0,
        particleDensity: 50,
        sessionCount: 5,
        perfectSessions: 1,
        longestFocusStreak: 10,
        nextEvolutionAt: 300,
        updatedAt: Date.now(),
      });
      const result = service.completeSession(10, 95, userId, sessionId);
      expect(result.evolved).toBe(true);
      expect(result.newPhase).toBe("MATURE");
      expect(eventBus.publish).toHaveBeenCalledWith(
        "companion:evolution",
        expect.objectContaining({
          userId,
          previousPhase: "YOUNG",
          newPhase: "MATURE",
          evolutionCeremony: true,
        }),
      );
    });

    it("should track perfect sessions", () => {
      service.completeSession(25, 95, userId, sessionId);
      const state = service.getState();
      expect(state?.perfectSessions).toBe(2);
    });

    it("should emit milestone events for significant achievements", () => {
      service = new CompanionService({
        id: "companion-1",
        userId,
        phase: "YOUNG",
        level: 9,
        totalFocusMinutes: 140,
        element: "FLAME",
        elementAffinity: 50,
        currentMood: "CONTENT",
        sessionProgress: 0,
        purityScore: 80,
        energyLevel: 60,
        visualSeed: 12345,
        colorHue: 0,
        particleDensity: 50,
        sessionCount: 9,
        perfectSessions: 1,
        longestFocusStreak: 10,
        nextEvolutionAt: 300,
        updatedAt: Date.now(),
      });
      service.completeSession(25, 85, userId, sessionId);
      expect(eventBus.publish).toHaveBeenCalledWith(
        "companion:milestone_reached",
        expect.objectContaining({
          userId,
          milestoneType: "sessions",
          value: 10,
          previousValue: 9,
        }),
      );
    });
  });
});
