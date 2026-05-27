import { checkNotificationBudget } from "./helpers";

describe("notification policy — bridge (SmartNotificationSystem integration)", () => {
  it("blocks at budget limit", () => {
    const result = checkNotificationBudget({
      userId: "bridge-1",
      lane: "student",
      completedSessions: 5,
      daysSinceOnboarding: 3,
      quietHoursActive: false,
      userMuted: false,
      context: "none",
      sentToday: 2,
    });
    expect(result.blocked).toBe(true);
    expect(result.budgetRemaining).toBe(0);
  });

  it("allows under budget", () => {
    const result = checkNotificationBudget({
      userId: "bridge-2",
      lane: "student",
      completedSessions: 5,
      daysSinceOnboarding: 3,
      quietHoursActive: false,
      userMuted: false,
      context: "none",
      sentToday: 1,
    });
    expect(result.blocked).toBe(false);
    expect(result.budgetRemaining).toBe(1);
  });

  it("blocks during quiet hours", () => {
    const result = checkNotificationBudget({
      userId: "bridge-3",
      lane: "game_like",
      completedSessions: 4,
      daysSinceOnboarding: 3,
      quietHoursActive: true,
      userMuted: false,
      context: "none",
      sentToday: 0,
    });
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain("Quiet hours");
  });

  it("blocks when user muted", () => {
    const result = checkNotificationBudget({
      userId: "bridge-4",
      lane: "deep_creative",
      completedSessions: 5,
      daysSinceOnboarding: 4,
      quietHoursActive: false,
      userMuted: true,
      context: "none",
      sentToday: 0,
    });
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain("mute");
  });

  it("allows rescue despite dismissals", () => {
    const result = checkNotificationBudget({
      userId: "bridge-5",
      lane: "game_like",
      completedSessions: 4,
      daysSinceOnboarding: 3,
      quietHoursActive: false,
      userMuted: false,
      context: "avoidance",
      sentToday: 0,
    });
    expect(result.blocked).toBe(false);
    expect(result.decision.type).toBe("rescue");
  });
});
