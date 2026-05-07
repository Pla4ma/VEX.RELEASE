/**
 * Anti-Duplication Schemas
 *
 * Phase 6.04 - Anti-Duplication Systems
 * Prevents duplicate rewards, exploits, and unfair advantages
 * Ensures each action can only be rewarded once per user/time period
 *
 * Dependencies:
 * - Economy (reward tracking, transaction validation)
 * - Rewards (reward delivery, claim tracking)
 * - Analytics (duplication detection, Sentry reporting)
 */

import { z } from 'zod';

// ============================================================================
// Deduplication Keys
// ============================================================================

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

export type DeduplicationKey = z.infer<typeof DeduplicationKeySchema>;

// ============================================================================
// Deduplication Rules
// ============================================================================

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

export type DeduplicationRule = z.infer<typeof DeduplicationRuleSchema>;

// ============================================================================
// Deduplication Attempt
// ============================================================================

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

export type DeduplicationAttempt = z.infer<typeof DeduplicationAttemptSchema>;

// ============================================================================
// Deduplication Validation
// ============================================================================

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

export type DeduplicationRequest = z.infer<typeof DeduplicationRequestSchema>;

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

export type DeduplicationResult = z.infer<typeof DeduplicationResultSchema>;

// ============================================================================
// Exploit Detection
// ============================================================================

export const ExploitPatternSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  
  // Pattern detection
  pattern: z.enum([
    'RAPID_REPEAT_ACTIONS',
    'SIMULTANEOUS_SESSIONS',
    'TIME_TRAVEL',
    'UNREALISTIC_PROGRESS',
    'DUPLICATE_CONTEXT_KEYS',
    'MANIPULATED_METADATA',
  ]),
  
  // Detection criteria
  criteria: z.object({
    timeWindow: z.number().min(60), // seconds
    maxAttempts: z.number().min(1),
    actionTypes: z.array(z.string()),
    minLevel: z.number().nullable(),
    suspiciousThreshold: z.number().min(0).max(1),
  }),
  
  // Actions
  actions: z.object({
    block: z.boolean(),
    flagForReview: z.boolean(),
    temporaryRestriction: z.boolean(),
    notifyAdmins: z.boolean(),
    customMessage: z.string().nullable(),
  }),
  
  isActive: z.boolean(),
  priority: z.number().min(1),
});

export type ExploitPattern = z.infer<typeof ExploitPatternSchema>;

export const ExploitDetectionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  patternId: z.string().uuid(),
  patternName: z.string(),
  
  // What triggered the detection
  triggerAction: z.string(),
  triggerContext: z.string(),
  triggerData: z.record(z.unknown()),
  
  // Detection details
  confidence: z.number().min(0).max(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  
  // Actions taken
  actionsTaken: z.array(z.string()),
  
  // Status
  status: z.enum(['DETECTED', 'REVIEWING', 'RESOLVED', 'FALSE_POSITIVE']),
  resolvedAt: z.number().nullable(),
  resolutionNotes: z.string().nullable(),
  
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ExploitDetection = z.infer<typeof ExploitDetectionSchema>;

// ============================================================================
// Analytics
// ============================================================================

export const DeduplicationAnalyticsSchema = z.object({
  period: z.enum(['HOURLY', 'DAILY', 'WEEKLY']),
  periodStart: z.number(),
  periodEnd: z.number(),
  
  // Deduplication metrics
  totalAttempts: z.number(),
  allowedAttempts: z.number(),
  blockedDuplicates: z.number(),
  blockedByRules: z.number(),
  errors: z.number(),
  
  // By action type
  attemptsByActionType: z.record(z.number()),
  
  // By user tier
  freeUserAttempts: z.number(),
  premiumUserAttempts: z.number(),
  
  // Exploit detection
  exploitsDetected: z.number(),
  exploitsResolved: z.number(),
  
  // Performance
  averageValidationTime: z.number(), // milliseconds
});

export type DeduplicationAnalytics = z.infer<typeof DeduplicationAnalyticsSchema>;

// ============================================================================
// Configuration
// ============================================================================

export const AntiDuplicationConfigSchema = z.object({
  // Global settings
  enableDeduplication: z.boolean(),
  enableExploitDetection: z.boolean(),
  enableAnalytics: z.boolean(),
  
  // Default rules
  defaultRules: z.array(DeduplicationRuleSchema),
  
  // Exploit patterns
  exploitPatterns: z.array(ExploitPatternSchema),
  
  // Settings
  keyRetentionDays: z.number().min(1),
  attemptRetentionDays: z.number().min(1),
  cleanupIntervalHours: z.number().min(1),
  
  // Performance
  maxValidationTime: z.number().min(100), // milliseconds
  enableCaching: z.boolean(),
  cacheTTL: z.number().min(60), // seconds
});

export type AntiDuplicationConfig = z.infer<typeof AntiDuplicationConfigSchema>;