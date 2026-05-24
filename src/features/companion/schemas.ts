/**
 * Companion Feature Schemas
 *
 * Zod schemas for companion state and mood — source of truth for companion types.
 */

import { z } from 'zod';

export const CompanionPhaseSchema = z.enum([
  'EGG',
  'HATCHING',
  'YOUNG',
  'MATURE',
  'AWAKENED',
  'TRANSCENDENT',
]);

export const CompanionMoodSchema = z.enum([
  'SLEEPY',
  'CONTENT',
  'FOCUSED',
  'DETERMINED',
  'ECSTATIC',
  'STRUGGLING',
  'DANGER',
]);

export const CompanionElementSchema = z.enum([
  'FLAME',
  'WAVE',
  'TERRA',
  'ZEPHYR',
  'VOID',
  'LUMINA',
]);

export const CompanionStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  phase: CompanionPhaseSchema,
  mood: CompanionMoodSchema,
  element: CompanionElementSchema,
  name: z.string().optional(),
  level: z.number().int().min(1).default(1),
  xp: z.number().int().min(0).default(0),
  health: z.number().min(0).max(100).default(100),
  focusEnergy: z.number().min(0).max(100).default(50),
  sessionCount: z.number().int().min(0).default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type CompanionPhase = z.infer<typeof CompanionPhaseSchema>;
export type CompanionMood = z.infer<typeof CompanionMoodSchema>;
export type CompanionElement = z.infer<typeof CompanionElementSchema>;
export type CompanionState = z.infer<typeof CompanionStateSchema>;
