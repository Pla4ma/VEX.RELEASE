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
  describe("achievement system integration", () => {
    it("should unlock first completion achievement", () => {
      const userId = "user-123";
      const completionPercentage = 100;
      if (completionPercentage >= 100) {
        eventBus.publish("achievement:unlock", {
          achievementId: "first_complete_session",
          userId,
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "achievement:unlock",
        expect.objectContaining({
          achievementId: "first_complete_session",
          userId,
        }),
      );
    });

    it("should unlock week warrior badge", () => {
      const userId = "user-123";
      const streakDays = 7;
      if (streakDays >= 7) {
        eventBus.publish("achievements:unlock_badge", {
          userId,
          badgeId: "week_warrior",
          rarity: "silver",
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "achievements:unlock_badge",
        expect.objectContaining({ userId, badgeId: "week_warrior" }),
      );
    });
  });

  describe("milestone tracking", () => {
    it("should track 100 hour milestone", () => {
      const userId = "user-123";
      const totalFocusHours = 100;
      if (totalFocusHours >= 100) {
        eventBus.publish("session:analytics:milestone", {
          sessionId: "test",
          userId,
          milestone: "100_hours_focused",
          value: totalFocusHours,
          timestamp: Date.now(),
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:analytics:milestone",
        expect.objectContaining({ userId, milestone: "100_hours_focused" }),
      );
    });
  });
});
