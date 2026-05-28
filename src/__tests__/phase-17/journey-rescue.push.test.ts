import { describe, expect, it } from "@jest/globals";
import {
  isRescueEligible,
  shouldSendRescuePush,
} from "../../features/rescue-mode/service";

describe("Phase 17 — Rescue: Push eligibility", () => {
  it("sends push when eligible", () => {
    const eligibility = isRescueEligible({
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
    const result = shouldSendRescuePush({
      eligibility,
      userMuted: false,
      quietHoursActive: false,
      budgetRemaining: 1,
      sentToday: 0,
      maxDaily: 2,
    });
    expect(result).toBe(true);
  });

  it("blocks push when user muted", () => {
    const eligibility = isRescueEligible({
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
    const result = shouldSendRescuePush({
      eligibility,
      userMuted: true,
      quietHoursActive: false,
      budgetRemaining: 1,
      sentToday: 0,
      maxDaily: 2,
    });
    expect(result).toBe(false);
  });

  it("blocks push during quiet hours", () => {
    const eligibility = isRescueEligible({
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
    const result = shouldSendRescuePush({
      eligibility,
      userMuted: false,
      quietHoursActive: true,
      budgetRemaining: 1,
      sentToday: 0,
      maxDaily: 2,
    });
    expect(result).toBe(false);
  });
});
