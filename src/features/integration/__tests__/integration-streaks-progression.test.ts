/**
 * Integration tests — streaks-progression.ts
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  mockProgression,
  fireEvent,
} from "./integration-setup";
import { initializeStreaksProgressionIntegration } from "../streaks-progression";

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe("streaks-progression.ts", () => {
    it("subscribes to social:streak_milestone and streak:updated", () => {
      const unsub = initializeStreaksProgressionIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "social:streak_milestone",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "streak:updated",
        expect.any(Function),
      );
      unsub();
    });

    it("awards streak XP on streak:updated when streak > 0", () => {
      const unsub = initializeStreaksProgressionIntegration();
      fireEvent("streak:updated", {
        userId: "u1",
        state: { currentStreak: 5 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockProgression.addXpEnhanced).toHaveBeenCalledWith(
            "u1",
            expect.objectContaining({ amount: 5, source: "STREAK_BONUS" }),
            { skipEvents: true },
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("does NOT award XP on streak:updated when streak is 0", () => {
      const unsub = initializeStreaksProgressionIntegration();
      fireEvent("streak:updated", {
        userId: "u1",
        state: { currentStreak: 0 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockProgression.addXpEnhanced).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it("calls addXpEnhanced on streak_milestone with calculated XP", () => {
      const unsub = initializeStreaksProgressionIntegration();
      fireEvent("social:streak_milestone", { userId: "u1", streak: 7 });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockProgression.calculateXpBreakdown).toHaveBeenCalled();
          expect(mockProgression.addXpEnhanced).toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });
  });
});
