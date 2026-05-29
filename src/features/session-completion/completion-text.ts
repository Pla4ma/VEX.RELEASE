import type { SessionSummary } from "../../session/types";
import type { Lane } from "../lane-engine/types";
import type {
  CompletionMemoryCandidate,
  CompletionPersonalization,
  CompletionPersonalizationInput,
} from "./schemas";
import {
  buildProgressProof,
  buildUserFacingSummary,
  unlockFor,
} from "./completion-text-grade";
import { buildCompletionLearning } from "./completion-learning";
import type { CompletionLearning } from "./completion-learning";

export { buildProgressProof, buildUserFacingSummary, unlockFor, buildCompletionLearning };
export type { CompletionLearning };

type CompletionSituation = "clean" | "partial" | "abandoned" | "comeback";

export const REFLECTIONS: Record<Lane, Record<CompletionSituation, string>> = {
  deep_creative: {
    abandoned: "What broke the thread?",
    clean: "What should VEX remember for next block?",
    comeback: "What is the re-entry point?",
    partial: "Where did flow break?",
  },
  game_like: {
    abandoned: "What interrupted your run?",
    clean: "What kept the run clean?",
    comeback: "How do you stabilize the run?",
    partial: "What broke your momentum?",
  },
  minimal_normal: {
    abandoned: "What got in the way?",
    clean: "Keep this setup for next time?",
    comeback: "What is the next clean step?",
    partial: "What made this one hard?",
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
      displayBody:
        "Momentum logged from real focus. No coins, no boosts.",
      displayTitle: "Run completed",
      nextActionLabel: "Next run",
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
    displayTitle: "Done for now",
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
          ? "Run user maintains momentum after clean completion."
          : "Run user needs recovery after interrupted block."
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
    text: memoryText(
      input.lane,
      input.summary,
      situation,
      input.reflectionAnswer,
    ),
  };
  return input.deletedMemoryIds.includes(candidate.id) ? [] : [candidate];
}
