/**
 * Tests for: analytics
 */

import { mockTrack } from "./notifications-test-setup";
import { addBreadcrumb } from "../../../config/sentry";
import {
  NotificationEventTypeSchema,
  NotificationTypeSchema,
  trackNotificationOpened,
  trackNotificationDelivered,
  trackNotificationDismissed,
  trackNotificationScheduled,
  trackNotificationPermission,
} from "../analytics";

describe("Analytics", () => {
  describe("NotificationEventTypeSchema", () => {
    it("accepts all valid event types", () => {
      expect(NotificationEventTypeSchema.parse("opened")).toBe("opened");
      expect(NotificationEventTypeSchema.parse("delivered")).toBe("delivered");
      expect(NotificationEventTypeSchema.parse("dismissed")).toBe("dismissed");
    });

    it("rejects invalid event type", () => {
      expect(() => NotificationEventTypeSchema.parse("invalid")).toThrow();
    });
  });

  describe("NotificationTypeSchema", () => {
    it("accepts all valid notification types", () => {
      const types = [
        "streak_reminder", "session_prompt", "challenge_reminder",
        "level_up", "boss_timeout_warning", "welcome_back", "comeback",
        "RETENTION_ONBOARDING_DAY_1", "RETENTION_ONBOARDING_DAY_3",
        "RETENTION_ONBOARDING_DAY_7", "RETENTION_STREAK_PROTECTION",
        "RETENTION_RE_ENGAGEMENT", "RETENTION_CHALLENGE_EXPIRY",
      ];
      for (const type of types) {
        expect(NotificationTypeSchema.parse(type)).toBe(type);
      }
    });
  });

  describe("trackNotificationOpened", () => {
    it("tracks opened event with valid type", () => {
      trackNotificationOpened("streak_reminder", "user-1", "notif-1");
      expect(mockTrack).toHaveBeenCalledWith(
        "notification_opened",
        expect.objectContaining({
          notification_type: "streak_reminder",
          user_id: "user-1",
        }),
      );
      expect(addBreadcrumb).toHaveBeenCalled();
    });

    it("catches invalid type gracefully", () => {
      expect(() => trackNotificationOpened("INVALID_TYPE", "user-1", "notif-1")).not.toThrow();
    });
  });

  describe("trackNotificationDelivered", () => {
    it("tracks delivered event", () => {
      trackNotificationDelivered("session_prompt", "user-1");
      expect(mockTrack).toHaveBeenCalledWith(
        "notification_delivered",
        expect.objectContaining({ notification_type: "session_prompt" }),
      );
    });
  });

  describe("trackNotificationDismissed", () => {
    it("tracks dismissed event", () => {
      trackNotificationDismissed("comeback", "user-1");
      expect(mockTrack).toHaveBeenCalledWith(
        "notification_dismissed",
        expect.objectContaining({ notification_type: "comeback" }),
      );
    });
  });

  describe("trackNotificationScheduled", () => {
    it("tracks scheduled event", () => {
      trackNotificationScheduled("streak_reminder", "user-1", Date.now());
      expect(mockTrack).toHaveBeenCalledWith(
        "notification_scheduled",
        expect.objectContaining({ notification_type: "streak_reminder" }),
      );
    });
  });

  describe("trackNotificationPermission", () => {
    it("tracks permission granted", () => {
      trackNotificationPermission("user-1", true, "onboarding");
      expect(mockTrack).toHaveBeenCalledWith(
        "notification_permission",
        expect.objectContaining({ granted: true, source: "onboarding" }),
      );
    });

    it("tracks permission denied", () => {
      trackNotificationPermission("user-1", false, "settings");
      expect(mockTrack).toHaveBeenCalledWith(
        "notification_permission",
        expect.objectContaining({ granted: false, source: "settings" }),
      );
    });
  });
});
