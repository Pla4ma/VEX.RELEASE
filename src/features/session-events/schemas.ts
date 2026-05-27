import { z } from "zod";

export const MidSessionEventTypeSchema = z.enum([
  "BOSS_TAUNT",
  "PURITY_PULSE",
  "COMBO_WINDOW",
  "DISTRACTION_WAVE",
  "FOCUS_ZONE",
  "BOSS_RAGE",
]);

export const MidSessionBossTauntsSchema = z
  .object({
    spawn: z.string().min(1).optional(),
    halfHealth: z.string().min(1).optional(),
    nearDeath: z.string().min(1).optional(),
  })
  .strict();

export const EvaluateMidSessionEventInputSchema = z
  .object({
    elapsedSeconds: z.number().int().min(0),
    isPaused: z.boolean(),
    purityScore: z.number().min(0).max(100),
    bossHealthPercent: z.number().min(0).max(100).nullable(),
    sessionDurationSeconds: z.number().int().positive(),
    lastEventKey: z.string().nullable(),
    bossTaunts: MidSessionBossTauntsSchema.nullable().optional(),
  })
  .strict();

export const MidSessionEventSchema = z
  .object({
    key: z.string().min(1),
    type: MidSessionEventTypeSchema,
    title: z.string().min(1),
    message: z.string().min(1),
    toastType: z.enum(["success", "warning", "info"]),
    haptic: z.enum(["selection", "warning", "impactLight", "impactMedium"]),
  })
  .strict();

export type MidSessionEventType = z.infer<typeof MidSessionEventTypeSchema>;
export type MidSessionBossTaunts = z.infer<typeof MidSessionBossTauntsSchema>;
export type EvaluateMidSessionEventInput = z.infer<
  typeof EvaluateMidSessionEventInputSchema
>;
export type MidSessionEvent = z.infer<typeof MidSessionEventSchema>;
