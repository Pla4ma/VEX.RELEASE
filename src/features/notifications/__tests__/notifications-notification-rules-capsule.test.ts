import { makeServiceCtx } from "./notifications-test-setup";
import {
  shouldNotifyChestFull,
  shouldNotifyChallengeExpiring,
  shouldNotifySeasonEnding,
  evaluateNotificationRules,
} from "../notification-rules";

describe("Notification Rules", () => {
  describe("shouldNotifyChestFull", () => {
    it("returns false when no chest status", () => {
      expect(shouldNotifyChestFull(makeServiceCtx({ chestStatus: undefined })).shouldSend).toBe(false);
    });

    it("returns false when chests not full", () => {
      expect(shouldNotifyChestFull(makeServiceCtx({
        chestStatus: { unopenedCount: 3, maxCapacity: 5 },
      })).shouldSend).toBe(false);
    });

    it("returns true when chests are full", () => {
      const result = shouldNotifyChestFull(makeServiceCtx({
        chestStatus: { unopenedCount: 5, maxCapacity: 5 },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(5);
    });
  });

  describe("shouldNotifyChallengeExpiring", () => {
    it("returns false when no challenge expiry", () => {
      expect(shouldNotifyChallengeExpiring(makeServiceCtx({ challengeExpiry: undefined })).shouldSend).toBe(false);
    });

    it("returns false when > 2 hours remaining", () => {
      expect(shouldNotifyChallengeExpiring(makeServiceCtx({
        challengeExpiry: { challengeName: "Speed Run", hoursRemaining: 3, progressPercent: 20 },
      })).shouldSend).toBe(false);
    });

    it("returns false when progress >= 50%", () => {
      expect(shouldNotifyChallengeExpiring(makeServiceCtx({
        challengeExpiry: { challengeName: "Speed Run", hoursRemaining: 1, progressPercent: 60 },
      })).shouldSend).toBe(false);
    });

    it("returns true when challenge expiring with low progress", () => {
      const result = shouldNotifyChallengeExpiring(makeServiceCtx({
        challengeExpiry: { challengeName: "Speed Run", hoursRemaining: 1, progressPercent: 30 },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(4);
    });
  });

  describe("shouldNotifySeasonEnding", () => {
    it("returns false when no season ending", () => {
      expect(shouldNotifySeasonEnding(makeServiceCtx({ seasonEnding: undefined })).shouldSend).toBe(false);
    });

    it("returns false when > 24 hours remaining", () => {
      expect(shouldNotifySeasonEnding(makeServiceCtx({
        seasonEnding: { hoursRemaining: 48, unclaimedTiers: 3 },
      })).shouldSend).toBe(false);
    });

    it("returns false when no unclaimed tiers", () => {
      expect(shouldNotifySeasonEnding(makeServiceCtx({
        seasonEnding: { hoursRemaining: 12, unclaimedTiers: 0 },
      })).shouldSend).toBe(false);
    });

    it("returns true when season ending with unclaimed tiers", () => {
      const result = shouldNotifySeasonEnding(makeServiceCtx({
        seasonEnding: { hoursRemaining: 12, unclaimedTiers: 5 },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(8);
      expect(result.message.title).toContain("Season Ending");
    });
  });

  describe("evaluateNotificationRules", () => {
    it("returns shouldSend false when no rules match", () => {
      const result = evaluateNotificationRules(makeServiceCtx({
        streakRisk: undefined,
        bossEscape: undefined,
        squadStreak: undefined,
        rivalUpdate: undefined,
        chestStatus: undefined,
        challengeExpiry: undefined,
        seasonEnding: undefined,
      }));
      expect(result.shouldSend).toBe(false);
    });

    it("selects highest priority rule when multiple match", () => {
      const result = evaluateNotificationRules(makeServiceCtx({
        streakRisk: { hoursRemaining: 1, streakDays: 10, riskLevel: "CRITICAL" },
        bossEscape: { bossName: "Dragon", hoursRemaining: 2, healthPercent: 15 },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.notification!.priority).toBe(10); // streak has highest
    });
  });
});
