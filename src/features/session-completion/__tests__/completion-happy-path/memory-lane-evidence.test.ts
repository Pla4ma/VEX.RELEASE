import {
  LANES,
  SessionMode,
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
  createSessionSummary,
} from "./helpers";

describe("1. Completion creates memory candidate", () => {
  it.each(LANES)(
    "%s: clean completion produces one memory candidate",
    (lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      });
      expect(result.memoryCandidates).toHaveLength(1);
      expect(result.memoryCandidates[0].source).toBe("session_completion");
    },
  );

  it("memory candidate includes session evidence in text", () => {
    const result = buildCompletionPersonalization({
      lane: "student",
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
    });
    const text = result.memoryCandidates[0].text;
    expect(text).toContain("s:");
    expect(text).toContain("l:student");
    expect(text).toContain("m:");
  });

  it("memory candidate confidence reflects completion quality", () => {
    const clean = buildCompletionPersonalization({
      lane: "game_like",
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
    });
    const abandoned = buildCompletionPersonalization({
      lane: "game_like",
      summary: createSessionSummary({
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: "ABANDONED",
      }),
    });
    expect(clean.memoryCandidates[0].confidence).toBeGreaterThan(
      abandoned.memoryCandidates[0].confidence,
    );
  });
});

describe("2. Completing updates lane evidence only with enough signal", () => {
  it("clean completion carries medium confidence", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 10,
      grade: "A",
      isPersonalBest: false,
      lane: "student",
      streakAction: "extended",
      streakDays: 5,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 150,
    });
    expect(result.laneProfile.confidenceBand).toBe("medium");
    expect(result.laneProfile.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it("partial completion keeps confidence low", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 0,
      grade: "C",
      isPersonalBest: false,
      lane: "game_like",
      streakAction: "maintained",
      streakDays: 3,
      summary: createSessionSummary({
        completionPercentage: 35,
        sessionMode: SessionMode.FLOW,
        status: "COMPLETED",
      }),
      xpDelta: 30,
    });
    expect(result.laneProfile.confidenceBand).toBe("low");
    expect(result.laneProfile.confidence).toBeLessThan(0.5);
  });

  it("abandoned session does not increase lane confidence", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: -5,
      grade: "D",
      isPersonalBest: false,
      lane: "minimal_normal",
      streakAction: "broken",
      streakDays: 0,
      summary: createSessionSummary({
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: "ABANDONED",
      }),
      xpDelta: 0,
    });
    expect(result.laneProfile.confidenceBand).toBe("low");
  });
});
