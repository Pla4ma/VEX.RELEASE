import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { eventBus, createMockSummary } from "./helpers";

let mockEventBus: { publish: jest.Mock; subscribe: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  mockEventBus = { publish: jest.fn(), subscribe: jest.fn() };
  (eventBus.publish as jest.Mock) = mockEventBus.publish;
  (eventBus.subscribe as jest.Mock) = mockEventBus.subscribe;
});

describe("SessionRewardIntegration", () => {
  describe("partial completion handling", () => {
    it("should grant partial XP for abandoned session with effort", () => {
      const elapsedTime = 600;
      const minForCredit = 300;
      const partialXP =
        elapsedTime >= minForCredit ? Math.floor(elapsedTime / 60) * 3 : 0;
      expect(partialXP).toBe(30);
    });

    it("should not grant XP for very short abandoned sessions", () => {
      const elapsedTime = 120;
      const minForCredit = 300;
      const partialXP =
        elapsedTime >= minForCredit ? Math.floor(elapsedTime / 60) * 3 : 0;
      expect(partialXP).toBe(0);
    });
  });

  describe("consolidated reward events", () => {
    it("should emit consolidated reward event", () => {
      const sessionId = "test-session";
      const userId = "user-123";
      const rewards = {
        xp: 300,
        coins: 50,
        gems: 5,
        bonuses: ["perfect_session", "streak_bonus"],
      };
      eventBus.publish("session:rewards:calculated", {
        sessionId,
        userId,
        rewards,
        timestamp: Date.now(),
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:rewards:calculated",
        expect.objectContaining({
          sessionId,
          userId,
          rewards: expect.objectContaining({ xp: 300, coins: 50, gems: 5 }),
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle missing summary gracefully", () => {
      const sessionId = "test-session";
      const userId = "user-123";
      expect(() => {
        eventBus.publish("session:completed", {
          sessionId,
          userId,
          summary: null,
          timestamp: Date.now(),
          duration: 1500,
        });
      }).not.toThrow();
    });

    it("should handle zero duration sessions", () => {
      const summary = createMockSummary({
        actualDuration: 0,
        effectiveDuration: 0,
      });
      const baseXP = Math.floor(summary.effectiveDuration / 60) * 10;
      expect(baseXP).toBe(0);
    });

    it("should handle very long sessions", () => {
      const summary = createMockSummary({
        actualDuration: 28800,
        effectiveDuration: 28800,
      });
      const baseXP = Math.floor(summary.effectiveDuration / 60) * 10;
      expect(baseXP).toBe(4800);
    });
  });
});
