import {
  getFirstWeekMilestone,
  getNextMilestone,
  getMilestoneProgress,
} from "../first-week-narrative";
import type { JourneyState } from "../../retention-loop/schemas";

function makeJourneyState(
  overrides: Partial<JourneyState> = {},
): JourneyState {
  const homeMessage = {
    headline: "Keep going",
    subtext: "You are building momentum",
    tone: "direct" as const,
  };
  return {
    day: 0,
    phase: "onboarding",
    emotionalState: "curious",
    homeMessage,
    primaryCta: "Start session",
    sessionSuggestion: {
      durationMinutes: 15,
      type: "STUDY",
      taskPrompt: "Study for 15 minutes",
    },
    completionPayoff: "First step done.",
    nextActionCopy: "Return tomorrow.",
    returnReason: "Build your rhythm.",
    nudgePolicy: {
      canSend: false,
      type: null,
      condition: "Day 0: no unsolicited notification.",
    },
    premiumTrigger: {
      day: 0,
      trigger: "none",
      copyKey: "none",
    },
    momentType: {
      type: "none",
      requiresSessions: 0,
      canHide: false,
    },
    ...overrides,
  } as JourneyState;
}

describe("first-week-narrative", () => {
  it("returns Day 1 milestone from journey state", () => {
    const state = makeJourneyState({
      day: 1,
      phase: "return",
      homeMessage: {
        headline: "VEX remembers your rhythm",
        subtext: "Continue where you left off",
        tone: "direct",
      },
      completionPayoff: "First session done. VEX is learning.",
      primaryCta: "Add one more block",
      returnReason: "Return tomorrow for early proof.",
    });
    const milestone = getFirstWeekMilestone(state);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(1);
    expect(milestone!.title).toBe("VEX remembers your rhythm");
    expect(milestone!.ctaLabel).toBe("Add one more block");
  });

  it("returns Day 3 milestone from journey state", () => {
    const state = makeJourneyState({
      day: 3,
      phase: "insight",
      homeMessage: {
        headline: "VEX shows what it learned",
        subtext: "Insight ready to view",
        tone: "humble",
      },
      completionPayoff: "Three sessions. VEX found a pattern.",
      primaryCta: "See what VEX suggests",
      returnReason: "VEX will keep learning.",
    });
    const milestone = getFirstWeekMilestone(state);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(3);
    expect(milestone!.title).toBe("VEX shows what it learned");
  });

  it("returns Day 7 milestone from journey state", () => {
    const state = makeJourneyState({
      day: 7,
      phase: "weekly_intelligence",
      homeMessage: {
        headline: "First weekly intelligence",
        subtext: "Your first full week",
        tone: "proof",
      },
      completionPayoff: "One week of data. VEX knows your patterns.",
      primaryCta: "Open weekly view",
      returnReason: "Week 2 starts tomorrow.",
    });
    const milestone = getFirstWeekMilestone(state);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(7);
    expect(milestone!.title).toBe("First weekly intelligence");
  });

  it("returns null for Day 0", () => {
    const state = makeJourneyState({ day: 0 });
    expect(getFirstWeekMilestone(state)).toBeNull();
  });

  it("returns next milestone correctly", () => {
    const next = getNextMilestone(0);
    expect(next).not.toBeNull();
    expect(next!.day).toBe(1);
    expect(next!.label).toContain("1 day");
  });

  it("returns next milestone from mid-week", () => {
    const next = getNextMilestone(3);
    expect(next).not.toBeNull();
    expect(next!.day).toBe(4);
  });

  it("returns null when at day 7", () => {
    expect(getNextMilestone(7)).toBeNull();
    expect(getNextMilestone(10)).toBeNull();
  });

  it("computes milestone progress label", () => {
    const start = getMilestoneProgress(0);
    expect(start.current).toBe(0);
    expect(start.next).toBe(1);
    expect(start.label).toContain("7 days until");

    const mid = getMilestoneProgress(4);
    expect(mid.current).toBe(4);
    expect(mid.next).toBe(5);

    const done = getMilestoneProgress(7);
    expect(done.current).toBe(7);
    expect(done.next).toBeNull();
    expect(done.label).toBe("Weekly intelligence ready");
  });
});
