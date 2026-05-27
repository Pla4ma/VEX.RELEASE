import { describe, expect, it } from "@jest/globals";
import {
  computeJourneyDay,
  computeJourneyState,
  getDay1ReturnMoment,
  getDay0SessionSuggestion,
} from "../service";
import {
  shouldShowDay3Memory,
  shouldOfferRescue,
  shouldShowPremiumAfterValue,
  getPremiumCopy,
} from "../retention-guards";

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

describe("getDay1ReturnMoment", () => {
  it("returns mode-specific copy for student", () => {
    const moment = getDay1ReturnMoment("student");
    expect(moment.headline).toBe("Pick up with one focused study block.");
    expect(moment.sessionMinutes).toBe(15);
  });

  it("returns mode-specific copy for game_like", () => {
    const moment = getDay1ReturnMoment("game_like");
    expect(moment.headline).toBe("Your next clean run is ready.");
    expect(moment.sessionMinutes).toBe(15);
  });

  it("returns mode-specific copy for minimal_normal", () => {
    const moment = getDay1ReturnMoment("minimal_normal");
    expect(moment.headline).toBe("One clean block is enough today.");
  });
});

describe("shouldShowDay3Memory", () => {
  it("returns true on day 3+ with 3+ sessions and not yet seen", () => {
    expect(
      shouldShowDay3Memory({
        daysSinceOnboarding: 3,
        completedSessions: 3,
        hasSeenMemoryInsight: false,
      }),
    ).toBe(true);
  });

  it("returns false if already seen", () => {
    expect(
      shouldShowDay3Memory({
        daysSinceOnboarding: 3,
        completedSessions: 3,
        hasSeenMemoryInsight: true,
      }),
    ).toBe(false);
  });

  it("returns false if not enough sessions", () => {
    expect(
      shouldShowDay3Memory({
        daysSinceOnboarding: 3,
        completedSessions: 1,
        hasSeenMemoryInsight: false,
      }),
    ).toBe(false);
  });
});

describe("shouldOfferRescue", () => {
  it("returns true on day 4+ with inactivity", () => {
    expect(
      shouldOfferRescue({
        daysSinceOnboarding: 4,
        completedSessions: 3,
        hasCompletedToday: false,
        inactivityDays: 2,
      }),
    ).toBe(true);
  });

  it("returns false if completed today", () => {
    expect(
      shouldOfferRescue({
        daysSinceOnboarding: 4,
        completedSessions: 3,
        hasCompletedToday: true,
        inactivityDays: 2,
      }),
    ).toBe(false);
  });

  it("returns false before day 4", () => {
    expect(
      shouldOfferRescue({
        daysSinceOnboarding: 2,
        completedSessions: 2,
        hasCompletedToday: false,
        inactivityDays: 1,
      }),
    ).toBe(false);
  });
});

describe("shouldShowPremiumAfterValue", () => {
  it("returns true on day 7+ after weekly insight", () => {
    expect(
      shouldShowPremiumAfterValue({
        daysSinceOnboarding: 7,
        hasSeenWeeklyInsight: true,
      }),
    ).toBe(true);
  });

  it("returns false if insight not yet seen", () => {
    expect(
      shouldShowPremiumAfterValue({
        daysSinceOnboarding: 7,
        hasSeenWeeklyInsight: false,
      }),
    ).toBe(false);
  });
});

describe("getPremiumCopy", () => {
  it("returns lane-specific premium copy", () => {
    expect(getPremiumCopy("student")).toBe("Go deeper with Study Intelligence.");
    expect(getPremiumCopy("game_like")).toBe(
      "Upgrade your Focus Run intelligence.",
    );
    expect(getPremiumCopy("deep_creative")).toBe(
      "Keep deeper project memory.",
    );
    expect(getPremiumCopy("minimal_normal")).toBe(
      "Unlock quieter weekly planning.",
    );
  });
});

describe("getDay0SessionSuggestion", () => {
  it("returns student-specific session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("student");
    expect(suggestion.durationMinutes).toBe(15);
    expect(suggestion.type).toBe("STUDY");
  });

  it("returns minimal_normal-specific session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("minimal_normal");
    expect(suggestion.durationMinutes).toBe(10);
    expect(suggestion.type).toBe("LIGHT_FOCUS");
  });
});
