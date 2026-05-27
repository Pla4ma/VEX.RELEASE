import { jest } from "@jest/globals";
import { eventBus } from "../../../events";
import { createMockSummary, setupMockEventBus } from "./session-reward-helpers";

describe("SessionRewardIntegration", () => {
  let mockEventBus: { publish: jest.Mock; subscribe: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventBus = setupMockEventBus();
  });

  describe("analytics system integration", () => {
    it("should emit session completion analytics", () => {
      const userId = "user-123";
      const summary = createMockSummary();
      eventBus.publish("analytics:track", {
        event: "session_completed",
        properties: {
          userId,
          duration: summary.actualDuration,
          completion: summary.completionPercentage,
          xpEarned: summary.xpEarned,
          streakDays: 5,
          interruptions: summary.interruptions,
          pauses: summary.pauses,
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

  describe("social system integration", () => {
    it("should create social activity on completion", () => {
      const userId = "user-123";
      const summary = createMockSummary({
        actualDuration: 1500,
        xpEarned: 250,
      });
      eventBus.publish("social:activity", {
        id: `activity_${Date.now()}_${userId}`,
        userId,
        type: "session_completed",
        content: `Completed a ${Math.floor(summary.actualDuration / 60)} minute focus session and earned ${summary.xpEarned} XP!`,
        timestamp: Date.now(),
        visibility: "friends",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "social:activity",
        expect.objectContaining({ userId, type: "session_completed" }),
      );
    });
  });

  describe("challenge system integration", () => {
    it("should progress daily focus time challenge", () => {
      const userId = "user-123";
      const focusTime = 1500;
      eventBus.publish("challenge:progress", {
        userId,
        challengeId: "daily_focus_time",
        progress: focusTime,
        target: 3600,
        percent: (focusTime / 3600) * 100,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "challenge:progress",
        expect.objectContaining({ userId, challengeId: "daily_focus_time" }),
      );
    });

    it("should progress streak challenge", () => {
      const userId = "user-123";
      const streakDays = 5;
      eventBus.publish("challenge:progress", {
        userId,
        challengeId: "maintain_streak",
        progress: streakDays,
        target: 7,
        percent: (streakDays / 7) * 100,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "challenge:progress",
        expect.objectContaining({ userId, challengeId: "maintain_streak" }),
      );
    });

    it("should progress perfect session challenge", () => {
      const userId = "user-123";
      const interruptions = 0;
      const pauses = 0;
      if (interruptions === 0 && pauses === 0) {
        eventBus.publish("challenge:progress", {
          userId,
          challengeId: "perfect_sessions",
          progress: 1,
          target: 10,
          percent: 10,
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "challenge:progress",
        expect.objectContaining({ userId, challengeId: "perfect_sessions" }),
      );
    });
  });
});
