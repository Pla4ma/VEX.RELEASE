import type { z } from "zod";
import {
  PremiumPersonalizationInputSchema,
} from "./personalized-premium-schemas";

type InputParsed = z.infer<typeof PremiumPersonalizationInputSchema>;

function laneFor(input: InputParsed) {
  return input.laneProfile?.primaryLane ?? input.lane;
}

export function buildFreeVsProMatrix(
  input: InputParsed,
): Array<{ free: string; pro: string }> {
  const lane = laneFor(input);
  if (
    lane === "student" ||
    (!lane &&
      (input.primaryGoal === "study" || input.primaryGoal === "learning"))
  ) {
    return [
      {
        free: "Basic study blocks",
        pro: "Deeper imports, deadline intelligence, and weekly study plan",
      },
      {
        free: "Basic review prompts",
        pro: "Advanced review queue with weak-topic tracking",
      },
      {
        free: "Simple progress",
        pro: "Weekly study risk and next-block recommendations",
      },
      {
        free: "Basic memory",
        pro: "Longer study memory with editable sources",
      },
      {
        free: "Rescue mode",
        pro: "Smarter recovery planning around deadlines",
      },
    ];
  }
  if (lane === "deep_creative") {
    return [
      {
        free: "One active project thread",
        pro: "More project threads and deeper continuity memory",
      },
      {
        free: "Basic next move",
        pro: "Flow reports and project recovery planning",
      },
      {
        free: "Simple completion memory",
        pro: "Longer handoff memory across sessions",
      },
      { free: "Rescue mode", pro: "Creative re-entry experiments" },
      { free: "Basic progress", pro: "Weekly project rhythm intelligence" },
    ];
  }
  if (lane === "minimal_normal") {
    return [
      {
        free: "Clean session loop",
        pro: "Calendar intelligence and quiet weekly planning",
      },
      {
        free: "Basic Today Strip",
        pro: "Advanced quiet automation and memory console",
      },
      {
        free: "Basic progress",
        pro: "Weekly clean planning with fewer surfaces",
      },
      { free: "Rescue mode", pro: "Personalized recovery timing" },
      {
        free: "Basic memory",
        pro: "Editable long memory with source and expiry",
      },
    ];
  }
  return [
    {
      free: "Basic run progress",
      pro: "Deeper run history and personal boss arcs",
    },
    {
      free: "Basic modifiers",
      pro: "Advanced behavior modifiers and run recap archive",
    },
    { free: "Basic progress", pro: "Weekly mastery intelligence" },
    { free: "Rescue mode", pro: "Recovery strategy for interrupted runs" },
    {
      free: "Basic memory",
      pro: "Longer blocker memory with source and confidence",
    },
  ];
}
