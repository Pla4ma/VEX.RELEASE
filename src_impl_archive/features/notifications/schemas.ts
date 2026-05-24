import { z } from 'zod';

export const RetentionReminderTypeSchema = z.enum([
  'RETENTION_ONBOARDING_DAY_1',
  'RETENTION_ONBOARDING_DAY_3',
  'RETENTION_ONBOARDING_DAY_7',
  'RETENTION_STREAK_PROTECTION',
  'RETENTION_RE_ENGAGEMENT',
  'RETENTION_CHALLENGE_EXPIRY',
]);

export const ReminderMetadataSchema = z.record(z.unknown());

export const ReminderPlanInputSchema = z.object({
  userId: z.string().uuid(),
  type: RetentionReminderTypeSchema,
  scheduledFor: z.number().int().positive(),
  message: z.string().min(1).max(500),
  metadata: ReminderMetadataSchema,
}).strict();

export const ReminderPlanRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  reminder_type: RetentionReminderTypeSchema,
  scheduled_for: z.number().int().positive(),
  delivery_method: z.enum(['IN_APP', 'PUSH', 'BOTH', 'DEFERRED']).default('BOTH'),
  status: z.enum(['SCHEDULED', 'DELIVERED', 'FAILED', 'CANCELLED']),
  context: z.object({
    message: z.string().min(1).max(500),
    metadata: ReminderMetadataSchema,
  }).passthrough(),
  created_at: z.number().int().positive(),
  updated_at: z.number().int().positive().optional(),
}).passthrough();

export const RetentionUserProfileSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nullable(),
}).strict();

export const ChallengeExpiryCandidateSchema = z.object({
  userId: z.string().uuid(),
  challengeId: z.string().min(1),
  title: z.string().min(1),
  currentValue: z.number().nonnegative(),
  targetValue: z.number().positive(),
  expiresAt: z.number().int().positive(),
}).strict();

export const NotificationCenterTypeSchema = z.enum([
  'ACHIEVEMENT',
  'STREAK_RISK',
  'BOSS',
  'SQUAD',
  'RIVAL',
  'COACH',
  'REWARD',
  'LEVEL_UP',
]);

export const NotificationCenterItemSchema = z.object({
  id: z.string().min(1),
  type: NotificationCenterTypeSchema,
  title: z.string(),
  message: z.string(),
  timestamp: z.number().int(),
  read: z.boolean(),
  avatar: z.string().optional(),
  actionText: z.string().optional(),
  actionRoute: z.string().optional(),
  actionParams: z.record(z.unknown()).optional(),
}).strict();

export type RetentionReminderType = z.infer<typeof RetentionReminderTypeSchema>;
export type ReminderPlanInput = z.infer<typeof ReminderPlanInputSchema>;
export type ReminderPlanRow = z.infer<typeof ReminderPlanRowSchema>;
export type RetentionUserProfile = z.infer<typeof RetentionUserProfileSchema>;
export type ChallengeExpiryCandidate = z.infer<typeof ChallengeExpiryCandidateSchema>;
export type NotificationCenterType = z.infer<typeof NotificationCenterTypeSchema>;
export type NotificationCenterItem = z.infer<typeof NotificationCenterItemSchema>;
