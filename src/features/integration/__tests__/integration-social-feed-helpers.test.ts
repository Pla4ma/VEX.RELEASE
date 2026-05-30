/**
 * Integration tests — social-feed-helpers.ts pure utility functions
 */

import {
  mockActiveSubscribers,
  mockEventBus,
} from "./integration-setup";
import {
  getNotificationTitle,
  getNotificationBody,
  generateId,
  awardCompetitionRewards,
} from "../social-feed-helpers";

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe("social-feed-helpers.ts – notification titles / bodies / generateId", () => {
    const base = {
      userId: "u",
      visibility: "PUBLIC" as const,
      data: {},
    };

    it("getNotificationTitle returns correct title for known types", () => {
      expect(
        getNotificationTitle({ ...base, activityType: "STREAK_MILESTONE" }),
      ).toContain("Streak");
      expect(
        getNotificationTitle({ ...base, activityType: "LEVEL_UP" }),
      ).toContain("Level");
      expect(
        getNotificationTitle({ ...base, activityType: "BOSS_DEFEAT" }),
      ).toContain("Boss");
      expect(
        getNotificationTitle({ ...base, activityType: "PODIUM_FINISH" }),
      ).toContain("Podium");
      expect(
        getNotificationTitle({ ...base, activityType: "RARE_ITEM_ACQUIRED" }),
      ).toContain("Rare");
    });

    it("getNotificationTitle returns default for unknown types", () => {
      expect(
        getNotificationTitle({ ...base, activityType: "UNKNOWN" }),
      ).toBe("New Activity");
    });

    it("getNotificationBody returns streak-specific body", () => {
      expect(
        getNotificationBody({
          ...base,
          activityType: "STREAK_MILESTONE",
          data: { streakDays: 7 },
        }),
      ).toContain("7-day streak");
    });

    it("getNotificationBody returns level-specific body", () => {
      expect(
        getNotificationBody({
          ...base,
          activityType: "LEVEL_UP",
          data: { level: 5 },
        }),
      ).toContain("5");
    });

    it("getNotificationBody returns boss-specific body", () => {
      expect(
        getNotificationBody({
          ...base,
          activityType: "BOSS_DEFEAT",
          data: { bossName: "Shadow Dragon" },
        }),
      ).toContain("Shadow Dragon");
    });

    it("getNotificationBody returns default for unknown types", () => {
      expect(
        getNotificationBody({ ...base, activityType: "SOMETHING_ELSE" }),
      ).toBe("Check out the app for details!");
    });

    it("generateId returns a unique non-empty string", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(typeof id1).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
      expect(id1).not.toBe(id2);
    });
  });

  describe("social-feed-helpers.ts – awardCompetitionRewards", () => {
    it("awards GEMS + TITLE for rank 1", async () => {
      await awardCompetitionRewards({
        userId: "u1",
        leaderboardId: "lb-1",
        rank: 1,
        score: 1000,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u1",
          rewardType: "GEMS",
          amount: 100,
          source: "COMPETITION",
        }),
      );
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u1",
          rewardType: "TITLE",
          amount: 1,
          source: "COMPETITION",
        }),
      );
    });

    it("awards 50 GEMS for rank 2", async () => {
      await awardCompetitionRewards({
        userId: "u2",
        leaderboardId: "lb-1",
        rank: 2,
        score: 900,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u2",
          rewardType: "GEMS",
          amount: 50,
        }),
      );
    });

    it("awards 25 GEMS for rank 3", async () => {
      await awardCompetitionRewards({
        userId: "u3",
        leaderboardId: "lb-1",
        rank: 3,
        score: 800,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u3",
          rewardType: "GEMS",
          amount: 25,
        }),
      );
    });

    it("awards 10 GEMS for top 10% (rank 4 of 50)", async () => {
      await awardCompetitionRewards({
        userId: "u4",
        leaderboardId: "lb-1",
        rank: 4,
        score: 700,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u4",
          rewardType: "GEMS",
          amount: 10,
        }),
      );
    });

    it("awards no rewards for rank below top 10%", async () => {
      await awardCompetitionRewards({
        userId: "u5",
        leaderboardId: "lb-1",
        rank: 20,
        score: 400,
        participants: 50,
      });
      const grantCalls = mockEventBus.eventBus.publish.mock.calls.filter(
        (c: unknown[]) => c[0] === "economy:grant_reward",
      );
      expect(grantCalls).toHaveLength(0);
    });
  });
});
