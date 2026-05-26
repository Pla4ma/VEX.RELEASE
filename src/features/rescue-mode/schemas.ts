import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';
import { SessionModeSchema } from '../../session/modes';

// ── Reasons ────────────────────────────────────────────────────────────
export const RescueReasonSchema = z.enum([
  'too_big',
  'tired',
  'distracted',
  'anxious',
  'unclear',
  'no_time',
]);

// ── Trigger sources ────────────────────────────────────────────────────
export const RescueTriggerSourceSchema = z.enum([
  'abandoned_session',
  'missed_planned',
  'repeated_dismissals',
  'streak_risk',
  'user_too_big',
  'notification_dismissal_pattern',
]);

// ── Eligibility ────────────────────────────────────────────────────────
export const RescueEligibilityInputSchema = z.object({
  userId: z.string().min(1),
  lane: LaneSchema,
  completedSessions: z.number().int().min(0),
  daysSinceOnboarding: z.number().int().min(0),
  abandonedSessionExists: z.boolean(),
  missedPlannedSession: z.boolean(),
  recentDismissals: z.number().int().min(0),
  streakAtRisk: z.boolean(),
  hoursUntilStreakBreak: z.number().min(0),
  hasActiveSession: z.boolean(),
  now: z.number().int().min(0).default(() => Date.now()),
}).strict();

export const RescueEligibilityResultSchema = z.object({
  eligible: z.boolean(),
  trigger: RescueTriggerSourceSchema.nullable(),
  reason: z.string().min(1),
  lane: LaneSchema,
  recommendedDurationSeconds: z.number().int().min(0).max(12 * 60),
}).strict();

// ── Plan ───────────────────────────────────────────────────────────────
export const RescuePlanSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  lane: LaneSchema,
  reason: RescueReasonSchema,
  durationSeconds: z.number().int().min(5 * 60).max(12 * 60),
  sessionMode: SessionModeSchema,
  taskDescription: z.string().min(1).max(120),
  frictionLevel: z.enum(['none', 'soft', 'medium']),
  createdAt: z.number().int().min(0),
}).strict();

export const RescuePlanInputSchema = z.object({
  userId: z.string().min(1),
  lane: LaneSchema,
  reason: RescueReasonSchema,
  durationSeconds: z.number().int().min(60).max(60 * 60).optional(),
  taskDescription: z.string().min(1).max(120).optional(),
  createdAt: z.number().int().min(0).optional(),
}).strict();

// ── Completion / Memory ────────────────────────────────────────────────
export const RescueOutcomeSchema = z.enum([
  'completed',
  'partial',
  'abandoned',
]);

export const RescueCompletionRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  planId: z.string().min(1),
  reason: RescueReasonSchema,
  lane: LaneSchema,
  durationSeconds: z.number().int().min(0),
  outcome: RescueOutcomeSchema,
  worked: z.boolean(),
  nextRecommendation: z.string().min(1).max(200),
  completedAt: z.number().int().min(0),
}).strict();

export const RescueCompletionMemorySchema = z.object({
  id: z.string().min(1),
  source: z.literal('rescue_completion'),
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
}).strict();

// ── Derived types ──────────────────────────────────────────────────────
export type RescueReason = z.infer<typeof RescueReasonSchema>;
export type RescueTriggerSource = z.infer<typeof RescueTriggerSourceSchema>;
export type RescueEligibilityInput = z.infer<typeof RescueEligibilityInputSchema>;
export type RescueEligibilityResult = z.infer<typeof RescueEligibilityResultSchema>;
export type RescuePlan = z.infer<typeof RescuePlanSchema>;
export type RescuePlanInput = z.infer<typeof RescuePlanInputSchema>;
export type RescueOutcome = z.infer<typeof RescueOutcomeSchema>;
export type RescueCompletionRecord = z.infer<typeof RescueCompletionRecordSchema>;
export type RescueCompletionMemory = z.infer<typeof RescueCompletionMemorySchema>;
