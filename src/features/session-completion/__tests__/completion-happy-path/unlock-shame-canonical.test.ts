import {
  LANES,
  CLEAN_QUESTIONS,
  SessionMode,
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
  createSessionSummary,
} from "./helpers";
import type { Lane } from "./helpers";

describe("7. Hidden unlock remains inert", () => {
  const UNLOCK_KEYS: Record<Lane, string> = {
    student: "study_os",
    game_like: "run_board",
    deep_creative: "project_thread",
    minimal_normal: "today_strip",
  };

  it.each(LANES)("%s: hidden featureKey keeps unlock blocked", (lane) => {
    const result = buildCompletionPersonalization({
      hiddenFeatureKeys: [UNLOCK_KEYS[lane]],
      lane,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
    });
    expect(result.unlockDecision.hidden).toBe(true);
    expect(result.unlockDecision.status).toBe("blocked");
    expect(result.unlockDecision.key).toBe(UNLOCK_KEYS[lane]);
  });

  it("hidden unlock produces a reason explaining why", () => {
    const result = buildCompletionPersonalization({
      hiddenFeatureKeys: ["study_os"],
      lane: "student",
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
    });
    expect(result.unlockDecision.reason.length).toBeGreaterThan(0);
  });

  it("hidden memory_console stays hidden before session 3 (via integration layer)", () => {
    const result = buildCompletionPersonalization({
      hiddenFeatureKeys: ["memory_console"],
      lane: "student",
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
    });
    expect(result.unlockDecision.key).toBe("study_os");
  });
});

describe("8. Partial completion no shame", () => {
  const SHAME_TERMS = [
    "fail", "failure", "weak", "bad", "terrible",
    "awful", "disappointing", "shameful", "loser",
  ];

  it.each(LANES)("%s: partial reflection contains no shame language", (lane) => {
    const result = buildCompletionPersonalization({
      lane,
      summary: createSessionSummary({ completionPercentage: 30 }),
    });
    const question = result.reflectionQuestion.toLowerCase();
    for (const term of SHAME_TERMS) {
      expect(question).not.toContain(term);
    }
    expect(question.endsWith("?")).toBe(true);
  });

  it.each(LANES)("%s: abandoned reflection contains no shame language", (lane) => {
    const result = buildCompletionPersonalization({
      lane,
      summary: createSessionSummary({
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: "ABANDONED",
      }),
    });
    const question = result.reflectionQuestion.toLowerCase();
    for (const term of SHAME_TERMS) {
      expect(question).not.toContain(term);
    }
  });

  it("abandoned memory candidate still has low but present confidence", () => {
    const result = buildCompletionPersonalization({
      lane: "student",
      summary: createSessionSummary({
        completionPercentage: 0,
        sessionMode: SessionMode.STUDY,
        status: "ABANDONED",
      }),
    });
    expect(result.memoryCandidates[0].confidence).toBeGreaterThan(0);
    expect(result.memoryCandidates[0].confidence).toBeLessThan(0.5);
  });

  it("partial completion tone is neutral (info), not negative", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 2,
      grade: "C",
      isPersonalBest: false,
      lane: "student",
      streakAction: "maintained",
      streakDays: 2,
      summary: createSessionSummary({ completionPercentage: 45 }),
      xpDelta: 30,
    });
    expect(result.userFacingSummary.tone).toBe("info");
    expect(result.userFacingSummary.tone).not.toBe("warning");
  });

  it("abandoned session uses warning tone but without shame", () => {
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
    expect(result.userFacingSummary.tone).toBe("warning");
    const body = result.userFacingSummary.displayBody.toLowerCase();
    for (const term of SHAME_TERMS) {
      expect(body).not.toContain(term);
    }
  });
});

// ── Cross-cutting: Canonical result shape ──

describe("Canonical result shape", () => {
  it("produces all 7 required fields", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 10,
      grade: "A",
      isPersonalBest: false,
      lane: "student",
      streakAction: "extended",
      streakDays: 5,
      summary: createSessionSummary({
        createdAt: Date.UTC(2026, 4, 15, 18),
        sessionMode: SessionMode.STUDY,
        userId: "550e8400-e29b-41d4-a716-446655440099",
      }),
      xpDelta: 120,
    });
    expect(result.laneProfile).toBeDefined();
    expect(result.progressProof).toBeDefined();
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.memoryCandidates).toBeDefined();
    expect(result.unlockDecision).toBeDefined();
    expect(result.nextAction).toBeDefined();
    expect(result.userFacingSummary).toBeDefined();
  });

  it("memory candidate count is 0 or 1 (max sequences)", () => {
    LANES.forEach((lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      });
      expect(result.memoryCandidates.length).toBeLessThanOrEqual(1);
    });
  });

  it("reflection question is a single question (max visual sequence)", () => {
    const extracted: string[] = [];
    LANES.forEach((lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      });
      extracted.push(result.reflectionQuestion);
    });
    for (const q of extracted) {
      const count = (q.match(/\?/g) ?? []).length;
      expect(count).toBe(CLEAN_QUESTIONS[LANES[0]]);
    }
  });
});
