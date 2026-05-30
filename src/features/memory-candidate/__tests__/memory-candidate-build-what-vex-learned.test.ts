/**
 * Tests for buildWhatVEXLearned service
 */
import { buildWhatVEXLearned } from "../what-vex-learned-service";
import type { WhatVEXLearnedInput } from "../schemas";

const userId = "test-user-mc";

function baseInput(overrides: Partial<WhatVEXLearnedInput> = {}): WhatVEXLearnedInput {
  return {
    userId,
    totalSessions: 10,
    totalFocusMinutes: 500,
    streakDays: 5,
    completedSessions: 10,
    ...overrides,
  };
}

describe("buildWhatVEXLearned", () => {
  it("returns empty items when totalSessions < 3", () => {
    const result = buildWhatVEXLearned(
      baseInput({ totalSessions: 2 }),
    );
    expect(result.items).toEqual([]);
    expect(result.hasEnoughEvidence).toBe(false);
  });

  it("sets hasEnoughEvidence true when totalSessions >= 3", () => {
    const result = buildWhatVEXLearned(
      baseInput({ totalSessions: 3 }),
    );
    expect(result.hasEnoughEvidence).toBe(true);
  });

  it("includes early disclaimer for < 5 sessions", () => {
    const result = buildWhatVEXLearned(
      baseInput({ totalSessions: 3 }),
    );
    expect(result.disclaimer).toContain("Still early");
  });

  it("includes forming disclaimer for 5-9 sessions", () => {
    const result = buildWhatVEXLearned(
      baseInput({ totalSessions: 7 }),
    );
    expect(result.disclaimer).toContain("Patterns are forming");
  });

  it("includes mature disclaimer for 10+ sessions", () => {
    const result = buildWhatVEXLearned(
      baseInput({ totalSessions: 12 }),
    );
    expect(result.disclaimer).toContain("Based on your session data");
  });

  it("returns not-enough disclaimer when totalSessions < 3", () => {
    const result = buildWhatVEXLearned(
      baseInput({ totalSessions: 1 }),
    );
    expect(result.disclaimer).toContain("Not enough session data");
  });

  it("sets correct id and userId", () => {
    const result = buildWhatVEXLearned(baseInput());
    expect(result.id).toBe(`vex-learned:${userId}`);
    expect(result.userId).toBe(userId);
  });

  it("caps items at 5 maximum", () => {
    const result = buildWhatVEXLearned(
      baseInput({
        totalSessions: 20,
        completedSessions: 20,
        totalFocusMinutes: 1000,
        streakDays: 10,
        abandonedStarts: 5,
        avgDelayBeforeStartSeconds: 200,
        shortCompletions: 15,
        earlyQuits: 5,
        modeChanges: 10,
        eveningNudgeDismissals: 5,
        morningNudgeOpens: 5,
        rescueSessionsCompleted: 5,
        averageFocusScore: 85,
        mostProductiveTimeLabel: "in the morning",
        bestSessionDurationMinutes: 30,
        completedNamedStudyTargets: 5,
      }),
    );
    expect(result.items.length).toBeLessThanOrEqual(5);
  });
});
