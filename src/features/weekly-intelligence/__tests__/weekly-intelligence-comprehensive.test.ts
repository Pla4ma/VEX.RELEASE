import {
  WeeklyInsightInputSchema,
  WeeklyIntelligenceSchema,
  InsightFindingSchema,
  type WeeklyInsightInput,
} from "../schemas";
import { buildWeeklyIntelligence } from "../service";
import {
  buildWhatHelped,
  buildWhatGotInWay,
  resolveBestNextSessionType,
  buildAdjustment,
  buildPremiumDeeperInsight,
} from "../insight-builders/insight-builders";

// ── Helpers ────────────────────────────────────────────────────────────────

function baseInput(overrides: Partial<WeeklyInsightInput> = {}): WeeklyInsightInput {
  return WeeklyInsightInputSchema.parse({
    userId: "user-1",
    lane: "student",
    totalSessions: 5,
    totalFocusMinutes: 120,
    completedSessions: 4,
    avgDurationMinutes: 25,
    bestDurationMinutes: 40,
    rescueCompleted: 0,
    reflectionCount: 2,
    ...overrides,
  });
}

// ── Schema validation ──────────────────────────────────────────────────────

describe("weekly-intelligence schemas", () => {
  it("parses a valid WeeklyInsightInput", () => {
    const input = baseInput();
    expect(() => WeeklyInsightInputSchema.parse(input)).not.toThrow();
  });

  it("rejects negative totalSessions", () => {
    expect(() =>
      WeeklyInsightInputSchema.parse({ ...baseInput(), totalSessions: -1 }),
    ).toThrow();
  });

  it("rejects avgFocusScore above 100", () => {
    expect(() =>
      WeeklyInsightInputSchema.parse({ ...baseInput(), avgFocusScore: 101 }),
    ).toThrow();
  });

  it("parses a valid InsightFinding", () => {
    const finding = InsightFindingSchema.parse({
      category: "helped",
      observation: "Strong focus this week.",
      confidence: "medium",
    });
    expect(finding.category).toBe("helped");
  });

  it("rejects an InsightFinding with empty observation", () => {
    expect(() =>
      InsightFindingSchema.parse({
        category: "blocked",
        observation: "",
        confidence: "weak",
      }),
    ).toThrow();
  });
});

// ── buildWeeklyIntelligence ────────────────────────────────────────────────

describe("buildWeeklyIntelligence", () => {
  it("returns hasEnoughData=false when totalSessions < 3", () => {
    const result = buildWeeklyIntelligence(baseInput({ totalSessions: 2, totalFocusMinutes: 20 }));
    expect(result.hasEnoughData).toBe(false);
    expect(result.whatHelped).toEqual([]);
    expect(result.whatGotInWay).toEqual([]);
    expect(result.disclaimer).toContain("Not enough data");
  });

  it("returns hasEnoughData=false when totalFocusMinutes < 30", () => {
    const result = buildWeeklyIntelligence(baseInput({ totalSessions: 5, totalFocusMinutes: 20 }));
    expect(result.hasEnoughData).toBe(false);
  });

  it("returns hasEnoughData=true when thresholds are met", () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(result.hasEnoughData).toBe(true);
    expect(result.generatedAt).toBeGreaterThan(0);
  });

  it("generates a unique id per call", () => {
    const r1 = buildWeeklyIntelligence(baseInput());
    // Small delay to avoid same timestamp
    const r2 = buildWeeklyIntelligence(baseInput({ userId: "user-2" }));
    expect(r1.id).not.toBe(r2.id);
  });

  it("sets weekLabel to 'First Week'", () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(result.weekLabel).toBe("First Week");
  });

  it("passes the lane through to the output", () => {
    const result = buildWeeklyIntelligence(baseInput({ lane: "game_like" }));
    expect(result.lane).toBe("game_like");
  });

  it("includes a disclaimer", () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(result.disclaimer).toBeTruthy();
    expect(typeof result.disclaimer).toBe("string");
  });

  it("returns valid WeeklyIntelligence output", () => {
    const result = buildWeeklyIntelligence(baseInput());
    expect(() => WeeklyIntelligenceSchema.parse(result)).not.toThrow();
  });

  it("caps whatHelped and whatGotInWay to max 3 findings", () => {
    const result = buildWeeklyIntelligence(
      baseInput({
        completedSessions: 6,
        totalSessions: 7,
        avgFocusScore: 80,
        cleanStarts: 3,
        rescueCompleted: 2,
        bestDurationMinutes: 30,
        interruptionsAvg: 5,
        staleThreadDays: 5,
        nudgeDismissals: 4,
        avgDurationMinutes: 10,
      }),
    );
    expect(result.whatHelped.length).toBeLessThanOrEqual(3);
    expect(result.whatGotInWay.length).toBeLessThanOrEqual(3);
  });

  it("includes bestTimeWindow as suggestedFocusWindow when available", () => {
    const result = buildWeeklyIntelligence(baseInput({ bestTimeWindow: "9am-11am" }));
    expect(result.suggestedFocusWindow).toBe("9am-11am");
  });
});

// ── buildWhatHelped ────────────────────────────────────────────────────────

describe("buildWhatHelped", () => {
  it("includes consistent rhythm finding when completedSessions >= 3", () => {
    const findings = buildWhatHelped(baseInput({ completedSessions: 4, totalSessions: 5 }));
    const rhythm = findings.find((f) => f.observation.includes("Consistent rhythm"));
    expect(rhythm).toBeDefined();
    expect(rhythm?.category).toBe("helped");
  });

  it("uses 'medium' confidence when completedSessions >= 5", () => {
    const findings = buildWhatHelped(baseInput({ completedSessions: 5, totalSessions: 5 }));
    const rhythm = findings.find((f) => f.observation.includes("Consistent rhythm"));
    expect(rhythm?.confidence).toBe("medium");
  });

  it("includes focus finding when avgFocusScore >= 70", () => {
    const findings = buildWhatHelped(baseInput({ avgFocusScore: 85 }));
    const focus = findings.find((f) => f.observation.includes("Strong focus"));
    expect(focus).toBeDefined();
  });

  it("includes clean starts finding when cleanStarts >= 2", () => {
    const findings = buildWhatHelped(baseInput({ cleanStarts: 3 }));
    const clean = findings.find((f) => f.observation.includes("Clean starts"));
    expect(clean).toBeDefined();
  });

  it("includes rescue finding when rescueCompleted >= 1", () => {
    const findings = buildWhatHelped(baseInput({ rescueCompleted: 1 }));
    const rescue = findings.find((f) => f.observation.includes("Return resilience"));
    expect(rescue).toBeDefined();
    expect(rescue?.observation).toContain("1 recovery session");
  });

  it("includes best session finding when bestDurationMinutes >= 25", () => {
    const findings = buildWhatHelped(baseInput({ bestDurationMinutes: 30 }));
    const best = findings.find((f) => f.observation.includes("Best session"));
    expect(best).toBeDefined();
  });

  it("returns empty when no conditions are met", () => {
    const findings = buildWhatHelped(
      baseInput({
        completedSessions: 1,
        totalSessions: 2,
        rescueCompleted: 0,
        bestDurationMinutes: 10,
      }),
    );
    expect(findings).toEqual([]);
  });
});

// ── buildWhatGotInWay ──────────────────────────────────────────────────────

describe("buildWhatGotInWay", () => {
  it("includes missed sessions when total > completed", () => {
    const findings = buildWhatGotInWay(baseInput({ totalSessions: 6, completedSessions: 3 }));
    const missed = findings.find((f) => f.observation.includes("not completed"));
    expect(missed).toBeDefined();
  });

  it("includes interruptions finding when avg >= 3", () => {
    const findings = buildWhatGotInWay(baseInput({ interruptionsAvg: 4 }));
    const interruptions = findings.find((f) => f.observation.includes("Interruptions"));
    expect(interruptions).toBeDefined();
  });

  it("includes stale thread finding when staleThreadDays >= 3", () => {
    const findings = buildWhatGotInWay(baseInput({ staleThreadDays: 5 }));
    const stale = findings.find((f) => f.observation.includes("stale"));
    expect(stale).toBeDefined();
  });

  it("includes nudge dismissals finding when nudgeDismissals >= 2", () => {
    const findings = buildWhatGotInWay(baseInput({ nudgeDismissals: 3 }));
    const nudge = findings.find((f) => f.observation.includes("Dismissed"));
    expect(nudge).toBeDefined();
  });

  it("includes short sessions finding when avg < 15 and completed >= 3", () => {
    const findings = buildWhatGotInWay(
      baseInput({ avgDurationMinutes: 10, completedSessions: 4, totalSessions: 5 }),
    );
    const short = findings.find((f) => f.observation.includes("under 15 minutes"));
    expect(short).toBeDefined();
  });

  it("returns empty when all sessions are completed and no blockers", () => {
    const findings = buildWhatGotInWay(
      baseInput({ totalSessions: 3, completedSessions: 3, avgDurationMinutes: 25 }),
    );
    expect(findings).toEqual([]);
  });
});

// ── resolveBestNextSessionType ─────────────────────────────────────────────

describe("resolveBestNextSessionType", () => {
  it("returns STUDY for student lane with avg >= 20", () => {
    expect(resolveBestNextSessionType(baseInput({ lane: "student", avgDurationMinutes: 25 }))).toBe("STUDY");
  });

  it("returns REVIEW for student lane with avg < 20", () => {
    expect(resolveBestNextSessionType(baseInput({ lane: "student", avgDurationMinutes: 15 }))).toBe("REVIEW");
  });

  it("returns SPRINT for game_like lane with cleanStarts >= 3", () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: "game_like", cleanStarts: 3 })),
    ).toBe("SPRINT");
  });

  it("returns RECOVERY for game_like lane with cleanStarts < 3", () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: "game_like", cleanStarts: 1 })),
    ).toBe("RECOVERY");
  });

  it("returns DEEP_WORK for deep_creative lane with avg >= 25", () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: "deep_creative", avgDurationMinutes: 30 })),
    ).toBe("DEEP_WORK");
  });

  it("returns LIGHT_FOCUS for deep_creative lane with avg < 25", () => {
    expect(
      resolveBestNextSessionType(baseInput({ lane: "deep_creative", avgDurationMinutes: 20 })),
    ).toBe("LIGHT_FOCUS");
  });

  it("returns LIGHT_FOCUS for minimal_normal lane", () => {
    expect(resolveBestNextSessionType(baseInput({ lane: "minimal_normal" }))).toBe("LIGHT_FOCUS");
  });
});

// ── buildAdjustment ────────────────────────────────────────────────────────

describe("buildAdjustment", () => {
  it("suggests reviewing weak topic for student with weakTopics", () => {
    const adj = buildAdjustment(baseInput({ lane: "student", weakTopics: ["calculus"] }));
    expect(adj).toContain("calculus");
  });

  it("suggests longer sessions for short-averaging student", () => {
    const adj = buildAdjustment(
      baseInput({ lane: "student", avgDurationMinutes: 10, completedSessions: 4 }),
    );
    expect(adj).toContain("under 15 minutes");
  });

  it("suggests recovery run for game_like with blockerPattern", () => {
    const adj = buildAdjustment(baseInput({ lane: "game_like", blockerPattern: "procrastination" }));
    expect(adj).toContain("procrastination");
  });

  it("recognises recovery wins for game_like", () => {
    const adj = buildAdjustment(baseInput({ lane: "game_like", recoveryWins: 2 }));
    expect(adj).toContain("Recovery runs work");
  });

  it("suggests naming next move for deep_creative with stale threads", () => {
    const adj = buildAdjustment(baseInput({ lane: "deep_creative", staleThreadDays: 4 }));
    expect(adj).toContain("next concrete move");
  });

  it("stays quieter for minimal_normal with nudge dismissals", () => {
    const adj = buildAdjustment(baseInput({ lane: "minimal_normal", nudgeDismissals: 3 }));
    expect(adj).toContain("stay quieter");
  });

  it("returns a default for unknown scenarios", () => {
    const adj = buildAdjustment(
      baseInput({ lane: "student", completedSessions: 1, avgDurationMinutes: 30 }),
    );
    expect(adj).toBeTruthy();
  });
});

// ── buildPremiumDeeperInsight ──────────────────────────────────────────────

describe("buildPremiumDeeperInsight", () => {
  it.each(["student", "game_like", "deep_creative", "minimal_normal"] as const)(
    "returns a premium insight string for %s lane",
    (lane) => {
      const insight = buildPremiumDeeperInsight(baseInput({ lane }));
      expect(typeof insight).toBe("string");
      expect(insight!.length).toBeGreaterThan(0);
    },
  );
});

// ── Narrative for each lane ────────────────────────────────────────────────

describe("lane narratives", () => {
  it("includes student-specific parts when cleanStarts >= 2", () => {
    const result = buildWeeklyIntelligence(baseInput({ lane: "student", cleanStarts: 3 }));
    expect(result.recommendedAdjustment).toContain("Clean starts");
  });

  it("includes game_like recovery narrative when rescueCompleted >= 1", () => {
    const result = buildWeeklyIntelligence(baseInput({ lane: "game_like", rescueCompleted: 1 }));
    expect(result.recommendedAdjustment).toContain("Recovery");
  });

  it("includes deep_creative stale thread narrative", () => {
    const result = buildWeeklyIntelligence(
      baseInput({ lane: "deep_creative", staleThreadDays: 4 }),
    );
    expect(result.recommendedAdjustment).toContain("quiet");
  });

  it("includes minimal_normal quiet nudge narrative", () => {
    const result = buildWeeklyIntelligence(
      baseInput({ lane: "minimal_normal", nudgeDismissals: 3 }),
    );
    expect(result.recommendedAdjustment).toContain("quieter");
  });
});
