import {
  type SessionGradeFactor,
  type SessionGradingInput,
} from "./grading-schemas";
import { FACTOR_WEIGHTS, clamp } from "./grading-helpers";

export function buildFactors(input: SessionGradingInput): SessionGradeFactor[] {
  const completionTarget = input.isRecoverySession ? 0.7 : 1;
  const completionRatio = clamp(
    input.completedDurationSeconds / input.targetDurationSeconds,
    0,
    1.15,
  );
  const effectiveRatio = clamp(
    input.effectiveFocusedSeconds / Math.max(input.completedDurationSeconds, 1),
    0,
    1,
  );
  const completionScore = clamp(
    (completionRatio / completionTarget) * 100,
    0,
    100,
  );
  const effectiveScore = clamp(effectiveRatio * 100, 0, 100);
  const pausePenalty = input.pauseCount * (input.isRecoverySession ? 4 : 6);
  const interruptionPenalty =
    input.interruptionCount * (input.isRecoverySession ? 6 : 10);
  const backgroundPenalty = clamp(
    (input.backgroundTimeSeconds / input.targetDurationSeconds) * 100,
    0,
    100,
  );
  const modeScore =
    input.mode === "RECOVERY" ? 90 : input.mode === "CHALLENGE" ? 75 : 82;
  const strictScore = input.strictMode ? 100 : 72;

  return [
    {
      contribution: (completionScore * FACTOR_WEIGHTS.completionRatio) / 100,
      id: "completionRatio",
      label: "Completion ratio",
      reason:
        completionRatio >= 1
          ? "Hit full target duration."
          : "Closed partial target duration.",
      score: completionScore,
      weight: FACTOR_WEIGHTS.completionRatio,
    },
    {
      contribution: (effectiveScore * FACTOR_WEIGHTS.effectiveFocusTime) / 100,
      id: "effectiveFocusTime",
      label: "Effective focus time",
      reason:
        effectiveScore >= 85
          ? "Focused time stayed high."
          : "Focus drifted during the block.",
      score: effectiveScore,
      weight: FACTOR_WEIGHTS.effectiveFocusTime,
    },
    {
      contribution:
        (Math.max(0, 100 - pausePenalty) * FACTOR_WEIGHTS.pauseCount) / 100,
      id: "pauseCount",
      label: "Pause count",
      reason:
        input.pauseCount === 0
          ? "No pauses taken."
          : `${input.pauseCount} pauses reduced quality.`,
      score: Math.max(0, 100 - pausePenalty),
      weight: FACTOR_WEIGHTS.pauseCount,
    },
    {
      contribution:
        (Math.max(0, 100 - interruptionPenalty) *
          FACTOR_WEIGHTS.interruptionCount) /
        100,
      id: "interruptionCount",
      label: "Interruption count",
      reason:
        input.interruptionCount === 0
          ? "No interruptions detected."
          : `${input.interruptionCount} interruptions impacted flow.`,
      score: Math.max(0, 100 - interruptionPenalty),
      weight: FACTOR_WEIGHTS.interruptionCount,
    },
    {
      contribution: (strictScore * FACTOR_WEIGHTS.strictMode) / 100,
      id: "strictMode",
      label: "Strict mode",
      reason: input.strictMode
        ? "Strict mode improved quality confidence."
        : "Standard mode applied.",
      score: strictScore,
      weight: FACTOR_WEIGHTS.strictMode,
    },
    {
      contribution: (modeScore * FACTOR_WEIGHTS.sessionMode) / 100,
      id: "sessionMode",
      label: "Session mode",
      reason: input.isRecoverySession
        ? "Recovery session judged against recovery goals."
        : "Mode weighting applied for difficulty.",
      score: modeScore,
      weight: FACTOR_WEIGHTS.sessionMode,
    },
    {
      contribution:
        (Math.max(0, 100 - backgroundPenalty) * FACTOR_WEIGHTS.backgroundTime) /
        100,
      id: "backgroundTime",
      label: "Background time",
      reason:
        input.backgroundTimeSeconds === 0
          ? "Stayed present in-app."
          : "Background time reduced continuity.",
      score: Math.max(0, 100 - backgroundPenalty),
      weight: FACTOR_WEIGHTS.backgroundTime,
    },
  ];
}
