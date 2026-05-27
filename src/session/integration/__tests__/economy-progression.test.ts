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
  describe("economy system integration", () => {
    it("should emit economy events for coins", () => {
      const userId = "user-123";
      const coins = 50;
      eventBus.publish("economy:add_currency", {
        userId,
        type: "coins",
        amount: coins,
        source: "session_completion",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "economy:add_currency",
        expect.objectContaining({ userId, type: "coins", amount: coins }),
      );
    });

    it("should emit economy events for gems", () => {
      const userId = "user-123";
      const gems = 5;
      eventBus.publish("economy:add_currency", {
        userId,
        type: "gems",
        amount: gems,
        source: "session_perfect_bonus",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "economy:add_currency",
        expect.objectContaining({ userId, type: "gems", amount: gems }),
      );
    });
  });

  describe("progression system integration", () => {
    it("should emit XP addition events", () => {
      const userId = "user-123";
      const xp = 300;
      eventBus.publish("progression:add_xp", {
        userId,
        amount: xp,
        source: "session_completion",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "progression:add_xp",
        expect.objectContaining({
          userId,
          amount: xp,
          source: "session_completion",
        }),
      );
    });

    it("should emit detailed XP events for level tracking", () => {
      const userId = "user-123";
      const xp = 300;
      eventBus.publish("progression:xp_added", {
        userId,
        amount: xp,
        source: "session_completion",
        totalXP: 0,
        currentLevel: 0,
        progressPercent: 0,
        streakBonus: 0,
        boostBonus: 0,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "progression:xp_added",
        expect.objectContaining({ userId, amount: xp }),
      );
    });
  });
});
