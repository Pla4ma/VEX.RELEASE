import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';

export const TodayActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  ctaLabel: z.string().min(1).max(40),
  durationSeconds: z.number().int().min(5 * 60).max(90 * 60),
}).strict();

export const TodaySystemInputSchema = z.object({
  lane: LaneSchema,
  completedToday: z.number().int().min(0).default(0),
  dayFeelsMessy: z.boolean().default(false),
  hiddenFeatureKeys: z.array(z.string().min(1)).default([]),
  laterAction: TodayActionSchema.nullable().default(null),
  nowAction: TodayActionSchema.nullable().default(null),
  reducedMotion: z.boolean().default(false),
}).strict();

export const TodaySectionSchema = z.object({
  key: z.enum(['now', 'later', 'done', 'recovery']),
  visible: z.boolean(),
  title: z.string().min(1).max(24),
  body: z.string().min(1).max(96),
  ctaLabel: z.string().min(1).max(40).nullable(),
  durationSeconds: z.number().int().min(5 * 60).max(90 * 60).nullable(),
}).strict();

export const TodaySystemSchema = z.object({
  lane: LaneSchema,
  animationLevel: z.enum(['none', 'subtle']),
  sections: z.array(TodaySectionSchema).length(4),
}).strict();

export type TodayAction = z.infer<typeof TodayActionSchema>;
export type TodaySystemInput = z.infer<typeof TodaySystemInputSchema>;
export type TodaySection = z.infer<typeof TodaySectionSchema>;
export type TodaySystem = z.infer<typeof TodaySystemSchema>;
