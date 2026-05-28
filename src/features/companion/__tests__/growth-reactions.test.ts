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

describe("Companion Reactions", () => {
  let service: CompanionService;
  const userId = "test-user";

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

  describe("Streak Maintenance Reaction", () => {
    it("should react positively to streak maintenance", () => {
      const previousMood = service.getState()?.currentMood;
      const previousEnergy = service.getState()?.energyLevel;
      service.reactToStreakMaintained(userId);
      const state = service.getState();
      expect(state?.currentMood).toBe("ECSTATIC");
      expect(state?.energyLevel).toBe(
        Math.min(100, (previousEnergy || 0) + 20),
      );
      expect(state?.level).toBeGreaterThan(10);
      expect(eventBus.publish).toHaveBeenCalledWith(
        "companion:state_changed",
        expect.objectContaining({
          userId,
          reason: "streak_maintained",
          newMood: "ECSTATIC",
        }),
      );
    });
  });

  describe("Comeback Completion Reaction", () => {
    it("should react strongly to comeback completion", () => {
      const previousEnergy = service.getState()?.energyLevel;
      service.reactToComebackCompleted(userId);
      const state = service.getState();
      expect(state?.currentMood).toBe("DETERMINED");
      expect(state?.energyLevel).toBe(
        Math.min(100, (previousEnergy || 0) + 30),
      );
      expect(state?.level).toBeGreaterThan(10);
      expect(eventBus.publish).toHaveBeenCalledWith(
        "companion:state_changed",
        expect.objectContaining({
          userId,
          reason: "comeback_completed",
          newMood: "DETERMINED",
        }),
      );
    });
  });

  describe("Focus Score Change Reaction", () => {
    it("should react positively to score increase", () => {
      const previousEnergy = service.getState()?.energyLevel;
      service.reactToFocusScoreChanged(userId, 600, 650);
      const state = service.getState();
      expect(state?.currentMood).toBe("FOCUSED");
      expect(state?.energyLevel).toBe(
        Math.min(100, (previousEnergy || 0) + 15),
      );
      expect(state?.level).toBeGreaterThan(10);
      expect(eventBus.publish).toHaveBeenCalledWith(
        "companion:state_changed",
        expect.objectContaining({
          userId,
          reason: "focus_score_changed",
          newMood: "FOCUSED",
        }),
      );
    });

    it("should react ecstatically to high score increase", () => {
      service.reactToFocusScoreChanged(userId, 600, 750);
      const state = service.getState();
      expect(state?.currentMood).toBe("ECSTATIC");
    });

    it("should react calmly to score decrease", () => {
      const previousEnergy = service.getState()?.energyLevel;
      service.reactToFocusScoreChanged(userId, 650, 550);
      const state = service.getState();
      expect(state?.currentMood).toBe("CONTENT");
      expect(state?.energyLevel).toBe(Math.max(0, (previousEnergy || 0) - 10));
    });
  });

  describe("Daily Mission Completion Reaction", () => {
    it("should react positively to daily mission completion", () => {
      const previousEnergy = service.getState()?.energyLevel;
      service.reactToDailyMissionCompleted(userId);
      const state = service.getState();
      expect(state?.currentMood).toBe("CONTENT");
      expect(state?.energyLevel).toBe(
        Math.min(100, (previousEnergy || 0) + 10),
      );
      expect(state?.level).toBeGreaterThan(10);
      expect(eventBus.publish).toHaveBeenCalledWith(
        "companion:state_changed",
        expect.objectContaining({
          userId,
          reason: "daily_mission_completed",
          newMood: "CONTENT",
        }),
      );
    });
  });

  describe("Offline and Error Handling", () => {
    it("should handle reactions without state gracefully", () => {
      const emptyService = new CompanionService();
      expect(() => emptyService.reactToStreakMaintained(userId)).not.toThrow();
      expect(() => emptyService.reactToComebackCompleted(userId)).not.toThrow();
      expect(() =>
        emptyService.reactToFocusScoreChanged(userId, 600, 650),
      ).not.toThrow();
      expect(() =>
        emptyService.reactToDailyMissionCompleted(userId),
      ).not.toThrow();
    });

    it("should handle session completion without state gracefully", () => {
      const emptyService = new CompanionService();
      const result = emptyService.completeSession(25, 85, userId, "test-session");
      expect(result.leveledUp).toBe(false);
      expect(result.evolved).toBe(false);
    });
  });
});
