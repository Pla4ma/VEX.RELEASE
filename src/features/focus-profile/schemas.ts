import { z } from 'zod';

import { LaneProfileSchema } from '../lane-engine/schemas';
import { PrimaryGoalSchema, SessionModeSchema } from '../personalization/core-schemas';

export const FocusWindowSchema = z.object({
  label: z.string().min(1),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
  confidence: z.number().min(0).max(1),
}).strict();

export const MemoryConsentSchema = z.object({
  allowBehaviorMemory: z.boolean(),
  allowImportedContentMemory: z.boolean(),
  allowSensitiveInference: z.boolean(),
}).strict();

export const NotificationPreferenceSchema = z.object({
  maxPerDay: z.number().int().min(0).max(3),
  quietHoursStart: z.number().int().min(0).max(23),
  quietHoursEnd: z.number().int().min(0).max(23),
  tone: z.enum(['quiet', 'supportive', 'strategic']),
}).strict();

export const FocusProfileSchema = z.object({
  userId: z.string().min(1),
  laneProfile: LaneProfileSchema,
  primaryGoal: PrimaryGoalSchema,
  preferredSessionDurationMinutes: z.number().int().min(5).max(180),
  preferredSessionMode: SessionModeSchema,
  bestFocusWindows: z.array(FocusWindowSchema),
  riskWindows: z.array(FocusWindowSchema),
  avoidanceTriggers: z.array(z.string().min(1)),
  frictionPreference: z.enum(['soft', 'medium', 'hard']),
  notificationPreference: NotificationPreferenceSchema,
  memoryConsent: MemoryConsentSchema,
  updatedAt: z.number().int().min(0),
}).strict();

export const FocusProfileInputSchema = z.object({
  userId: z.string().min(1),
  laneProfile: LaneProfileSchema.optional(),
  primaryGoal: PrimaryGoalSchema.nullable().optional(),
  preferredSessionDurationMinutes: z.number().int().min(5).max(180).nullable().optional(),
  preferredSessionMode: SessionModeSchema.nullable().optional(),
  updatedAt: z.number().int().min(0).optional(),
}).strict();

export type FocusProfile = z.infer<typeof FocusProfileSchema>;
export type FocusProfileInput = z.infer<typeof FocusProfileInputSchema>;
export type FocusWindow = z.infer<typeof FocusWindowSchema>;
