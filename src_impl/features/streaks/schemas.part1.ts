import { z } from "zod";
import { SessionModeSchema } from "../../session/modes";


export const RiskLevelSchema = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const StreakSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  currentDays: z.number().min(0).default(0),
  longestDays: z.number().min(0).default(0),
  lastQualifyingSessionAt: z.number().nullable().default(null),
  currentDayCompletedAt: z.number().nullable().default(null),
  frozenUntil: z.number().nullable().default(null),
  shieldsAvailable: z.number().min(0).default(0),
  gracePeriodUsed: z.boolean().default(false),
  protectionDisabledUntil: z.number().nullable().default(null),
  timezone: z.string().default('UTC'),
  createdAt: z.number(),
  updatedAt: z.number(),
}).strict();

export const StreakSummarySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  currentDays: z.number().min(0),
  longestDays: z.number().min(0),
  isAtRisk: z.boolean(),
  riskLevel: RiskLevelSchema,
  nextDeadline: z.number().nullable(),
  frozenUntil: z.number().nullable(),
  shieldAvailable: z.boolean(),
  protectionDisabledUntil: z.number().nullable(),
}).strict();

export const StreakRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  current_days: z.number().min(0).default(0),
  longest_days: z.number().min(0).default(0),
  last_qualifying_session_at: StreakTimestampSchema.nullable().default(null),
  current_day_completed_at: StreakTimestampSchema.nullable().default(null),
  frozen_until: StreakTimestampSchema.nullable().default(null),
  shields_available: z.number().min(0).default(0),
  grace_period_used: z.boolean().default(false),
  protection_disabled_until: StreakTimestampSchema.nullable().default(null),
  timezone: z.string().default('UTC'),
  created_at: StreakTimestampSchema,
  updated_at: StreakTimestampSchema,
}).passthrough();

export const MilestoneRewardTypeSchema = z.enum([
  'XP',
  'COINS',
  'GEMS',
  'ITEM',
  'BADGE',
  'STREAK_SHIELD',
]);

export const StreakMilestoneSchema = z.object({
  id: z.string().uuid(),
  days: z.number().min(1),
  name: z.string(),
  description: z.string(),
  rewardType: MilestoneRewardTypeSchema,
  rewardAmount: z.number().min(0),
  rewardItemId: z.string().nullable(),
  badgeId: z.string().nullable(),
  achieved: z.boolean(),
  achievedAt: z.number().nullable(),
}).strict();

export const ShieldSourceSchema = z.enum([
  'MILESTONE_30',
  'BOSS_DEFEAT',
  'SHOP_PURCHASE',
  'PROMOTIONAL',
]);

export const StreakShieldSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  source: ShieldSourceSchema,
  used: z.boolean().default(false),
  usedAt: z.number().nullable(),
  expiresAt: z.number().nullable(),
  createdAt: z.number(),
}).strict();

export const RecoverySourceSchema = z.enum([
  'SHIELD',
  'PURCHASE',
  'SPECIAL_EVENT',
  'MANUAL',
]);

export const ComebackStateSchema = z.object({
  isComeback: z.boolean(),
  daysAbsent: z.number().int().min(0),
  streakBefore: z.number().int().min(0),
  streakNow: z.number().int().min(0),
  rewardMultiplier: z.number().min(1).max(3),
  streakRestoreEligible: z.boolean(),
  message: z.string().min(1),
}).strict();

export const StreakCalendarDaySchema = z.object({
  date: z.string(),
  hasSession: z.boolean(),
  sessionCount: z.number().min(0),
  totalDuration: z.number().min(0),
  qualifiesForStreak: z.boolean(),
}).strict();

export const StreakActionSchema = z.enum([
  'INCREMENTED',
  'MAINTAINED',
  'BROKEN',
  'SHIELD_PROTECTED',
  'FROZEN',
  'COME_BACK',
  'ALREADY_TODAY',
]);

export const StreakEngineResultSchema = z.object({
  action: StreakActionSchema,
  previousStreak: z.number().min(0),
  newStreak: z.number().min(0),
  milestoneReached: StreakMilestoneSchema.nullable(),
  shieldUsed: z.boolean(),
}).strict();

export const RecordSessionInputSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
  completedAt: z.number(),
  duration: z.number().min(0),
  qualityScore: z.number().min(0).max(100),
  sessionMode: SessionModeSchema.optional(),
}).strict();

export const UseShieldInputSchema = z.object({
  userId: z.string().uuid(),
  reason: z.enum(['MANUAL', 'AUTO']),
}).strict();

export const FreezeStreakInputSchema = z.object({
  userId: z.string().uuid(),
  durationHours: z.number().min(1).max(72),
}).strict();

export const RestoreStreakInputSchema = z.object({
  userId: z.string().uuid(),
  targetDays: z.number().min(1),
  source: RecoverySourceSchema,
}).strict();