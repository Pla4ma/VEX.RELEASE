/**
 * Integration tests — streaks-rewards.ts
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  mockStreaks,
  fireEvent,
} from "./integration-setup";
import { initializeStreaksRewardsIntegration } from "../streaks-rewards";

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe("streaks-rewards.ts", () => {
    it("subscribes to social:streak_milestone and streak:broken", () => {
      const unsub = initializeStreaksRewardsIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "social:streak_milestone",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "streak:broken",
        expect.any(Function),
      );
      unsub();
    });

    it("handles streak:broken event without throwing", () => {
      const unsub = initializeStreaksRewardsIntegration();
      expect(() =>
        fireEvent("streak:broken", { userId: "u1" }),
      ).not.toThrow();
      unsub();
    });

    it("ignores streak_milestone with null event", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", null);
      expect(mockStreaks.checkMilestone).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores streak_milestone with no streak field", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", { userId: "u1" });
      expect(mockStreaks.checkMilestone).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores streak_milestone with no userId", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", { streak: 5 });
      expect(mockStreaks.checkMilestone).not.toHaveBeenCalled();
      unsub();
    });

    it("calls checkMilestone when streak and userId present", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", { userId: "u1", streak: 7 });
      expect(mockStreaks.checkMilestone).toHaveBeenCalledWith(7);
      unsub();
    });
  });
});
