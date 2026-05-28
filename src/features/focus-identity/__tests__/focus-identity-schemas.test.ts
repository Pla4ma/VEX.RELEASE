import {
  FocusScoreFactorsSchema,
  FocusScoreHistoryPointSchema,
  FocusScoreRecordSchema,
  FocusScoreUpdateInputSchema,
  FocusScoreUpdateResultSchema,
  MonthlyFocusReportSummarySchema,
  getFocusScoreFactorsWeightTotal,
} from "../schemas";
import {
  validFactors,
  validRecord,
  validSignals,
} from "./focus-identity-schemas.fixtures";

describe("focus identity schemas", () => {
  it("accepts valid score record", () => {
    const parsed = FocusScoreRecordSchema.parse(validRecord);
    expect(parsed.currentScore).toBe(600);
    expect(parsed.band).toBe("Strong");
  });

  it("rejects score below lower bound", () => {
    expect(() =>
      FocusScoreRecordSchema.parse({
        ...validRecord,
        currentScore: 299,
      }),
    ).toThrow();
  });

  it("rejects corrupt persisted data", () => {
    expect(() =>
      FocusScoreRecordSchema.parse({
        ...validRecord,
        factors: {
          ...validFactors,
          recency: { ...validFactors.recency, score: "71" },
        },
      }),
    ).toThrow();
  });

  it("enforces factor weights totaling exactly 100", () => {
    expect(getFocusScoreFactorsWeightTotal(validFactors)).toBe(100);
  });

  it("rejects factor schema when weights do not total 100", () => {
    expect(() =>
      FocusScoreFactorsSchema.parse({
        ...validFactors,
        recency: { ...validFactors.recency, weightPercent: 20 },
      }),
    ).toThrow();
  });

  it("accepts valid update input", () => {
    const parsed = FocusScoreUpdateInputSchema.parse({
      userId: "4f093cc4-fce4-4425-ad64-4db4f3f76e95",
      previousScore: 590,
      eventType: "session:completed",
      grade: "A",
      sessionMode: "deep_work",
      occurredAt: "2026-05-06T10:00:00.000Z",
      signals: validSignals,
    });

    expect(parsed.eventType).toBe("session:completed");
    expect(parsed.signals.sessionQuality).toBe(84);
  });

  it("rejects corrupt update input with extra persisted fields", () => {
    expect(() =>
      FocusScoreUpdateInputSchema.parse({
        userId: "4f093cc4-fce4-4425-ad64-4db4f3f76e95",
        previousScore: 590,
        eventType: "session:completed",
        occurredAt: "2026-05-06T10:00:00.000Z",
        signals: {
          ...validSignals,
          unknownSignal: 42,
        },
      }),
    ).toThrow();
  });

  it("accepts history point score range edges", () => {
    expect(
      FocusScoreHistoryPointSchema.parse({
        timestamp: "2026-05-06T10:00:00.000Z",
        score: 300,
        delta: -20,
        reason: "Recovery session",
      }).score,
    ).toBe(300);

    expect(
      FocusScoreHistoryPointSchema.parse({
        timestamp: "2026-05-07T10:00:00.000Z",
        score: 850,
        delta: 20,
        reason: "Strong session completion",
      }).score,
    ).toBe(850);
  });

  it("rejects invalid history timestamps", () => {
    expect(() =>
      FocusScoreHistoryPointSchema.parse({
        timestamp: "May 6",
        score: 600,
        delta: 1,
        reason: "Session completion",
      }),
    ).toThrow();
  });

  it("enforces score range in update result", () => {
    expect(() =>
      FocusScoreUpdateResultSchema.parse({
        userId: "4f093cc4-fce4-4425-ad64-4db4f3f76e95",
        previousScore: 850,
        newScore: 851,
        delta: 1,
        band: "Legendary",
        factors: validFactors,
        topPositiveFactor: "sessionQuality",
        topNegativeFactor: "streakStability",
        focusScoreImpactRecommendation: "Keep consistency stable.",
        xpQualityMultiplier: 1.2,
        userFacingReason: "High-quality session.",
        explanations: ["Quality improved."],
        historyPoint: {
          timestamp: "2026-05-06T10:00:00.000Z",
          score: 851,
          delta: 1,
          reason: "Session completion",
        },
        updatedAt: "2026-05-06T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("accepts monthly focus report summary edge values", () => {
    const parsed = MonthlyFocusReportSummarySchema.parse({
      userId: "4f093cc4-fce4-4425-ad64-4db4f3f76e95",
      month: "2026-05",
      startScore: 300,
      endScore: 850,
      delta: 550,
      strongestPattern: "Evening deep-work consistency",
      weakestPattern: "Recovery cadence",
      sessionsCompleted: 0,
      totalFocusedMinutes: 0,
      bestGrade: "S",
      nextTargetScore: 850,
      factorAverages: {
        consistency: 100,
        streakStability: 0,
        sessionQuality: 100,
        intentionalDifficulty: 0,
        recency: 100,
      },
      generatedAt: "2026-05-06T10:00:00.000Z",
    });

    expect(parsed.startScore).toBe(300);
    expect(parsed.endScore).toBe(850);
  });
});
