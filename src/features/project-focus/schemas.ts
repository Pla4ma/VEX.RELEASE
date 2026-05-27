import { z } from "zod";

export const ProjectThreadSchema = z
  .object({
    bestSessionMode: z.enum(["CREATIVE", "DEEP_WORK", "LIGHT_FOCUS"]),
    blocker: z.string().min(1).nullable(),
    currentObjective: z.string().min(1),
    handoffNote: z.string().min(1).nullable(),
    id: z.string().min(1),
    lastSessionSummary: z.string().min(1).nullable(),
    lastTouched: z.number().int().min(0),
    nextMove: z.string().min(1),
    openQuestions: z.array(z.string().min(1)),
    projectTitle: z.string().min(1),
    rescuedAt: z.number().int().min(0).nullable(),
    staleRisk: z.enum(["none", "low", "medium", "high"]),
    state: z.enum([
      "new",
      "active",
      "stale",
      "blocked",
      "completed",
      "rescued",
    ]),
    userId: z.string().min(1),
  })
  .strict();

export const ProjectSessionBriefSchema = z
  .object({
    durationSeconds: z
      .number()
      .int()
      .min(5 * 60)
      .max(180 * 60),
    successCondition: z.string().min(1),
    title: z.string().min(1),
    warmup: z.string().min(1).nullable(),
  })
  .strict();

export const ProjectHomeSurfaceSchema = z
  .object({
    ctaLabel: z.string().min(1),
    hidden: z.boolean(),
    recoveryPrompt: z.string().min(1).nullable(),
    title: z.string().min(1),
  })
  .strict();

export type ProjectHomeSurface = z.infer<typeof ProjectHomeSurfaceSchema>;
export type ProjectSessionBrief = z.infer<typeof ProjectSessionBriefSchema>;
export type ProjectThread = z.infer<typeof ProjectThreadSchema>;
