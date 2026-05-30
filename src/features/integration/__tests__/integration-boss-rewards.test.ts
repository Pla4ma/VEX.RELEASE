/**
 * Integration tests — boss-rewards.ts
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  mockRewards,
  fireEvent,
} from "./integration-setup";
import { initializeBossRewardsIntegration } from "../boss-rewards";

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe("boss-rewards.ts", () => {
    it("subscribes to boss:defeated event", () => {
      const unsub = initializeBossRewardsIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "boss:defeated",
        expect.any(Function),
      );
      unsub();
    });

    it("creates XP reward when boss defeated with xp > 0", () => {
      const unsub = initializeBossRewardsIntegration();
      fireEvent("boss:defeated", {
        userId: "u1",
        bossId: "boss-1",
        won: true,
        rewards: { xp: 200 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({
              userId: "u1",
              type: "XP",
              amount: 200,
              triggerType: "BOSS_DEFEAT",
              triggerId: "boss-1",
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("skips reward when won is false", () => {
      const unsub = initializeBossRewardsIntegration();
      fireEvent("boss:defeated", {
        userId: "u1",
        bossId: "boss-1",
        won: false,
        rewards: { xp: 200 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it("skips reward when xp is 0", () => {
      const unsub = initializeBossRewardsIntegration();
      fireEvent("boss:defeated", {
        userId: "u1",
        bossId: "boss-1",
        won: true,
        rewards: { xp: 0 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });
  });
});
