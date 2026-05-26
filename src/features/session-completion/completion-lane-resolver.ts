import type { Lane } from "../lane-engine/types";
import type { SessionSummary } from "../../session/types";

export function resolveCompletionLane(summary: SessionSummary): Lane {
  if (summary.sessionMode === "STUDY") return "student";
  if (summary.sessionMode === "CREATIVE" || summary.sessionMode === "DEEP_WORK") return "deep_creative";
  if (summary.sessionMode === "SPRINT" || summary.sessionMode === "CHALLENGE") return "game_like";
  return "minimal_normal";
}
