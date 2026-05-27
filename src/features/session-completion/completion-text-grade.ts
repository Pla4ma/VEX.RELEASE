import {
  CompletionProgressProofSchema,
  CompletionUserFacingSummarySchema,
  type CompletionPersonalization,
  type CompletionPersonalizationInput,
  type CompletionProgressProof,
  type CompletionUnlockDecision,
  type CompletionUserFacingSummary,
} from "./schemas";
import type { Lane } from "../lane-engine/types";

type CompletionSituation = "clean" | "partial" | "abandoned" | "comeback";

export function buildProgressProof(
  input: CompletionPersonalizationInput,
  situation: CompletionSituation,
  xpDelta: number,
  grade: string,
  streakDays: number,
  streakAction: "extended" | "maintained" | "broken" | "saved_by_insurance",
  focusScoreDelta: number,
  isPersonalBest: boolean,
): CompletionProgressProof {
  return CompletionProgressProofSchema.parse({
    xpDelta,
    grade,
    streakDays,
    streakAction,
    focusScoreDelta,
    effectiveMinutes: Math.max(
      1,
      Math.round(input.summary.effectiveDuration / 60),
    ),
    completionPercentage: input.summary.completionPercentage,
    interruptions: input.summary.interruptions ?? 0,
    isPersonalBest,
  });
}

export function buildUserFacingSummary(
  lane: Lane,
  situation: CompletionSituation,
  display: Pick<
    CompletionPersonalization,
    "displayBody" | "displayTitle" | "nextActionLabel"
  >,
): CompletionUserFacingSummary {
  const tone =
    situation === "clean" || situation === "comeback"
      ? ("celebration" as const)
      : situation === "partial"
        ? ("info" as const)
        : ("warning" as const);
  return CompletionUserFacingSummarySchema.parse({
    displayTitle: display.displayTitle,
    displayBody: display.displayBody,
    nextActionLabel: display.nextActionLabel,
    tone,
  });
}

export function unlockFor(
  lane: Lane,
  hiddenFeatureKeys: string[],
): CompletionUnlockDecision {
  const keyByLane = {
    deep_creative: "project_thread",
    game_like: "run_board",
    minimal_normal: "today_strip",
    student: "study_os",
  } as const;
  const key = keyByLane[lane];
  const hidden = hiddenFeatureKeys.includes(key);
  return {
    hidden,
    key,
    reason: hidden
      ? "Feature gate keeps this system out of routing and queries."
      : "Completion gave enough signal for lane-specific next surface.",
    status: hidden ? "blocked" : "teased",
  };
}
