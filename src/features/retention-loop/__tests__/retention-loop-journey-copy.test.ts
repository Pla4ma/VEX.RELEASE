import { describe, expect, it } from "@jest/globals";
import { computeJourneyState } from "../service";
import { RETENTION_JOURNEY_COPY } from "../journey-copy";
import { persistJourneyState } from "../repository";

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

describe("RETENTION_JOURNEY_COPY", () => {
  it("has copy for all 8 days (day0–day7)", () => {
    for (let d = 0; d <= 7; d++) {
      expect(RETENTION_JOURNEY_COPY[`day${d}` as keyof typeof RETENTION_JOURNEY_COPY]).toBeDefined();
    }
  });

  it("each day has lane-specific homeMessage for all lanes", () => {
    for (let d = 0; d <= 7; d++) {
      const dayCopy = RETENTION_JOURNEY_COPY[`day${d}` as keyof typeof RETENTION_JOURNEY_COPY];
      for (const lane of ALL_LANES) {
        expect(dayCopy.homeMessage[lane]).toBeDefined();
        expect(dayCopy.homeMessage[lane].length).toBeGreaterThan(0);
      }
    }
  });
});

describe("persistJourneyState", () => {
  it("is a no-op that returns void", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "student",
    });
    expect(() => persistJourneyState(state)).not.toThrow();
  });
});
