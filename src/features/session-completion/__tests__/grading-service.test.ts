import { SessionMode } from "../../../session/modes";
import { calculateSessionGrade } from "../grading-service";
import type { SessionGradingInput } from "../grading-schemas";

const baseInput: SessionGradingInput = {
  backgroundTimeSeconds: 0,
  completedDurationSeconds: 1500,
  effectiveFocusedSeconds: 1450,
  interruptionCount: 0,
  isAbandoned: false,
  isRecoverySession: false,
  mode: SessionMode.FLOW,
  pauseCount: 0,
  strictMode: false,
  targetDurationSeconds: 1500,
};

function completedGrade(input: SessionGradingInput): string {
  const result = calculateSessionGrade(input);
  if (result.kind !== "completed") {
    throw new Error("Expected completed grading result");
  }
  return result.grade;
}

describe("calculateSessionGrade", () => {
  it("scores an S grade for peak focus execution", () => {
    expect(completedGrade({ ...baseInput, strictMode: true })).toBe("S");
  });

  it("scores an A grade for strong completion with small drags", () => {
    expect(
      completedGrade({
        ...baseInput,
        backgroundTimeSeconds: 120,
        effectiveFocusedSeconds: 1300,
        interruptionCount: 1,
        pauseCount: 2,
      }),
    ).toBe("A");
  });

  it("scores a B grade for completed but uneven focus", () => {
    expect(
      completedGrade({
        ...baseInput,
        backgroundTimeSeconds: 300,
        completedDurationSeconds: 1200,
        effectiveFocusedSeconds: 950,
        interruptionCount: 2,
        pauseCount: 3,
      }),
    ).toBe("B");
  });

  it("scores a C grade for partial usable progress", () => {
    expect(
      completedGrade({
        ...baseInput,
        backgroundTimeSeconds: 450,
        completedDurationSeconds: 900,
        effectiveFocusedSeconds: 650,
        interruptionCount: 3,
        pauseCount: 4,
      }),
    ).toBe("C");
  });

  it("scores a D grade for a completed session that needs recovery", () => {
    expect(
      completedGrade({
        ...baseInput,
        backgroundTimeSeconds: 600,
        completedDurationSeconds: 300,
        effectiveFocusedSeconds: 200,
        interruptionCount: 5,
        pauseCount: 8,
      }),
    ).toBe("D");
  });

  it("judges recovery sessions against the recovery goal", () => {
    const result = calculateSessionGrade({
      ...baseInput,
      completedDurationSeconds: 420,
      effectiveFocusedSeconds: 390,
      isRecoverySession: true,
      mode: SessionMode.RECOVERY,
      targetDurationSeconds: 600,
    });

    expect(result.kind).toBe("completed");
    if (result.kind === "completed") {
      expect(result.gradeScore).toBeGreaterThanOrEqual(84);
      expect(
        result.factorBreakdown.some((factor) =>
          factor.reason.includes(
            "Recovery session judged against recovery goals.",
          ),
        ),
      ).toBe(true);
    }
  });

  it("applies strict mode to Focus Score impact without changing the factor contract", () => {
    const standard = calculateSessionGrade({ ...baseInput, pauseCount: 2 });
    const strict = calculateSessionGrade({
      ...baseInput,
      pauseCount: 2,
      strictMode: true,
    });

    expect(standard.kind).toBe("completed");
    expect(strict.kind).toBe("completed");
    if (standard.kind === "completed" && strict.kind === "completed") {
      expect(strict.focusScoreImpactRecommendation).toBeGreaterThan(
        standard.focusScoreImpactRecommendation,
      );
      expect(strict.factorBreakdown.map((factor) => factor.id)).toEqual(
        standard.factorBreakdown.map((factor) => factor.id),
      );
    }
  });

  it("returns a separate abandoned result instead of faking a completed grade", () => {
    const result = calculateSessionGrade({ ...baseInput, isAbandoned: true });

    expect(result.kind).toBe("abandoned");
    expect(result.xpQualityMultiplier).toBeLessThan(1);
  });

  it("keeps pause-heavy completed sessions as completed with a pause penalty", () => {
    const result = calculateSessionGrade({ ...baseInput, pauseCount: 7 });

    expect(result.kind).toBe("completed");
    if (result.kind === "completed") {
      const pauseFactor = result.factorBreakdown.find(
        (factor) => factor.id === "pauseCount",
      );
      expect(pauseFactor?.score).toBeLessThan(60);
    }
  });

  it("protects short intentional sessions from being under-scored", () => {
    const result = calculateSessionGrade({
      ...baseInput,
      completedDurationSeconds: 540,
      effectiveFocusedSeconds: 500,
      interruptionCount: 1,
      pauseCount: 1,
      targetDurationSeconds: 600,
    });

    expect(result.kind).toBe("completed");
    if (result.kind === "completed") {
      expect(result.gradeScore).toBeGreaterThanOrEqual(82);
    }
  });
});
