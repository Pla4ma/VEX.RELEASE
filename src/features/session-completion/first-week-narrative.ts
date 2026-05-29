import { z } from "zod";
import type { JourneyState } from "../retention-loop/schemas";

const FirstWeekMilestoneSchema = z
  .object({
    title: z.string().min(1),
    body: z.string().min(1),
    ctaLabel: z.string().min(1),
    tone: z.enum(["calm", "coach", "study", "celebration"]),
    day: z.number().int().min(0).max(7),
    modeReturnHook: z.string().optional(),
  })
  .strict();

export type FirstWeekMilestone = z.infer<typeof FirstWeekMilestoneSchema>;

export function getFirstWeekMilestone(
  journeyState: JourneyState,
): FirstWeekMilestone | null {
  if (journeyState.day === 0) return null;

  const toneMap: Record<string, FirstWeekMilestone["tone"]> = {
    warm: "calm",
    direct: "coach",
    humble: "coach",
    encouraging: "calm",
    proof: "celebration",
  };
  const tone = toneMap[journeyState.homeMessage.tone] ?? "calm";

  return FirstWeekMilestoneSchema.parse({
    title: journeyState.homeMessage.headline,
    body: journeyState.completionPayoff,
    ctaLabel: journeyState.primaryCta,
    tone,
    day: journeyState.day,
    modeReturnHook: journeyState.returnReason,
  });
}

export function getNextMilestone(
  journeyDay: number,
): { day: number; label: string } | null {
  const nextDay = journeyDay < 7 ? journeyDay + 1 : null;
  if (nextDay === null) return null;
  return { day: nextDay, label: `Next insight in ${nextDay - journeyDay} day${nextDay - journeyDay === 1 ? "" : "s"}` };
}

export function getMilestoneProgress(
  journeyDay: number,
): { current: number; next: number | null; label: string } {
  const next = journeyDay < 7 ? journeyDay + 1 : null;
  const label =
    next !== null
      ? `Day ${journeyDay} of 7 — ${7 - journeyDay} day${7 - journeyDay === 1 ? "" : "s"} until weekly intelligence`
      : "Weekly intelligence ready";

  return { current: journeyDay, next, label };
}
