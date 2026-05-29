import type { Lane } from "../lane-engine/types";
import type { CompletionPersonalizationInput } from "./schemas";

type CompletionSituation = "clean" | "partial" | "abandoned" | "comeback";

export type CompletionLearning = {
  observation: string;
  evidence: string;
  confidence: "weak" | "medium" | "strong";
  recommendedAction?: string;
  isColdStart: boolean;
};

export function buildCompletionLearning(
  _input: CompletionPersonalizationInput,
  situation: CompletionSituation,
  lane: Lane,
  totalSessions: number,
): CompletionLearning | undefined {
  if (totalSessions < 3) {
    return {
      isColdStart: true,
      observation:
        "VEX is still learning. Complete one more session to make this sharper.",
      evidence: `${totalSessions} session${totalSessions === 1 ? "" : "s"} completed so far.`,
      confidence: "weak",
    };
  }

  if (situation === "clean" && lane === "student") {
    return {
      observation:
        "Your study blocks work better when the target is named first.",
      evidence: "Completed session with focus quality.",
      confidence: totalSessions >= 5 ? "medium" : "weak",
      recommendedAction: "Save what needs review next.",
      isColdStart: false,
    };
  }

  if (situation === "clean" && lane === "game_like") {
    return {
      observation: "Clean starts predict completion.",
      evidence: "This session started without friction.",
      confidence: "weak",
      recommendedAction: "Same start time next run.",
      isColdStart: false,
    };
  }

  if (situation === "clean" && lane === "deep_creative") {
    return {
      observation:
        "Next move saved. Your next project block can start there.",
      evidence: "Session ended with a clear handoff.",
      confidence: "medium",
      recommendedAction: "Resume from the saved move.",
      isColdStart: false,
    };
  }

  if (situation === "clean" && lane === "minimal_normal") {
    return {
      observation:
        "Done. VEX will keep tomorrow simple unless you ask for more.",
      evidence: "Clean session with minimal friction.",
      confidence: "weak",
      isColdStart: false,
    };
  }

  if (situation === "comeback") {
    return {
      observation:
        "You came back. VEX noticed comeback sessions work when they're short.",
      evidence: "Comeback session completed.",
      confidence: totalSessions >= 5 ? "medium" : "weak",
      recommendedAction: "Keep the next block under 20 minutes.",
      isColdStart: false,
    };
  }

  if (situation === "partial") {
    return {
      observation:
        "Partial progress still counts. Smaller blocks may help.",
      evidence: "Session was partially completed.",
      confidence: "weak",
      recommendedAction: "Try a 10-minute recovery block.",
      isColdStart: false,
    };
  }

  if (situation === "abandoned") {
    return {
      observation:
        "Not every session finishes. VEX will offer a shorter block next time.",
      evidence: "Session was abandoned.",
      confidence: "weak",
      recommendedAction: "Name the obstacle. What got in the way?",
      isColdStart: false,
    };
  }

  return undefined;
}
