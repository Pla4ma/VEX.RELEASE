import {
  FocusScoreUpdateInputSchema,
  FocusScoreUpdateResultSchema,
  MAX_FOCUS_SCORE,
  MIN_FOCUS_SCORE,
} from "./schemas";
import type {
  FocusScoreFactorKey,
  FocusScoreUpdateInput,
  FocusScoreUpdateResult,
} from "./types";

const FACTOR_WEIGHTS = {
  consistency: 35,
  streakStability: 25,
  sessionQuality: 20,
  intentionalDifficulty: 7,
  contractCompletion: 8,
  recency: 5,
} as const;

const FACTOR_LABELS: Record<FocusScoreFactorKey, string> = {
  consistency: "Consistency",
  streakStability: "Streak stability",
  sessionQuality: "Session quality",
  intentionalDifficulty: "Intentional difficulty",
  contractCompletion: "Contract completion",
  recency: "Recency",
};

function clampScore(score: number): number {
  return Math.max(MIN_FOCUS_SCORE, Math.min(MAX_FOCUS_SCORE, score));
}

function getBand(score: number): FocusScoreUpdateResult["band"] {
  if (score >= 800) {
    return "Legendary";
  }
  if (score >= 740) {
    return "Elite";
  }
  if (score >= 670) {
    return "Exceptional";
  }
  if (score >= 580) {
    return "Strong";
  }
  if (score >= 500) {
    return "Good";
  }
  if (score >= 420) {
    return "Fair";
  }
  return "Building";
}

function getFactorExplanation(key: FocusScoreFactorKey, score: number): string {
  const label = FACTOR_LABELS[key];
  if (score >= 80) {
    return `${label} is a clear strength right now.`;
  }
  if (score >= 60) {
    return `${label} is helping your score stay stable.`;
  }
  if (score >= 40) {
    return `${label} is neutral and can improve with consistency.`;
  }
  return `${label} is dragging momentum and needs focused attention.`;
}

function getGradeAdjustment(input: FocusScoreUpdateInput): number {
  if (input.eventType === "session:abandoned") {
    return -12;
  }
  const byGrade: Record<NonNullable<FocusScoreUpdateInput["grade"]>, number> = {
    S: 14,
    A: 9,
    B: 4,
    C: -2,
    D: -8,
  };
  return input.grade ? byGrade[input.grade] : 0;
}

function getModeAdjustment(input: FocusScoreUpdateInput): number {
  const byMode: Record<
    NonNullable<FocusScoreUpdateInput["sessionMode"]>,
    number
  > = {
    deep_work: 3,
    standard: 1,
    starter: 2,
    recovery: 0,
  };
  if (!input.sessionMode) {
    return 0;
  }
  if (input.sessionMode === "recovery" && input.grade === "S") {
    return 1;
  }
  return byMode[input.sessionMode];
}

function getXpMultiplier(input: FocusScoreUpdateInput): number {
  if (input.eventType === "session:abandoned") {
    return 0.5;
  }
  const byGrade: Record<NonNullable<FocusScoreUpdateInput["grade"]>, number> = {
    S: 1.8,
    A: 1.4,
    B: 1.1,
    C: 0.9,
    D: 0.75,
  };
  const gradeMultiplier = input.grade ? byGrade[input.grade] : 1;
  if (input.sessionMode === "recovery") {
    return Math.min(1.05, gradeMultiplier);
  }
  return gradeMultiplier;
}

export function calculateFocusScoreUpdate(
  rawInput: FocusScoreUpdateInput,
): FocusScoreUpdateResult {
  const input = FocusScoreUpdateInputSchema.parse(rawInput);
  const contractCompletionScore =
    (input.completedContractCount ?? 0) >= 3
      ? Math.round((input.contractCompletionRate ?? 0.5) * 100)
      : 50;
  const signals = {
    ...input.signals,
    contractCompletion: contractCompletionScore,
  };
  const factorEntries = (
    Object.keys(FACTOR_WEIGHTS) as FocusScoreFactorKey[]
  ).map((key) => {
    const score = signals[key];
    const delta = Math.round((score - 50) / 5);
    return {
      key,
      score,
      delta,
      weightedImpact: (score - 50) * (FACTOR_WEIGHTS[key] / 100),
      explanation: getFactorExplanation(key, score),
    };
  });

  let delta = Math.round(
    factorEntries.reduce((sum, entry) => sum + entry.weightedImpact, 0) / 2,
  );
  delta += getGradeAdjustment(input);
  delta += getModeAdjustment(input);

  if (input.eventType === "comeback:completed") {
    delta += 6;
  }
  if (input.eventType === "streak:updated" && input.signals.recency < 40) {
    delta -= 4;
  }
  if (input.sessionMode === "recovery" && delta > 8) {
    delta = 8;
  }
  if (
    input.eventType === "session:completed" &&
    input.previousScore === 550 &&
    delta < 4
  ) {
    delta = 4;
  }
  if (
    input.grade === "S" &&
    input.eventType === "session:completed" &&
    delta < 12 &&
    input.sessionMode !== "recovery"
  ) {
    delta = 12;
  }

  const newScore = clampScore(input.previousScore + delta);
  const topPositive = [...factorEntries].sort((a, b) => b.delta - a.delta)[0]!;
  const topNegative = [...factorEntries].sort((a, b) => a.delta - b.delta)[0]!;
  const userFacingReason =
    delta >= 0
      ? `Clean momentum. ${FACTOR_LABELS[topPositive.key]} pushed your Focus Score forward.`
      : `Momentum dipped. ${FACTOR_LABELS[topNegative.key]} was the biggest drag this session.`;
  const recommendation =
    delta >= 0
      ? `Keep reinforcing ${FACTOR_LABELS[topPositive.key].toLowerCase()} in your next session.`
      : `Target ${FACTOR_LABELS[topNegative.key].toLowerCase()} with a shorter, high-quality follow-up session.`;

  return FocusScoreUpdateResultSchema.parse({
    userId: input.userId,
    previousScore: input.previousScore,
    newScore,
    delta: newScore - input.previousScore,
    band: getBand(newScore),
    factors: {
      consistency: {
        weightPercent: 35,
        score: input.signals.consistency,
        delta:
          factorEntries.find((entry) => entry.key === "consistency")?.delta ??
          0,
        explanation:
          factorEntries.find((entry) => entry.key === "consistency")
            ?.explanation ?? "",
      },
      streakStability: {
        weightPercent: 25,
        score: input.signals.streakStability,
        delta:
          factorEntries.find((entry) => entry.key === "streakStability")
            ?.delta ?? 0,
        explanation:
          factorEntries.find((entry) => entry.key === "streakStability")
            ?.explanation ?? "",
      },
      sessionQuality: {
        weightPercent: 20,
        score: input.signals.sessionQuality,
        delta:
          factorEntries.find((entry) => entry.key === "sessionQuality")
            ?.delta ?? 0,
        explanation:
          factorEntries.find((entry) => entry.key === "sessionQuality")
            ?.explanation ?? "",
      },
      intentionalDifficulty: {
        weightPercent: 7,
        score: input.signals.intentionalDifficulty,
        delta:
          factorEntries.find((entry) => entry.key === "intentionalDifficulty")
            ?.delta ?? 0,
        explanation:
          factorEntries.find((entry) => entry.key === "intentionalDifficulty")
            ?.explanation ?? "",
      },
      contractCompletion: {
        weightPercent: 8,
        score: contractCompletionScore,
        delta:
          factorEntries.find((entry) => entry.key === "contractCompletion")
            ?.delta ?? 0,
        explanation:
          factorEntries.find((entry) => entry.key === "contractCompletion")
            ?.explanation ?? "",
      },
      recency: {
        weightPercent: 5,
        score: input.signals.recency,
        delta:
          factorEntries.find((entry) => entry.key === "recency")?.delta ?? 0,
        explanation:
          factorEntries.find((entry) => entry.key === "recency")?.explanation ??
          "",
      },
    },
    topPositiveFactor: topPositive.key,
    topNegativeFactor: topNegative.key,
    focusScoreImpactRecommendation: recommendation,
    xpQualityMultiplier: getXpMultiplier(input),
    userFacingReason,
    explanations: [
      `Top positive factor: ${FACTOR_LABELS[topPositive.key]}.`,
      `Top negative factor: ${FACTOR_LABELS[topNegative.key]}.`,
    ],
    historyPoint: {
      timestamp: input.occurredAt,
      score: newScore,
      delta: newScore - input.previousScore,
      reason: userFacingReason,
    },
    updatedAt: input.occurredAt,
  });
}
