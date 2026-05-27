import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { eventBus } from "./helpers";

let mockEventBus: { publish: jest.Mock; subscribe: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  mockEventBus = { publish: jest.fn(), subscribe: jest.fn() };
  (eventBus.publish as jest.Mock) = mockEventBus.publish;
  (eventBus.subscribe as jest.Mock) = mockEventBus.subscribe;
});

describe("SessionRewardIntegration", () => {
  describe("streak system integration", () => {
    it("should emit streak update events", () => {
      const userId = "user-123";
      const streakDays = 5;
      eventBus.publish("streak:updated", {
        userId,
        state: { currentStreak: streakDays + 1 },
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "streak:updated",
        expect.objectContaining({
          userId,
          state: expect.objectContaining({ currentStreak: 6 }),
        }),
      );
    });

    it("should emit streak broken events", () => {
      const userId = "user-123";
      const previousStreak = 10;
      eventBus.publish("streak:broken", {
        userId,
        previousStreak,
        wasComeback: false,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "streak:broken",
        expect.objectContaining({ userId, previousStreak: 10 }),
      );
    });

    it("should emit social streak milestone events", () => {
      const userId = "user-123";
      const streakDays = 7;
      eventBus.publish("social:streak_milestone", {
        userId,
        streak: streakDays,
        milestone: streakDays,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "social:streak_milestone",
        expect.objectContaining({ userId, streak: 7, milestone: 7 }),
      );
    });
  });

  describe("analytics system integration", () => {
    it("should emit session completion analytics", () => {
      const userId = "user-123";
      eventBus.publish("analytics:track", {
        event: "session_completed",
        properties: {
          userId,
          duration: 1500,
          completion: 100,
          xpEarned: 250,
          streakDays: 5,
          interruptions: 0,
          pauses: 0,
        },
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "analytics:track",
        expect.objectContaining({ event: "session_completed" }),
      );
    });

    it("should emit engagement metrics", () => {
      const userId = "user-123";
      const focusTime = 1500;
      eventBus.publish("session:analytics:engagement", {
        sessionId: "test",
        userId,
        metric: "focus_time",
        value: focusTime,
        timestamp: Date.now(),
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:analytics:engagement",
        expect.objectContaining({
          userId,
          metric: "focus_time",
          value: focusTime,
        }),
      );
    });
  });
});
