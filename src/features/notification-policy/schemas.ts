import { z } from 'zod';
import { LaneProfileSchema, LaneSchema } from '../lane-engine/schemas';

export const NudgeTypeSchema = z.enum([
  'none',
  'gentle_return',
  'rescue',
  'study_deadline',
  'project_resume',
  'run_continue',
  'weekly_insight',
]);

export const NudgeDecisionSchema = z.object({
  allowed: z.boolean(),
  type: NudgeTypeSchema,
  title: z.string().min(1).nullable(),
  body: z.string().min(1).nullable(),
  scheduledFor: z.number().int().min(0).nullable(),
  reason: z.string().min(1),
  lane: LaneSchema,
  priority: z.enum(['low', 'medium', 'high']),
  budgetRemaining: z.number().int().min(0),
}).strict();

export const NudgePolicyInputSchema = z.object({
  lane: LaneSchema,
  laneProfile: LaneProfileSchema.optional(),
  completedSessions: z.number().int().min(0),
  daysSinceOnboarding: z.number().int().min(0),
  sentToday: z.number().int().min(0).default(0),
  recentDismissals: z.number().int().min(0).default(0),
  quietHoursActive: z.boolean().default(false),
  userMuted: z.boolean().default(false),
  manuallyScheduled: z.boolean().default(false),
  now: z.number().int().min(0).default(() => Date.now()),
  context: z.enum(['none', 'avoidance', 'deadline', 'project_stale', 'run_open', 'weekly_ready']).default('none'),
  memoryConfidence: z.number().min(0).max(1).optional(),
  // Budget pause per category — repeated dismissal pauses the category
  pausedCategories: z.array(z.enum(['study', 'run', 'project', 'clean'])).default([]),
}).strict();

export const NudgeSignalTypeSchema = z.enum([
  'sent',
  'opened',
  'dismissed',
  'ignored',
  'rescue_started',
  'session_completed',
]);

export const NudgeSignalRecordSchema = z.object({
  userId: z.string().min(1),
  nudgeType: NudgeTypeSchema,
  signal: NudgeSignalTypeSchema,
  lane: LaneSchema,
  occurredAt: z.number().int().min(0),
}).strict();

export type NudgeType = z.infer<typeof NudgeTypeSchema>;
export type NudgeDecision = z.infer<typeof NudgeDecisionSchema>;
export type NudgePolicyInput = z.infer<typeof NudgePolicyInputSchema>;
export type NudgeSignalType = z.infer<typeof NudgeSignalTypeSchema>;
export type NudgeSignalRecord = z.infer<typeof NudgeSignalRecordSchema>;
