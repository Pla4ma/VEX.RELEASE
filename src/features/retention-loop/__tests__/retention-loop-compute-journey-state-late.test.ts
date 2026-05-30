import { describe, expect, it } from "@jest/globals";
import { computeJourneyState } from "../service";

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

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("computeJourneyState", () => {
  it("Day 5: lane_forming phase, forming emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 5,
      completedSessions: 5,
      lane: "student",
    });
    expect(state.phase).toBe("lane_forming");
    expect(state.emotionalState).toBe("forming");
  });

  it("Day 6: weekly_prep phase, ready emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 6,
      completedSessions: 6,
      lane: "student",
    });
    expect(state.phase).toBe("weekly_prep");
    expect(state.emotionalState).toBe("ready");
  });

  it("Day 7: weekly_intelligence phase, valuable emotional state", () => {
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
    expect(state.momentType.requiresSessions).toBe(5);
    expect(state.momentType.canHide).toBe(true);
    expect(state.homeMessage.tone).toBe("proof");
    expect(state.premiumTrigger.trigger).toBe("deep_insight_tap");
  });

  it("dismissals >= 3 suppress nudge.canSend", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 2,
      completedSessions: 2,
      recentDismissals: 3,
      lane: "student",
    });
    expect(state.nudgePolicy.canSend).toBe(false);
    expect(state.nudgePolicy.condition).toBe("User repeatedly dismissed — paused.");
  });

  it("Day 4: rescue triggers when recentDismissals >= 2", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 4,
      recentDismissals: 2,
      inactivityDays: 0,
      lane: "student",
    });
    expect(state.phase).toBe("rescue");
  });

  it("lane-specific copy is populated for all lanes on day 0", () => {
    for (const lane of ALL_LANES) {
      const state = computeJourneyState({
        ...baseInput,
        daysSinceOnboarding: 0,
        lane,
      });
      expect(state.homeMessage.headline.length).toBeGreaterThan(0);
      expect(state.primaryCta.length).toBeGreaterThan(0);
      expect(state.sessionSuggestion.durationMinutes).toBeGreaterThanOrEqual(5);
      expect(state.returnReason.length).toBeGreaterThan(0);
    }
  });

  it("premium trigger copyKey maps correctly per lane", () => {
    const expectedCopyKeys: Record<string, string> = {
      student: "study",
      game_like: "run",
      deep_creative: "project",
      minimal_normal: "clean",
    };
    for (const [lane, expectedKey] of Object.entries(expectedCopyKeys)) {
      const state = computeJourneyState({
        ...baseInput,
        daysSinceOnboarding: 7,
        completedSessions: 7,
        lane: lane as (typeof ALL_LANES)[number],
      });
      expect(state.premiumTrigger.copyKey).toBe(expectedKey);
    }
  });
});
