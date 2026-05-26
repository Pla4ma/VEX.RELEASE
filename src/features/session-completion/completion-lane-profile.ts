import type { SessionSummary } from "../../session/types";
import type { Lane } from "../lane-engine/types";
import type { CompletionPersonalizationResult } from "./schemas";

type CompletionSituation = "clean" | "partial" | "abandoned" | "comeback";

export function buildLaneProfile(
  lane: Lane,
  situation: CompletionSituation,
  summary: SessionSummary,
): CompletionPersonalizationResult["laneProfile"] {
  const confidence = situation === "clean" ? 0.6 : 0.35;
  const confidenceBand = situation === "clean" ? ("medium" as const) : ("low" as const);
  return {
    primaryLane: lane,
    secondaryLane: null,
    confidence,
    confidenceBand,
    source: "behavior" as const,
    evidence: [
      {
        source: "session_mode" as const,
        value: summary.sessionMode ?? "FLOW",
        weight: 0.25,
        observedAt: Date.now(),
      },
    ],
    traits:
      lane === "student"
        ? { needsStructure: 0.9, wantsPlay: 0.2, needsContinuity: 0.6, wantsQuiet: 0.4 }
        : lane === "game_like"
          ? { needsStructure: 0.6, wantsPlay: 0.9, needsContinuity: 0.5, wantsQuiet: 0.1 }
          : lane === "deep_creative"
            ? { needsStructure: 0.5, wantsPlay: 0.2, needsContinuity: 0.9, wantsQuiet: 0.7 }
            : { needsStructure: 0.5, wantsPlay: 0.1, needsContinuity: 0.4, wantsQuiet: 0.9 },
    resolvedAt: Date.now(),
  };
}
