import { z } from 'zod';
import {
  RecommendationTypeSchema,
  RecommendationSourceSchema,
  RecommendationStatusSchema,
  ReminderTypeSchema,
  ComebackStatusSchema,
} from './enums';

export const SessionRecommendationSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    recommendationType: RecommendationTypeSchema,
    title: z.string().min(1).max(100),
    description: z.string().max(500),
    priority: z.number().int().min(1).max(10),
    reason: z.string().max(500),
    metadata: z.record(z.string(), z.unknown()).default({}),
    suggestedDuration: z.number().int().min(60).max(7200).optional(),
    suggestedDifficulty: z
      .enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH'])
      .optional(),
    reasoning: z.string().max(500).optional(),
    confidence: z.number().min(0).max(1).optional(),
    basedOn: z.array(RecommendationSourceSchema).max(5).optional(),
    expiresAt: z.number().int().positive(),
    createdAt: z.number().int().positive(),
    acceptedAt: z.number().int().positive().nullable().optional(),
    dismissedAt: z.number().int().positive().nullable().optional(),
    status: RecommendationStatusSchema,
  })
  .strict();

export const ReminderPlanSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    reminderType: ReminderTypeSchema,
    scheduledFor: z.number().int().positive(),
    messageId: z.string().uuid(),
    priority: z.number().int().min(1).max(10),
    sent: z.boolean(),
    sentAt: z.number().int().positive().nullable(),
    delivered: z.boolean(),
    opened: z.boolean(),
  })
  .strict();

export const ComebackMessageSchema = z
  .object({
    id: z.string().uuid(),
    day: z.number().int().min(1).max(7),
    content: z.string().max(500),
    sent: z.boolean(),
    sentAt: z.number().int().positive().nullable(),
  })
  .strict();

export const ComebackPlanSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    previousStreak: z.number().int().min(0),
    daysInactive: z.number().int().min(1),
    status: ComebackStatusSchema,
    startedAt: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
    sessionsCompleted: z.number().int().min(0),
    targetSessions: z.number().int().min(1).max(7),
    bonusMultiplier: z.number().min(1).max(5),
    messages: z.array(ComebackMessageSchema).max(7),
  })
  .strict();

export const DifficultyProfileSchema = z
  .object({
    userId: z.string().uuid(),
    currentDifficulty: z.number().min(1).max(10),
    recommendedDifficulty: z.number().min(1).max(10),
    lastAdjustmentAt: z.number().int().positive(),
    adjustmentReason: z.string().max(200).nullable(),
    successRateRecent: z.number().min(0).max(1),
    successRateOverall: z.number().min(0).max(1),
    trend: z.enum(['IMPROVING', 'STABLE', 'DECLINING']),
  })
  .strict();

// --- Inferred types ---

export type SessionRecommendation = z.infer<typeof SessionRecommendationSchema>;
export type ReminderPlan = z.infer<typeof ReminderPlanSchema>;
export type ComebackMessage = z.infer<typeof ComebackMessageSchema>;
export type ComebackPlan = z.infer<typeof ComebackPlanSchema>;
export type DifficultyProfile = z.infer<typeof DifficultyProfileSchema>;
