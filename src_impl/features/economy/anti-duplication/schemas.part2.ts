import { z } from "zod";


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