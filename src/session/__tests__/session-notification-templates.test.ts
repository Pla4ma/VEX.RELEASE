/**
 * Session Feature — Notification Templates Tests
 */

import {
  buildInterruptionPayload,
  buildRecoveryPayload,
  buildStreakWarningPayload,
  buildDailyReminderPayload,
  buildBreakReminderPayload,
  buildRewardPayload,
  buildStreakMilestoneResult,
  getAntiCheatWarning,
} from "../notifications/session-notification-templates";

describe("session-notification-templates", () => {
  test("buildInterruptionPayload returns correct severity titles", () => {
    expect(buildInterruptionPayload("s1", "CRITICAL").priority).toBe("high");
    expect(buildInterruptionPayload("s1", "MAJOR").title).toContain("Interruption");
    expect(buildInterruptionPayload("s1", "MINOR").title).toBe("Session Paused");
  });

  test("buildRecoveryPayload includes minutes elapsed", () => {
    const payload = buildRecoveryPayload("s1", 15);
    expect(payload.body).toContain("15");
    expect(payload.data.type).toBe("recovery_reminder");
  });

  test("buildStreakWarningPayload includes streak days and hours", () => {
    const payload = buildStreakWarningPayload(7, 3);
    expect(payload.body).toContain("7");
    expect(payload.body).toContain("3");
    expect(payload.priority).toBe("high");
  });

  test("buildDailyReminderPayload returns standard reminder", () => {
    const payload = buildDailyReminderPayload();
    expect(payload.data.type).toBe("daily_reminder");
    expect(payload.priority).toBe("normal");
  });

  test("buildBreakReminderPayload includes break duration", () => {
    const payload = buildBreakReminderPayload(300);
    expect(payload.body).toContain("5");
  });

  test("buildRewardPayload returns null when all rewards are zero", () => {
    expect(buildRewardPayload(0, 0, 0)).toBeNull();
  });

  test("buildRewardPayload includes all non-zero rewards", () => {
    const payload = buildRewardPayload(100, 50, 3);
    expect(payload).not.toBeNull();
    expect(payload!.body).toContain("100 XP");
    expect(payload!.body).toContain("50 coins");
    expect(payload!.body).toContain("3 gems");
  });

  test("buildStreakMilestoneResult returns special messages for 7, 30, 100 days", () => {
    expect(buildStreakMilestoneResult(7).title).toContain("Week");
    expect(buildStreakMilestoneResult(30).title).toContain("Month");
    expect(buildStreakMilestoneResult(100).title).toContain("Century");
    expect(buildStreakMilestoneResult(3).title).toContain("Streak");
  });

  test("getAntiCheatWarning returns known violation warnings", () => {
    expect(getAntiCheatWarning("TIME_MANIPULATION").title).toContain("Time");
    expect(getAntiCheatWarning("DEVICE_CHANGE").title).toContain("Device");
    expect(getAntiCheatWarning("RAPID_COMPLETION").title).toContain("Suspicious");
  });

  test("getAntiCheatWarning returns generic for unknown violation", () => {
    expect(getAntiCheatWarning("UNKNOWN_THING").title).toContain("Warning");
  });
});
