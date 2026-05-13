import { z } from "zod";


export const DeduplicationKeySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),

  // What makes this unique
  actionType: z.enum([
    'SESSION_COMPLETE',
    'DAILY_LOGIN',
    'STREAK_MILESTONE',
    'ACHIEVEMENT_UNLOCK',
    'BOSS_DEFEAT',
    'LEVEL_UP',
    'QUEST_COMPLETE',
    'CHALLENGE_COMPLETE',
    'SQUAD_JOIN',
    'PURCHASE_COMPLETE',
    'REWARD_CLAIM',
  ]),

  // Context that makes it unique
  contextKey: z.string(), // e.g., "session_12345", "day_2024-01-15", "achievement_first_session"
  contextData: z.record(z.unknown()).optional(),

  // Time-based deduplication
  timeWindow: z.number().min(0), // seconds, 0 = forever
  expiresAt: z.number().optional(),

  // Metadata
  source: z.string(),
  sourceId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),

  // State
  isUsed: z.boolean(),
  usedAt: z.number().nullable(),
  attempts: z.number().min(0),

  createdAt: z.number(),
  updatedAt: z.number(),
});

export const DeduplicationRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),

  // What this rule applies to
  actionType: z.enum([
    'SESSION_COMPLETE',
    'DAILY_LOGIN',
    'STREAK_MILESTONE',
    'ACHIEVEMENT_UNLOCK',
    'BOSS_DEFEAT',
    'LEVEL_UP',
    'QUEST_COMPLETE',
    'CHALLENGE_COMPLETE',
    'SQUAD_JOIN',
    'PURCHASE_COMPLETE',
    'REWARD_CLAIM',
  ]),

  // How to generate the context key
  keyTemplate: z.string(), // e.g., "session_{sessionId}", "daily_{userId}_{date}", "achievement_{userId}_{achievementId}"
  keyVariables: z.array(z.string()), // e.g., ["sessionId", "date", "achievementId"]

  // Time window for deduplication
  timeWindow: z.number().min(0), // 0 = forever
  resetSchedule: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),

  // Conditions
  conditions: z.object({
    minLevel: z.number().min(1).nullable(),
    maxLevel: z.number().nullable(),
    requiredEntitlements: z.array(z.string()).optional(),
    excludedFromEvents: z.boolean().optional(),
  }),

  // Actions
  actions: z.object({
    blockDuplicate: z.boolean(),
    warnOnAttempt: z.boolean(),
    logAttempt: z.boolean(),
    customMessage: z.string().nullable(),
  }),

  isActive: z.boolean(),
  priority: z.number().min(1),
});

export const DeduplicationAttemptSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),

  // What was attempted
  actionType: z.enum([
    'SESSION_COMPLETE',
    'DAILY_LOGIN',
    'STREAK_MILESTONE',
    'ACHIEVEMENT_UNLOCK',
    'BOSS_DEFEAT',
    'LEVEL_UP',
    'QUEST_COMPLETE',
    'CHALLENGE_COMPLETE',
    'SQUAD_JOIN',
    'PURCHASE_COMPLETE',
    'REWARD_CLAIM',
  ]),
  contextKey: z.string(),

  // Result
  result: z.enum(['ALLOWED', 'BLOCKED_DUPLICATE', 'BLOCKED_RULE', 'ERROR']),
  reason: z.string().nullable(),

  // Context
  source: z.string(),
  sourceId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),

  // Timing
  createdAt: z.number(),
});

export const DeduplicationRequestSchema = z.object({
  userId: z.string().uuid(),
  actionType: z.enum([
    'SESSION_COMPLETE',
    'DAILY_LOGIN',
    'STREAK_MILESTONE',
    'ACHIEVEMENT_UNLOCK',
    'BOSS_DEFEAT',
    'LEVEL_UP',
    'QUEST_COMPLETE',
    'CHALLENGE_COMPLETE',
    'SQUAD_JOIN',
    'PURCHASE_COMPLETE',
    'REWARD_CLAIM',
  ]),
  contextData: z.record(z.unknown()),
  source: z.string(),
  sourceId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  userLevel: z.number().min(1),
  isPremiumUser: z.boolean(),
});

export const DeduplicationResultSchema = z.object({
  allowed: z.boolean(),
  deduplicationKey: z.string().nullable(),
  result: z.enum(['ALLOWED', 'BLOCKED_DUPLICATE', 'BLOCKED_RULE', 'ERROR']),
  reason: z.string().nullable(),
  warningMessage: z.string().nullable(),
  existingKey: DeduplicationKeySchema.nullable(),
  ruleApplied: DeduplicationRuleSchema.nullable(),
  requiresPremium: z.boolean(),
  premiumUpgradeMessage: z.string().nullable(),
});