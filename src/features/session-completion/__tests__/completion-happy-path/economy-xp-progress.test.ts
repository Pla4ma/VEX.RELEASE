import {
  SessionMode,
  buildCompletionPersonalizationResult,
  createSessionSummary,
} from "./helpers";

describe("5. No chest/shop/economy", () => {
  const ECONOMY_TERMS = [
    "chest", "shop", "wallet", "coin", "gem",
    "battle_pass", "premium_currency", "inventory",
  ];

  it("completion personalization output contains no economy terms", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 8,
      grade: "A",
      isPersonalBest: false,
      lane: "student",
      streakAction: "extended",
      streakDays: 4,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 120,
    });
    const json = JSON.stringify(result).toLowerCase();
    for (const term of ECONOMY_TERMS) {
      expect(json).not.toContain(term);
    }
  });

  it("userFacingSummary uses progress language, not reward language", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 8,
      grade: "A",
      isPersonalBest: false,
      lane: "deep_creative",
      streakAction: "extended",
      streakDays: 3,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 90,
    });
    expect(result.userFacingSummary.displayTitle).not.toMatch(/reward|earn|claim|open/i);
  });

  it("progressProof does not report coins or gems", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 5,
      grade: "B",
      isPersonalBest: false,
      lane: "minimal_normal",
      streakAction: "maintained",
      streakDays: 2,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 60,
    });
    const proof = result.progressProof as Record<string, unknown>;
    expect(proof.coinsEarned).toBeUndefined();
    expect(proof.gemsEarned).toBeUndefined();
    expect(proof.walletDelta).toBeUndefined();
  });
});

describe("6. XP/streak/progress still update", () => {
  it("progressProof carries xpDelta", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 10,
      grade: "A",
      isPersonalBest: false,
      lane: "student",
      streakAction: "extended",
      streakDays: 5,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 200,
    });
    expect(result.progressProof.xpDelta).toBe(200);
  });

  it("progressProof carries streak days and action", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 6,
      grade: "B",
      isPersonalBest: false,
      lane: "game_like",
      streakAction: "extended",
      streakDays: 7,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 100,
    });
    expect(result.progressProof.streakDays).toBe(7);
    expect(result.progressProof.streakAction).toBe("extended");
  });

  it("progressProof carries grade", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 12,
      grade: "S",
      isPersonalBest: false,
      lane: "deep_creative",
      streakAction: "extended",
      streakDays: 10,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 180,
    });
    expect(result.progressProof.grade).toBe("S");
  });

  it("progressProof carries focus score delta", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 15,
      grade: "A",
      isPersonalBest: false,
      lane: "minimal_normal",
      streakAction: "maintained",
      streakDays: 3,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 90,
    });
    expect(result.progressProof.focusScoreDelta).toBe(15);
  });

  it("progressProof carries effective minutes and completion percentage", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 8,
      grade: "A",
      isPersonalBest: false,
      lane: "student",
      streakAction: "extended",
      streakDays: 6,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 130,
    });
    expect(result.progressProof.effectiveMinutes).toBeGreaterThan(0);
    expect(result.progressProof.completionPercentage).toBe(100);
  });

  it("progressProof reflects personal best", () => {
    const withPB = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 20,
      grade: "S",
      isPersonalBest: true,
      lane: "student",
      streakAction: "extended",
      streakDays: 8,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 250,
    });
    expect(withPB.progressProof.isPersonalBest).toBe(true);

    const withoutPB = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 5,
      grade: "B",
      isPersonalBest: false,
      lane: "student",
      streakAction: "maintained",
      streakDays: 3,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 60,
    });
    expect(withoutPB.progressProof.isPersonalBest).toBe(false);
  });
});
