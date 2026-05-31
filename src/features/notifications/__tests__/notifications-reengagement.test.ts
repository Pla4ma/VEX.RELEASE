/**
 * Tests for: reengagement
 */

import {
  RE_ENGAGEMENT_STAGES,
  getReEngagementMessage,
  shouldReEngage,
} from "../SmartNotificationSystem.reengagement";
import { notificationHistory, scheduledNotifications } from "../SmartNotificationSystem";

beforeEach(() => {
  jest.clearAllMocks();
  notificationHistory.clear();
  scheduledNotifications.clear();
});

describe("Reengagement", () => {
  it("exports 4 reengagement stages", () => {
    expect(RE_ENGAGEMENT_STAGES).toHaveLength(4);
    expect(RE_ENGAGEMENT_STAGES[0].dayThreshold).toBe(3);
    expect(RE_ENGAGEMENT_STAGES[3].dayThreshold).toBe(30);
  });

  describe("getReEngagementMessage", () => {
    it("returns null for < 3 days inactive", () => {
      expect(getReEngagementMessage(1)).toBeNull();
      expect(getReEngagementMessage(2)).toBeNull();
    });

    it("returns 3-day stage for 3-6 days", () => {
      const result = getReEngagementMessage(3);
      expect(result).not.toBeNull();
      expect(result!.dayThreshold).toBe(3);
    });

    it("returns 7-day stage for 7-13 days", () => {
      const result = getReEngagementMessage(10);
      expect(result).not.toBeNull();
      expect(result!.dayThreshold).toBe(7);
    });

    it("returns 14-day stage for 14-29 days", () => {
      const result = getReEngagementMessage(20);
      expect(result).not.toBeNull();
      expect(result!.dayThreshold).toBe(14);
    });

    it("returns 30-day stage for 30+ days", () => {
      const result = getReEngagementMessage(30);
      expect(result).not.toBeNull();
      expect(result!.dayThreshold).toBe(30);
      expect(result!.offerIncentive).toBe(true);
    });
  });

  describe("shouldReEngage", () => {
    it("returns false for < 3 days inactive", () => {
      expect(shouldReEngage("user-1", 1)).toBe(false);
    });

    it("returns false when hasBeenNotified is true", () => {
      expect(shouldReEngage("user-1", 5, true)).toBe(false);
    });

    it("returns true for eligible user with no history", () => {
      expect(shouldReEngage("new-user", 5)).toBe(true);
    });

    it("returns false when reengaged recently (within 7 days)", () => {
      notificationHistory.set("recent-user", [
        {
          id: "notif-1", userId: "recent-user", type: "RE_ENGAGEMENT",
          priority: "HIGH", title: "t", body: "b",
          scheduledAt: Date.now(), sentAt: Date.now() - 86400000, // 1 day ago
        },
      ]);
      expect(shouldReEngage("recent-user", 10)).toBe(false);
    });

    it("returns true when last reengagement was > 7 days ago", () => {
      notificationHistory.set("old-user", [
        {
          id: "notif-1", userId: "old-user", type: "RE_ENGAGEMENT",
          priority: "HIGH", title: "t", body: "b",
          scheduledAt: Date.now(), sentAt: Date.now() - 10 * 86400000, // 10 days ago
        },
      ]);
      expect(shouldReEngage("old-user", 10)).toBe(true);
    });
  });
});
