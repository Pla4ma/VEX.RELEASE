/**
 * Tests for: hooks
 */

import { notificationKeys } from "../hooks";

describe("Hooks", () => {
  describe("notificationKeys", () => {
    it("has correct base key", () => {
      expect(notificationKeys.all).toEqual(["notifications"]);
    });

    it("generates unreadCount key with userId", () => {
      const key = notificationKeys.unreadCount("user-1");
      expect(key).toEqual(["notifications", "unread-count", "user-1"]);
    });
  });
});
