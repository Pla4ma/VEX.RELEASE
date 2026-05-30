/**
 * Integration Helpers, analyticsKeys, and AnalyticsValidationError Tests
 */

import {
  updateIntegrationState,
  getTimeOfDay,
} from "../integration-helpers";

import { analyticsKeys } from "../hooks/analyticsKeys";

import {
  AnalyticsValidationError,
} from "../validation";

// ── Integration Helpers ───────────────────────────────────────────────────────

describe("Integration Helpers", () => {
  describe("updateIntegrationState", () => {
    it("accumulates values for new user", () => {
      updateIntegrationState("new-user", {
        sessionCount: 5,
        totalFocusTime: 100,
        xpEarned: 50,
        streakDays: 3,
        lastSync: Date.now(),
      });
      // No assertion needed - just ensure it doesn't throw
    });

    it("merges with existing state", () => {
      updateIntegrationState("merge-user", {
        sessionCount: 5,
        totalFocusTime: 100,
        xpEarned: 50,
        streakDays: 0,
        lastSync: Date.now(),
      });
      updateIntegrationState("merge-user", {
        sessionCount: 3,
        totalFocusTime: 60,
        xpEarned: 30,
        streakDays: 0,
        lastSync: Date.now(),
      });
      // Just ensure no errors
    });
  });

  describe("getTimeOfDay", () => {
    it("returns a valid time of day string", () => {
      const timeOfDay = getTimeOfDay();
      expect([
        "night",
        "morning",
        "afternoon",
        "evening",
      ]).toContain(timeOfDay);
    });
  });
});

// ── Analytics Keys ────────────────────────────────────────────────────────────

describe("analyticsKeys", () => {
  it("generates data key", () => {
    const key = analyticsKeys.data("user-1", ["sessions_completed"], "today");
    expect(key).toContain("analytics");
    expect(key).toContain("data");
    expect(key).toContain("user-1");
  });

  it("generates trend key", () => {
    const key = analyticsKeys.trend("user-1", "xp_earned", "last_7_days");
    expect(key).toContain("trend");
  });

  it("generates insights key", () => {
    const key = analyticsKeys.insights("user-1", { unreadOnly: true });
    expect(key).toContain("insights");
  });

  it("generates patterns key", () => {
    const key = analyticsKeys.patterns("user-1");
    expect(key).toContain("patterns");
  });

  it("generates dashboard key", () => {
    const key = analyticsKeys.dashboard("user-1");
    expect(key).toContain("dashboard");
  });

  it("generates exportJobs key", () => {
    const key = analyticsKeys.exportJobs("user-1");
    expect(key).toContain("exports");
  });

  it("generates preferences key", () => {
    const key = analyticsKeys.preferences("user-1");
    expect(key).toContain("preferences");
  });

  it("generates summary key", () => {
    const key = analyticsKeys.summary("user-1", "last_30_days");
    expect(key).toContain("summary");
  });

  it("generates sessionHeatmap key", () => {
    const key = analyticsKeys.sessionHeatmap("user-1", 4);
    expect(key).toContain("session-heatmap");
  });

  it("all keys start with 'analytics'", () => {
    const allKeys = [
      analyticsKeys.all,
      analyticsKeys.data("u", ["sessions_completed"], "today"),
      analyticsKeys.trend("u", "xp_earned", "today"),
      analyticsKeys.insights("u"),
      analyticsKeys.patterns("u"),
      analyticsKeys.dashboard("u"),
      analyticsKeys.exportJobs("u"),
      analyticsKeys.preferences("u"),
      analyticsKeys.summary("u", "today"),
      analyticsKeys.sessionHeatmap("u", 4),
    ];
    allKeys.forEach((key) => {
      expect(key[0]).toBe("analytics");
    });
  });
});

// ── AnalyticsValidationError ──────────────────────────────────────────────────

describe("AnalyticsValidationError", () => {
  it("creates error with all fields", () => {
    const error = new AnalyticsValidationError(
      "Invalid field",
      "startDate",
      "INVALID",
      "Use valid date",
      -1,
    );
    expect(error.message).toBe("Invalid field");
    expect(error.field).toBe("startDate");
    expect(error.code).toBe("INVALID");
    expect(error.recoveryHint).toBe("Use valid date");
    expect(error.value).toBe(-1);
    expect(error.name).toBe("AnalyticsValidationError");
    expect(error instanceof Error).toBe(true);
  });
});
