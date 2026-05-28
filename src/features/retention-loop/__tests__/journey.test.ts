import { describe, expect, it } from "@jest/globals";
import {
  computeJourneyDay,
  computeJourneyState,
} from "../service";

describe("computeJourneyDay", () => {
  it("returns 0 for Day 0 (daysSinceOnboarding = 0)", () => {
    expect(
      computeJourneyDay({
        userId: "u1",
        daysSinceOnboarding: 0,
        completedSessions: 0,
        hasCompletedToday: false,
        hasSeenMemoryInsight: false,
        lane: "student",
        rescueCompleted: 0,
        recentDismissals: 0,
        inactivityDays: 0,
        hasInsightReady: false,
      }),
    ).toBe(0);
  });

  it("returns 3 for Day 3", () => {
    expect(
      computeJourneyDay({
        userId: "u1",
        daysSinceOnboarding: 3,
        completedSessions: 5,
        hasCompletedToday: false,
        hasSeenMemoryInsight: false,
        lane: "student",
        rescueCompleted: 0,
        recentDismissals: 0,
        inactivityDays: 0,
        hasInsightReady: false,
      }),
    ).toBe(3);
  });

  it("clamps to 7 for day 10", () => {
    expect(
      computeJourneyDay({
        userId: "u1",
        daysSinceOnboarding: 10,
        completedSessions: 10,
        hasCompletedToday: false,
        hasSeenMemoryInsight: true,
        lane: "student",
        rescueCompleted: 1,
        recentDismissals: 0,
        inactivityDays: 0,
        hasInsightReady: false,
      }),
    ).toBe(7);
  });
});

describe("computeJourneyState", () => {
  const baseInput = {
    userId: "u1",
    completedSessions: 0,
    hasCompletedToday: false,
    hasSeenMemoryInsight: false,
    rescueCompleted: 0,
    recentDismissals: 0,
    inactivityDays: 0,
    hasInsightReady: false,
  };

  it("Day 0: onboarding phase, curious emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "student",
    });
    expect(state.day).toBe(0);
    expect(state.phase).toBe("onboarding");
    expect(state.emotionalState).toBe("curious");
    expect(state.nudgePolicy.canSend).toBe(false);
    expect(state.premiumTrigger.trigger).toBe("none");
  });

  it("Day 0: lane-specific CTA for student", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "student",
    });
    expect(state.primaryCta).toBe("Start first study block");
  });

  it("Day 0: lane-specific CTA for game_like", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "game_like",
    });
    expect(state.primaryCta).toBe("Start first run");
  });

  it("Day 1: return phase, familiar emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 1,
      completedSessions: 1,
      hasCompletedToday: true,
      lane: "student",
    });
    expect(state.day).toBe(1);
    expect(state.phase).toBe("return");
    expect(state.emotionalState).toBe("familiar");
    expect(state.nudgePolicy.canSend).toBe(true);
    expect(state.nudgePolicy.type).toBe("gentle_return");
  });

  it("Day 2: proof phase, validated emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 2,
      completedSessions: 2,
      lane: "student",
    });
    expect(state.day).toBe(2);
    expect(state.phase).toBe("proof");
    expect(state.emotionalState).toBe("validated");
  });

  it("Day 3: insight phase, What VEX Learned moment", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 3,
      completedSessions: 3,
      hasSeenMemoryInsight: false,
      lane: "student",
    });
    expect(state.day).toBe(3);
    expect(state.phase).toBe("insight");
    expect(state.momentType.type).toBe("what_vex_learned");
    expect(state.momentType.requiresSessions).toBe(3);
    expect(state.momentType.canHide).toBe(true);
  });

  it("Day 4: rescue phase when inactive", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 3,
      inactivityDays: 2,
      lane: "student",
    });
    expect(state.day).toBe(4);
    expect(state.phase).toBe("rescue");
    expect(state.emotionalState).toBe("struggling");
  });

  it("Day 4: lane_forming phase when active", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 4,
      hasCompletedToday: true,
      inactivityDays: 0,
      lane: "student",
    });
    expect(state.phase).toBe("lane_forming");
    expect(state.emotionalState).toBe("forming");
  });

  it("Day 7: weekly_intelligence phase", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 7,
      completedSessions: 7,
      lane: "student",
    });
    expect(state.day).toBe(7);
    expect(state.phase).toBe("weekly_intelligence");
    expect(state.emotionalState).toBe("valuable");
    expect(state.momentType.type).toBe("weekly_insight");
    expect(state.premiumTrigger.trigger).toBe("deep_insight_tap");
    expect(state.premiumTrigger.copyKey).toBe("study");
  });

  it("Dismissals suppress nudges", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 1,
      completedSessions: 1,
      recentDismissals: 3,
      lane: "student",
    });
    expect(state.nudgePolicy.canSend).toBe(false);
  });
});
