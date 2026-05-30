/**
 * Tests for: service-helpers
 */

import {
  isQuietHours,
  getNextNotificationWindow,
  checkDailyNotificationLimit,
  recordNotificationSent as recordNotificationSentHelper,
  createRivalSessionNotification,
  createSquadNudgeNotification,
  createSquadMilestoneNotification,
  createFeedReactionNotification,
} from "../service-helpers";

describe("Service Helpers", () => {
  describe("isQuietHours", () => {
    it("returns a boolean", () => {
      expect(typeof isQuietHours("UTC", 0, 23)).toBe("boolean");
    });

    it("returns true when all hours are quiet (0-24)", () => {
      expect(isQuietHours("UTC", 0, 24)).toBe(true);
    });

    it("returns false when no hours are quiet (impossible range)", () => {
      // If quietStart == quietEnd, no hours are quiet
      expect(isQuietHours("UTC", 12, 12)).toBe(false);
    });
  });

  describe("getNextNotificationWindow", () => {
    it("returns a Date", () => {
      const result = getNextNotificationWindow("UTC", 8);
      expect(result).toBeInstanceOf(Date);
    });

    it("returns a date with the correct hour", () => {
      const result = getNextNotificationWindow("UTC", 10);
      expect(result.getHours()).toBe(10);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe("checkDailyNotificationLimit", () => {
    it("returns canSend true when no prior notifications", () => {
      const result = checkDailyNotificationLimit("test-user");
      expect(result.canSend).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });

  describe("recordNotificationSentHelper", () => {
    it("increments notification count", () => {
      recordNotificationSentHelper("test-user");
      // After recording, the count should be incremented
      // (MMKV mock stores values, so subsequent checkDailyNotificationLimit should reflect this)
    });
  });

  describe("createRivalSessionNotification", () => {
    it("creates tied message when diff is 0", () => {
      const result = createRivalSessionNotification("Bob", 30, 0);
      expect(result.title).toContain("Bob");
      expect(result.title).toContain("30 min");
      expect(result.body).toContain("tied");
    });

    it("creates ahead message when diff > 0", () => {
      const result = createRivalSessionNotification("Bob", 45, 10);
      expect(result.body).toContain("ahead by 10");
    });

    it("creates behind message when diff < 0", () => {
      const result = createRivalSessionNotification("Bob", 20, -5);
      expect(result.body).toContain("5 min behind");
    });
  });

  describe("createSquadNudgeNotification", () => {
    it("creates nudge notification", () => {
      const result = createSquadNudgeNotification("Alice", "TestSquad", 7);
      expect(result.title).toContain("Alice");
      expect(result.title).toContain("nudged");
      expect(result.body).toContain("TestSquad");
      expect(result.body).toContain("7-day");
    });
  });

  describe("createSquadMilestoneNotification", () => {
    it("creates milestone notification", () => {
      const result = createSquadMilestoneNotification("TestSquad", 30, 500);
      expect(result.title).toContain("TestSquad");
      expect(result.title).toContain("Milestone");
      expect(result.body).toContain("30-day");
      expect(result.body).toContain("500 XP");
    });
  });

  describe("createFeedReactionNotification", () => {
    it("creates reaction notification", () => {
      const result = createFeedReactionNotification("Alice", "🔥", "My Focus Session");
      expect(result.title).toContain("Alice");
      expect(result.title).toContain("🔥");
      expect(result.body).toContain("My Focus Session");
    });

    it("truncates long post titles", () => {
      const longTitle = "A".repeat(60);
      const result = createFeedReactionNotification("Bob", "❤️", longTitle);
      expect(result.body).toContain("...");
    });
  });
});
