import { describe, expect, it } from "@jest/globals";
import { isRescueEligible } from "../../features/rescue-mode/service";

describe("Phase 17 — Rescue: Hidden before signal", () => {
  it("not eligible on cold Day 0", () => {
    const result = isRescueEligible({
      userId: "u1",
      lane: "student",
      completedSessions: 0,
      daysSinceOnboarding: 0,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("Day 0");
  });

  it("not eligible without any trigger signal", () => {
    const result = isRescueEligible({
      userId: "u1",
      lane: "student",
      completedSessions: 1,
      daysSinceOnboarding: 1,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(false);
  });
});

describe("Phase 17 — Rescue: Visible after avoidance", () => {
  it("eligible after abandoned session", () => {
    const result = isRescueEligible({
      userId: "u1",
      lane: "student",
      completedSessions: 3,
      daysSinceOnboarding: 2,
      abandonedSessionExists: true,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe("abandoned_session");
  });

  it("eligible after missed planned session", () => {
    const result = isRescueEligible({
      userId: "u1",
      lane: "game_like",
      completedSessions: 2,
      daysSinceOnboarding: 3,
      abandonedSessionExists: false,
      missedPlannedSession: true,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe("missed_planned");
  });

  it("eligible for notification_dismissal_pattern (3+ dismissals)", () => {
    const result = isRescueEligible({
      userId: "u1",
      lane: "minimal_normal",
      completedSessions: 3,
      daysSinceOnboarding: 2,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 4,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe("notification_dismissal_pattern");
  });

  it("eligible when user reports task too big", () => {
    const result = isRescueEligible({
      userId: "u1",
      lane: "deep_creative",
      completedSessions: 3,
      daysSinceOnboarding: 2,
      abandonedSessionExists: false,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      hoursUntilStreakBreak: 24,
      hasActiveSession: false,
      userTooBig: true,
      now: 100,
    });
    expect(result.eligible).toBe(true);
    expect(result.trigger).toBe("user_too_big");
  });
});
