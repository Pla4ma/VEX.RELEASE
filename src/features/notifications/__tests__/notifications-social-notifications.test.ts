/**
 * Tests for: social-notifications
 */

import { mockFrom } from "./notifications-test-setup";
import { dispatchSocialNotification } from "../social-notifications";

describe("Social Notifications", () => {
  describe("dispatchSocialNotification", () => {
    it("returns 0 sent when actor is same as recipient", async () => {
      const result = await dispatchSocialNotification({
        type: "FEED_REACTION",
        recipientUserId: "user-1",
        actorUserId: "user-1",
        actorName: "Self",
        data: {},
      });
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(0);
    });

    it("returns 0 sent when no push tokens found", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await dispatchSocialNotification({
        type: "NEW_FOLLOWER",
        recipientUserId: "user-2",
        actorUserId: "user-1",
        actorName: "Alice",
        data: {},
      });
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(0);
    });
  });
});
