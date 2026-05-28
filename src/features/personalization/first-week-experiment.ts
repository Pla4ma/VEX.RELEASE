import type { Lane } from "../lane-engine/types";
import type { FirstWeekExperience, FirstWeekStage } from "./first-week-schemas";

export function resolveFirstWeekExperiment(
  lane: Lane,
  stage: FirstWeekStage,
): FirstWeekExperience["firstWeekExperiment"] {
  if (stage === "DAY_0_NOT_STARTED") return null;
  const actionByLane: Record<Lane, string> = {
    student: "Repeat one study block before adding complexity.",
    game_like: "Complete one clean encounter without economy systems.",
    deep_creative: "Save one next move at completion.",
    minimal_normal: "Keep the next session quiet and short.",
  };
  return {
    title: "Next first-week experiment",
    action: actionByLane[lane],
  };
}
