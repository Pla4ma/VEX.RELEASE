import {
  CompletionProgressProofSchema,
  CompletionUserFacingSummarySchema,
  type CompletionMemoryCandidate,
  type CompletionPersonalization,
  type CompletionPersonalizationInput,
  type CompletionProgressProof,
  type CompletionUnlockDecision,
  type CompletionUserFacingSummary,
} from "./schemas";
import type { Lane } from "../lane-engine/types";
import type { SessionSummary } from "../../session/types";

type CompletionSituation = "clean" | "partial" | "abandoned" | "comeback";

export const REFLECTIONS: Record<Lane, Record<CompletionSituation, string>> = {
  deep_creative: {
    abandoned: "What broke the thread?",
    clean: "What should VEX remember for next block?",
    comeback: "What is the re-entry point?",
    partial: "Where did flow break?",
  },
  game_like: {
    abandoned: "What interrupted the encounter?",
    clean: "What kept the run clean?",
    comeback: "How do we stabilize the run?",
    partial: "What debuff hit this run?",
  },
  minimal_normal: {
    abandoned: "What got in the way?",
    clean: "Keep same setup next time?",
    comeback: "What is the next clean step?",
    partial: "What made this hard?",
  },
  student: {
    abandoned: "What pulled you away first?",
    clean: "What made this study block work?",
    comeback: "What is the smallest next review?",
    partial: "Was the task too big or unclear?",
  },
};

export function situationFor(
  summary: SessionSummary,
  isComeback: boolean,
): CompletionSituation {
  if (isComeback) return "comeback";
  if (summary.status === "ABANDONED") return "abandoned";
  return summary.completionPercentage >= 100 ? "clean" : "partial";
}

export function displayFor(
  lane: Lane,
  situation: CompletionSituation,
): Pick<
  CompletionPersonalization,
  "displayBody" | "displayTitle" | "nextActionLabel"
> {
  if (lane === "student")
    return {
      displayBody: "Review queue and next block stay attached to this finish.",
      displayTitle: "Study progress saved",
      nextActionLabel: "Review next",
    };
  if (lane === "game_like")
    return {
      displayBody: "Run progress updates from completed focus only. No currency layer.",
      displayTitle: "Encounter logged",
      nextActionLabel: "Continue run",
    };
  if (lane === "deep_creative")
    return {
      displayBody: "Your handoff becomes the next project move.",
      displayTitle: "Project thread updated",
      nextActionLabel: "Resume thread",
    };
  if (situation === "partial")
    return {
      displayBody: "Partial progress still points to one smaller next step.",
      displayTitle: "Progress kept",
      nextActionLabel: "Start recovery",
    };
  return {
    displayBody: "Clean result saved with one quiet next step.",
    displayTitle: "Session banked",
    nextActionLabel: "See next step",
  };
}

function memoryText(
  lane: Lane,
  summary: SessionSummary,
  situation: CompletionSituation,
  reflectionAnswer: string | null,
): string {
  const minutes = Math.max(1, Math.round(summary.effectiveDuration / 60));
  const evidence = `[s:${summary.sessionId}, l:${lane}, m:${minutes}m, sit:${situation}]`;
  const base =
    lane === "student"
      ? `User completed a ${minutes}-minute study block.`
      : lane === "game_like"
        ? situation === "clean"
          ? "Game-like user engages with run progress after clean completion."
          : "Game-like user needs recovery after interrupted encounter."
        : lane === "deep_creative"
          ? summary.completionPercentage >= 100
            ? "User protects creative continuity when next move exists."
            : "User may lose creative flow when the next move is unclear."
          : situation === "clean"
            ? "Minimal user benefits from quiet completion and simple next step."
            : "Minimal user needs smaller recovery step after difficult session.";
  const reflection = reflectionAnswer ? ` Reflection: ${reflectionAnswer}` : "";
  return `${base}${reflection} ${evidence}`;
}

export function buildMemoryCandidates(
  input: CompletionPersonalizationInput,
  situation: CompletionSituation,
): CompletionMemoryCandidate[] {
  const baseConfidence =
    situation === "clean"
      ? 0.72
      : situation === "comeback"
        ? 0.48
        : situation === "partial"
          ? 0.58
          : 0.35;
  const candidate = {
    confidence: input.reflectionAnswer ? baseConfidence + 0.1 : baseConfidence,
    id: `${input.summary.sessionId}:${input.lane}:${situation}`,
    source: "session_completion" as const,
    text: memoryText(input.lane, input.summary, situation, input.reflectionAnswer),
  };
  return input.deletedMemoryIds.includes(candidate.id) ? [] : [candidate];
}

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
