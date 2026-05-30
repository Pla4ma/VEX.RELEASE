/**
 * Tests for: scheduler
 */

import { mockFrom } from "./notifications-test-setup";
import {
  analyzePeakFocusWindow,
  isInPeakWindow,
} from "../SmartNotificationScheduler";
import { DEFAULT_PEAK_HOUR } from "../SmartNotificationScheduler-types";

describe("SmartNotificationScheduler", () => {
  describe("analyzePeakFocusWindow", () => {
    it("returns default result on supabase error", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: null,
                  error: new Error("DB error"),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await analyzePeakFocusWindow("user-1");
      expect(result.peakHour).toBe(DEFAULT_PEAK_HOUR);
      expect(result.confidence).toBe(0);
      expect(result.pattern).toBe("NEW");
    });

    it("returns default result on empty sessions", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await analyzePeakFocusWindow("user-1");
      expect(result.sessionCount).toBe(0);
      expect(result.pattern).toBe("NEW");
    });
  });

  describe("isInPeakWindow", () => {
    it("returns true when current hour equals peak hour", () => {
      const now = new Date();
      expect(isInPeakWindow(now.getHours())).toBe(true);
    });

    it("returns true when within default window size (2)", () => {
      const now = new Date();
      const currentHour = now.getHours();
      // Avoid midnight wraparound: use subtraction when near end of day
      const hour = currentHour > 0 ? currentHour - 1 : currentHour + 1;
      expect(isInPeakWindow(hour)).toBe(true);
    });

    it("returns false when outside window", () => {
      const now = new Date();
      const hour = (now.getHours() + 10) % 24;
      expect(isInPeakWindow(hour)).toBe(false);
    });

    it("respects custom window size", () => {
      const now = new Date();
      const currentHour = now.getHours();
      // Avoid midnight wraparound: ensure diff is exactly 3
      const hour = currentHour <= 20 ? currentHour + 3 : currentHour - 3;
      expect(isInPeakWindow(hour, 2)).toBe(false);
      expect(isInPeakWindow(hour, 3)).toBe(true);
    });
  });
});
