import { z } from "zod";

const FirstWeekMilestoneSchema = z
  .object({
    body: z.string().min(1),
    ctaLabel: z.string().min(1),
    day: z.number().int().min(0).max(7),
    modeReturnHook: z.string().optional(),
    title: z.string().min(1),
    tone: z.enum(["calm", "coach", "study", "celebration"]),
  })
  .strict();

export type FirstWeekMilestone = z.infer<typeof FirstWeekMilestoneSchema>;

const MILESTONES: Record<number, Omit<FirstWeekMilestone, "day">> = {
  0: {
    body: "Start one block. VEX will match a mode from this signal.",
    ctaLabel: "Start first session",
    title: "VEX matches your mode",
    tone: "calm",
  },
  1: {
    body: "VEX noted when you started and how long you stayed. Your next session will build from the same rhythm.",
    ctaLabel: "Add one more block",
    title: "VEX remembers your rhythm",
    tone: "calm",
  },
  3: {
    body: "After a few sessions, VEX can suggest what to do next based on what has worked.",
    ctaLabel: "See what VEX suggests",
    title: "VEX shows what it learned",
    tone: "coach",
  },
  5: {
    body: "Your mode is starting to feel more personal. VEX has enough signal to adapt instead of guessing.",
    ctaLabel: "Start your next session",
    title: "Your mode feels more personal",
    tone: "coach",
  },
  7: {
    body: "VEX has your first full week of rhythm. A weekly view is ready so you can see patterns, not just sessions.",
    ctaLabel: "Open weekly view",
    title: "First weekly intelligence",
    tone: "celebration",
  },
};

export function getFirstWeekMilestone(
  totalCompletedSessions: number,
): FirstWeekMilestone | null {
  const milestone = MILESTONES[totalCompletedSessions];
  if (!milestone) return null;

  return FirstWeekMilestoneSchema.parse({
    ...milestone,
    day: totalCompletedSessions,
  });
}

export function getNextMilestone(
  totalCompletedSessions: number,
): FirstWeekMilestone | null {
  const milestoneDays = Object.keys(MILESTONES)
    .map(Number)
    .filter((day) => day > totalCompletedSessions)
    .sort((a, b) => a - b);

  if (milestoneDays.length === 0) return null;

  const nextDay = milestoneDays[0]!;
  const milestone = MILESTONES[nextDay]!;

  return FirstWeekMilestoneSchema.parse({
    ...milestone,
    day: nextDay,
  });
}

export function getMilestoneProgress(
  totalCompletedSessions: number,
): { current: number; next: number | null; label: string } {
  const milestoneDays = Object.keys(MILESTONES).map(Number).sort((a, b) => a - b);
  let current = 0;

  for (const day of milestoneDays) {
    if (totalCompletedSessions >= day) {
      current = day;
    }
  }

  const remaining = milestoneDays.filter((d) => d > current);
  const next = remaining.length > 0 ? (remaining[0] ?? null) : null;

  const label =
    next !== null
      ? `${totalCompletedSessions} of ${next} sessions until next insight`
      : "Weekly intelligence ready";

  return { current, next, label };
}
