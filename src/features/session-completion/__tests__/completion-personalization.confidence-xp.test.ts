import { buildResult } from "./completion-personalization.helpers";

describe("Phase 5 - Completion Personalization > Lane confidence updates with enough evidence", () => {
  it("clean completion has medium confidence", () => {
    const result = buildResult("student");
    expect(result.laneProfile.confidenceBand).toBe("medium");
    expect(result.laneProfile.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it("partial completion has low confidence", () => {
    const result = buildResult("game_like", {
      grade: "C",
      summary: {
        completionPercentage: 40,
        sessionMode: "FLOW",
        status: "COMPLETED",
      },
      focusScoreDelta: 0,
      xpDelta: 50,
    });
    expect(result.laneProfile.confidenceBand).toBe("low");
  });

  it("abandoned has low confidence", () => {
    const result = buildResult("deep_creative", {
      grade: "D",
      summary: {
        completionPercentage: 0,
        sessionMode: "FLOW",
        status: "ABANDONED",
      },
      focusScoreDelta: -8,
      xpDelta: 0,
    });
    expect(result.laneProfile.confidenceBand).toBe("low");
  });
});

describe("Phase 5 - Completion Personalization > XP / streak / progress still update", () => {
  it("progressProof carries xpDelta", () => {
    const result = buildResult("student", { xpDelta: 200 });
    expect(result.progressProof.xpDelta).toBe(200);
  });

  it("progressProof carries streak info", () => {
    const result = buildResult("game_like", { streakDays: 7 });
    expect(result.progressProof.streakDays).toBe(7);
    expect(result.progressProof.streakAction).toBe("extended");
  });

  it("progressProof carries focus score delta", () => {
    const result = buildResult("deep_creative", { focusScoreDelta: 12 });
    expect(result.progressProof.focusScoreDelta).toBe(12);
  });

  it("progressProof carries grade", () => {
    const result = buildResult("minimal_normal", { grade: "A" });
    expect(result.progressProof.grade).toBe("A");
  });

  it("progressProof reflects personal best", () => {
    const pb = buildResult("student", { isPersonalBest: true });
    expect(pb.progressProof.isPersonalBest).toBe(true);
    const noPb = buildResult("student", { isPersonalBest: false });
    expect(noPb.progressProof.isPersonalBest).toBe(false);
  });
});
