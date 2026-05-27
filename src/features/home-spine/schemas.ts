import { z } from "zod";

export const HomeActionIntentSchema = z.enum([
  "start-session",
  "accept-coach-recommendation",
  "continue-study-plan",
]);

export type HomeActionIntent = z.infer<typeof HomeActionIntentSchema>;

export const HomeHighlightSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  tone: z.enum(["celebration", "info", "warning"]),
});

export type HomeHighlight = z.infer<typeof HomeHighlightSchema>;

export const HomeReturnReasonStateSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  ctaLabel: z.string().min(1),
  intent: HomeActionIntentSchema,
  source: z.enum([
    "coach",
    "comeback",
    "study-plan",
    "next-best-action",
    "completion-highlight",
  ]),
  tone: z.enum(["default", "celebration", "info", "warning"]),
  recommendationId: z.string().min(1).optional(),
  suggestedDifficulty: z
    .enum(["EASY", "NORMAL", "CHALLENGING", "PUSH"])
    .optional(),
  suggestedDurationSeconds: z.number().int().positive().optional(),
});

export type HomeReturnReasonState = z.infer<typeof HomeReturnReasonStateSchema>;

export const HomeCardSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  ctaLabel: z.string().min(1),
});

export type HomeCard = z.infer<typeof HomeCardSchema>;

export const HomeSpineModelSchema = z.object({
  primaryAction: HomeCardSchema,
  progressSignal: HomeCardSchema,
  returnReason: HomeReturnReasonStateSchema,
});

export type HomeSpineModel = z.infer<typeof HomeSpineModelSchema>;
