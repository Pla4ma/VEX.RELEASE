import { describe, expect, it } from "@jest/globals";
import {
  toDateKey,
  mapSessionModeToTargetMode,
  buildNextPromiseInput,
  isMatchOrBetter,
  MinimumPromiseMinutes,
} from "../service-helpers";

const basePromise = {
  createdAt: "2026-05-20T10:00:00.000Z",
  fulfilledAt: null,
  id: "550e8400-e29b-41d4-a716-446655440001",
  missedAt: null,
  sourceSessionId: "550e8400-e29b-41d4-a716-446655440002",
  status: "pending" as const,
  targetDate: "2026-05-21",
  targetDurationMinutes: 25,
  targetMode: "FOCUS" as const,
  userId: "user-123",
};

// ── service-helpers ────────────────────────────────────────────────────
describe("service-helpers", () => {
  describe("toDateKey", () => {
    it("formats a UTC timestamp as YYYY-MM-DD", () => {
      const ts = Date.parse("2026-05-20T12:00:00.000Z");
      const key = toDateKey(ts, "UTC");
      expect(key).toBe("2026-05-20");
    });

    it("respects timezone for date boundary", () => {
      // 2026-05-20T03:00:00 UTC is still 2026-05-19 in America/New_York (EDT = UTC-4)
      const ts = Date.parse("2026-05-20T03:00:00.000Z");
      const key = toDateKey(ts, "America/New_York");
      expect(key).toBe("2026-05-19");
    });

    it("handles midnight boundary in UTC", () => {
      const ts = Date.parse("2026-05-20T00:00:00.000Z");
      expect(toDateKey(ts, "UTC")).toBe("2026-05-20");
    });
  });

  describe("mapSessionModeToTargetMode", () => {
    it("maps RECOVERY to RECOVERY", () => {
      expect(mapSessionModeToTargetMode("RECOVERY")).toBe("RECOVERY");
    });
    it("maps STUDY to STUDY", () => {
      expect(mapSessionModeToTargetMode("STUDY")).toBe("STUDY");
    });
    it("maps CHALLENGE to BOSS_PREP", () => {
      expect(mapSessionModeToTargetMode("CHALLENGE")).toBe("BOSS_PREP");
    });
    it("maps CREATIVE to HABIT_BUILD", () => {
      expect(mapSessionModeToTargetMode("CREATIVE")).toBe("HABIT_BUILD");
    });
    it("maps FLOW to FOCUS (default)", () => {
      expect(mapSessionModeToTargetMode("FLOW")).toBe("FOCUS");
    });
    it("maps unknown mode to FOCUS (default)", () => {
      expect(mapSessionModeToTargetMode("UNKNOWN")).toBe("FOCUS");
    });
  });

  describe("buildNextPromiseInput", () => {
    it("returns correct shape with targetDate +1 day", () => {
      const input = {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440099",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      const result = buildNextPromiseInput(input, "UTC");
      expect(result.targetDate).toBe("2026-05-21");
      expect(result.targetDurationMinutes).toBe(25);
      expect(result.targetMode).toBe("FOCUS");
      expect(result.userId).toBe("user-123");
      expect(result.sourceSessionId).toBe(input.sessionId);
    });

    it("enforces MinimumPromiseMinutes floor", () => {
      const input = {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 2,
        sessionId: "550e8400-e29b-41d4-a716-446655440099",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      const result = buildNextPromiseInput(input, "UTC");
      expect(result.targetDurationMinutes).toBe(MinimumPromiseMinutes);
    });
  });

  describe("isMatchOrBetter", () => {
    it("returns true when session matches target date, duration, and mode", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(true);
    });

    it("returns true when duration exceeds target", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 40,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(true);
    });

    it("returns false when date does not match", () => {
      const input = {
        completedAt: Date.parse("2026-05-22T14:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(false);
    });

    it("returns false when duration is too short", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 10,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(false);
    });

    it("returns false when mode does not match", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "STUDY",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(false);
    });
  });
});
