import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';

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
  completedSessions: z.number().int().min(0),
  daysSinceOnboarding: z.number().int().min(0),
  sentToday: z.number().int().min(0).default(0),
  recentDismissals: z.number().int().min(0).default(0),
  quietHoursActive: z.boolean().default(false),
  userMuted: z.boolean().default(false),
  manuallyScheduled: z.boolean().default(false),
  now: z.number().int().min(0).default(() => Date.now()),
  context: z.enum(['none', 'avoidance', 'deadline', 'project_stale', 'run_open', 'weekly_ready']).default('none'),
}).strict();

export type NudgeType = z.infer<typeof NudgeTypeSchema>;
export type NudgeDecision = z.infer<typeof NudgeDecisionSchema>;
export type NudgePolicyInput = z.infer<typeof NudgePolicyInputSchema>;
