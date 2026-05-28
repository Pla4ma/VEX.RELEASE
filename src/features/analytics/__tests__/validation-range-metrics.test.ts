import { describe, it, expect } from "@jest/globals";
import {
  validateTimeRange,
  validateMetrics,
} from "../validation";

describe("Analytics Validation - Time Range & Metrics", () => {
  describe("validateTimeRange", () => {
    it("should validate correct time range", () => {
      const now = Date.now();
      const start = now - 7 * 24 * 60 * 60 * 1000;
      const result = validateTimeRange(start, now);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toBeDefined();
      const sanitized = result.sanitized as { rangeDays: number } | undefined;
      expect(sanitized?.rangeDays).toBe(7);
    });
    it("should reject inverted range", () => {
      const now = Date.now();
      const result = validateTimeRange(now, now - 1000);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVERTED_RANGE");
    });
    it("should reject range exceeding maximum", () => {
      const now = Date.now();
      const start = now - 400 * 24 * 60 * 60 * 1000;
      const result = validateTimeRange(start, now, 365);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("RANGE_TOO_LARGE");
    });
    it("should warn about future dates", () => {
      const now = Date.now();
      const future = now + 24 * 60 * 60 * 1000;
      const result = validateTimeRange(now, future);
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe("FUTURE_DATE");
    });
    it("should reject invalid timestamps", () => {
      const result = validateTimeRange(-1, Date.now());
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_TIMESTAMP");
    });
    it("should warn about very old data", () => {
      const now = Date.now();
      const old = now - 400 * 24 * 60 * 60 * 1000;
      const result = validateTimeRange(old, now, 500);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === "VERY_OLD_DATA")).toBe(
        true,
      );
    });
  });

  describe("validateMetrics", () => {
    it("should validate valid metrics", () => {
      const result = validateMetrics(["sessions_completed", "xp_earned"]);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    it("should reject empty metrics", () => {
      const result = validateMetrics([]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("EMPTY_SELECTION");
    });
    it("should reject invalid metrics", () => {
      const result = validateMetrics(["sessions_completed", "invalid_metric"]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_METRICS");
    });
    it("should warn about too many metrics", () => {
      const result = validateMetrics([
        "sessions_completed",
        "xp_earned",
        "streak_days",
        "boss_damage_dealt",
        "items_crafted",
        "coins_spent",
        "challenges_completed",
        "sessions_abandoned",
        "total_focus_time",
        "average_session_duration",
        "longest_streak",
      ]);
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe("TOO_MANY_METRICS");
    });
    it("should warn about duplicates", () => {
      const result = validateMetrics([
        "sessions_completed",
        "sessions_completed",
      ]);
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe("DUPLICATE_METRIC");
    });
  });
});
