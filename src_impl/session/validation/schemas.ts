/**
 * Session Validation Schemas
 *
 * Zod validation schemas for all session-related data.
 * Ensures data integrity and runtime type safety.
 */

import { z } from 'zod';

// ============================================================================
// Common Validators
// ============================================================================

export const UUIDSchema = z.string().uuid();

export const TimestampSchema = z.number().min(0);

export const DurationSchema = z.number().min(0).max(86400000); // Max 24 hours in ms

export const PercentageSchema = z.number().min(0).max(100);
export const PurityLabelSchema = z.enum(['Elite', 'Good', 'Okay', 'Distracted']);

// ============================================================================
// Session Config Validation
// ============================================================================

export const ValidateSessionConfigSchema = z.object({
  presetId: z.string().uuid().optional(),
  customName: z.string().min(1).max(100).optional(),
  duration: z.number().min(60).max(86400),
  breakDuration: z.number().min(0).max(3600),
  longBreakDuration: z.number().min(0).max(7200),
  intervals: z.number().int().min(1).max(20),
  longBreakInterval: z.number().int().min(1).max(10),
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
  dndEnabled: z.boolean(),
  strictMode: z.boolean(),
  autoStartBreaks: z.boolean(),
  autoStartNextInterval: z.boolean(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10),
  notes: z.string().max(1000).optional(),
  goal: z.string().max(500).optional(),
  estimatedTaskCount: z.number().int().min(1).max(50).optional(),
  comebackMultiplier: z.number().min(1).max(3).optional(),
});

// ============================================================================
// Session State Validation
// ============================================================================

export const ValidateSessionStateSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  status: z.enum([
    'PREPARING', 'STARTING', 'ACTIVE', 'PAUSED', 'BACKGROUNDED',
    'INTERRUPTION_RISK', 'DEGRADED', 'COMPLETING', 'COMPLETED',
    'PARTIAL', 'ABANDONED', 'FAILED', 'RECOVERING', 'CONFLICT',
  ]),
  phase: z.enum(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK', 'PREPARATION', 'REVIEW']),
  config: ValidateSessionConfigSchema,

  // Timing fields
  startedAt: z.number().optional(),
  pausedAt: z.number().optional(),
  resumedAt: z.number().optional(),
  completedAt: z.number().optional(),
  abandonedAt: z.number().optional(),
  endedAt: z.number().optional(),

  // Progress tracking
  totalDuration: z.number().min(0),
  elapsedTime: z.number().min(0),
  effectiveTime: z.number().min(0),
  pausedTime: z.number().min(0),
  remainingTime: z.number().min(0),

  // Interval tracking
  currentInterval: z.number().int().min(1),
  totalIntervals: z.number().int().min(1),
  intervalsCompleted: z.number().int().min(0),

  // Quality metrics
  interruptions: z.number().int().min(0),
  pauses: z.number().int().min(0),
  backgroundTime: z.number().min(0),

  // Scoring
  baseScore: z.number().min(0),
  timeBonus: z.number().min(0),
  streakBonus: z.number().min(0),
  focusQuality: z.number().min(0).max(100),
  completionPercentage: z.number().min(0).max(100),

  // Penalties
  damagePoints: z.number().min(0),
  penaltyMultiplier: z.number().min(0).max(1),

  // Recovery
  recoveryAttempts: z.number().int().min(0),
  maxRecoveryAttempts: z.number().int().min(0).max(5),
  lastRecoveryAt: z.number().optional(),

  // Device info
  deviceId: z.string(),
  appVersion: z.string(),
  osVersion: z.string(),

  // Anti-cheat
  antiCheatStatus: z.enum(['CLEAN', 'WARNING', 'FLAGGED', 'FAILED']),
  antiCheatFlags: z.array(z.string()),

  // Metadata
  createdAt: z.number(),
  updatedAt: z.number(),
  syncedAt: z.number().optional(),
  isDirty: z.boolean(),
});

// ============================================================================
// Session Summary Validation
// ============================================================================

export const ValidateSessionSummarySchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  status: z.enum([
    'PREPARING', 'STARTING', 'ACTIVE', 'PAUSED', 'BACKGROUNDED',
    'INTERRUPTION_RISK', 'DEGRADED', 'COMPLETING', 'COMPLETED',
    'PARTIAL', 'ABANDONED', 'FAILED', 'RECOVERING', 'CONFLICT',
  ]),

  // Timing
  plannedDuration: z.number().min(0),
  actualDuration: z.number().min(0),
  effectiveDuration: z.number().min(0),
  pausedDuration: z.number().min(0),

  // Performance
  completionPercentage: z.number().min(0).max(100),
  focusQuality: z.number().min(0).max(100),
  focusPurityScore: z.number().min(0).max(100).default(100),
  interruptions: z.number().int().min(0),
  pauses: z.number().int().min(0),

  // Scoring
  baseScore: z.number().min(0),
  timeBonus: z.number().min(0),
  streakBonus: z.number().min(0),
  finalScore: z.number().min(0),

  // Rewards
  xpEarned: z.number().min(0),
  coinsEarned: z.number().min(0),
  gemsEarned: z.number().min(0),

  // Streak
  streakMaintained: z.boolean(),
  streakIncreased: z.boolean(),
  streakDays: z.number().int().min(0),
  userLevel: z.number().int().min(1).default(1),

  // Perfect session flag
  isPerfect: z.boolean().default(false),

  // Damage
  damageTaken: z.number().min(0),
  penaltiesApplied: z.array(z.string()),

  // Comparison
  vsAverage: z.number(),
  vsBest: z.number(),

  // Tasks
  tasksCompleted: z.number().int().min(0).optional(),
  tasksPlanned: z.number().int().min(0).optional(),

  // Reflection
  reflection: z.string().max(2000).optional(),
  mood: z.enum(['GREAT', 'GOOD', 'OKAY', 'STRUGGLING', 'DIFFICULT']).optional(),

  createdAt: z.number(),
});

// ============================================================================
// Preset Validation
// ============================================================================

export const ValidateSessionPresetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().min(60).max(86400),
  breakDuration: z.number().min(0).max(3600),
  longBreakDuration: z.number().min(0).max(7200),
  intervals: z.number().int().min(1).max(20),
  longBreakInterval: z.number().int().min(1).max(10),
  isDefault: z.boolean(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10),
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
  dndEnabled: z.boolean(),
  strictMode: z.boolean(),
  autoStartBreaks: z.boolean(),
  autoStartNextInterval: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
  userId: z.string().optional(),
});

// ============================================================================
// Interruption Validation
// ============================================================================

export const ValidateInterruptionSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.enum([
    'USER_PAUSE', 'USER_EXIT', 'PHONE_CALL', 'NOTIFICATION',
    'LOW_BATTERY', 'APP_BACKGROUND', 'SYSTEM_ALERT',
    'DISTURBANCE_DETECTED', 'NETWORK_LOST', 'DEVICE_LOCK',
  ]),
  severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']),
  occurredAt: z.number(),
  duration: z.number().min(0).optional(),
  recoveredAt: z.number().optional(),
  autoRecovered: z.boolean(),
  impact: z.object({
    timeLost: z.number().min(0),
    scoreImpact: z.number(),
    damagePoints: z.number().min(0),
  }),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Recovery Validation
// ============================================================================

export const ValidateRecoveryRecordSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.enum(['AUTO_RESUME', 'USER_RESUME', 'STREAK_SAVE', 'PARTIAL_CREDIT', 'FULL_RESET']),
  attemptedAt: z.number(),
  successful: z.boolean(),
  recoveredTime: z.number().min(0),
  penalties: z.array(z.object({
    type: z.string(),
    amount: z.number(),
    description: z.string(),
  })),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Anti-Cheat Validation
// ============================================================================

export const ValidateAntiCheatFlagSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.enum([
    'TIME_MANIPULATION', 'IMPOSSIBLE_DURATION', 'RAPID_COMPLETION',
    'DEVICE_CHANGE', 'LOCATION_SPOOF', 'AUTOMATION_DETECTED',
    'INCONSISTENT_DATA', 'MULTIPLE_INSTANCES', 'SUSPICIOUS_PATTERN',
  ]),
  severity: z.enum(['WARNING', 'MODERATE', 'CRITICAL']),
  detectedAt: z.number(),
  evidence: z.record(z.unknown()),
  actionTaken: z.enum(['NONE', 'FLAGGED', 'SCORE_REDUCED', 'SESSION_INVALIDATED']),
  score: z.number().min(0).max(1).optional(),
});

// ============================================================================
// Score Calculation Validation
// ============================================================================

export const ValidateScoreCalculationSchema = z.object({
  basePoints: z.number().positive(),
  timeMultiplier: z.number().min(0.5).max(3),
  streakMultiplier: z.number().min(1).max(5),
  qualityMultiplier: z.number().min(0.5).max(1.5),
  penaltyMultiplier: z.number().min(0).max(1),
  comebackMultiplier: z.number().min(1).max(3),
  bonusPoints: z.number().min(0),
  isPerfect: z.boolean().default(false),

  timeBonus: z.number().min(0),
  streakBonus: z.number().min(0),
  qualityBonus: z.number().min(0),
  intervalBonus: z.number().min(0),
  comebackBonus: z.number().min(0),

  pausePenalty: z.number().min(0),
  interruptionPenalty: z.number().min(0),
  qualityPenalty: z.number().min(0),
  antiCheatPenalty: z.number().min(0),
});

// ============================================================================
// Damage Calculation Validation
// ============================================================================

export const ValidateDamageCalculationSchema = z.object({
  baseDamage: z.number().min(0),
  pauseDamage: z.number().min(0),
  interruptionDamage: z.number().min(0),
  abandonDamage: z.number().min(0),
  antiCheatDamage: z.number().min(0),
  mitigation: z.number().min(0).max(1),
  streakProtection: z.boolean(),
  totalDamage: z.number().min(0),
  finalPenalty: z.number().min(0).max(1),
});

// ============================================================================
// Focus Quality Validation
// ============================================================================

export const ValidateFocusQualityMetricsSchema = z.object({
  sessionId: z.string().uuid(),
  timeInDeepFocus: z.number().min(0),
  timeInShallowFocus: z.number().min(0),
  timeDistracted: z.number().min(0),

  focusSegments: z.array(z.object({
    startAt: z.number(),
    endAt: z.number(),
    duration: z.number().min(0),
    quality: z.number().min(0).max(100),
  })),

  consistencyScore: z.number().min(0).max(100),
  depthScore: z.number().min(0).max(100),
  recoveryScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),

  calculatedAt: z.number(),
});

// ============================================================================
// Purity HUD Validation
// ============================================================================

export const ValidatePurityScoreSchema = PercentageSchema;

export const ValidatePurityHUDSchema = z.object({
  purityScore: ValidatePurityScoreSchema,
  purityLabel: PurityLabelSchema,
  streakMultiplier: z.number().min(1),
});

// ============================================================================
// Timer Config Validation
// ============================================================================

export const ValidateTimerConfigSchema = z.object({
  tickInterval: z.number().int().min(100).max(5000),
  backgroundTickInterval: z.number().int().min(1000).max(30000),
  pauseThreshold: z.number().int().min(1000).max(60000),
  maxPauseDuration: z.number().int().min(60000).max(86400000),
  warningThresholds: z.array(z.number().int().min(0).max(3600)),
});

// ============================================================================
// Session Action Validators
// ============================================================================

export const StartSessionSchema = z.object({
  userId: z.string(),
  config: ValidateSessionConfigSchema,
  deviceInfo: z.object({
    deviceId: z.string(),
    appVersion: z.string(),
    osVersion: z.string(),
  }),
});

export const PauseSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  reason: z.string().optional(),
  timestamp: z.number(),
});

export const ResumeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  timestamp: z.number(),
});

export const CompleteSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  reflection: z.string().max(2000).optional(),
  mood: z.enum(['GREAT', 'GOOD', 'OKAY', 'STRUGGLING', 'DIFFICULT']).optional(),
  tasksCompleted: z.number().int().min(0).optional(),
  timestamp: z.number(),
});

export const AbandonSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  reason: z.string().max(500).optional(),
  timestamp: z.number(),
});

export const RecoverSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  recoveryType: z.enum(['AUTO_RESUME', 'USER_RESUME', 'STREAK_SAVE', 'PARTIAL_CREDIT', 'FULL_RESET']),
  timestamp: z.number(),
});

// ============================================================================
// Validation Functions
// ============================================================================

export function validateSessionConfig(data: unknown) {
  return ValidateSessionConfigSchema.safeParse(data);
}

export function validateSessionState(data: unknown) {
  return ValidateSessionStateSchema.safeParse(data);
}

export function validateSessionSummary(data: unknown) {
  return ValidateSessionSummarySchema.safeParse(data);
}

export function validateSessionPreset(data: unknown) {
  return ValidateSessionPresetSchema.safeParse(data);
}

export function validateInterruption(data: unknown) {
  return ValidateInterruptionSchema.safeParse(data);
}

export function validateRecoveryRecord(data: unknown) {
  return ValidateRecoveryRecordSchema.safeParse(data);
}

export function validateAntiCheatFlag(data: unknown) {
  return ValidateAntiCheatFlagSchema.safeParse(data);
}

export function validateScoreCalculation(data: unknown) {
  return ValidateScoreCalculationSchema.safeParse(data);
}

export function validateDamageCalculation(data: unknown) {
  return ValidateDamageCalculationSchema.safeParse(data);
}

export function validateFocusQualityMetrics(data: unknown) {
  return ValidateFocusQualityMetricsSchema.safeParse(data);
}

export function validatePurityHUD(data: unknown) {
  return ValidatePurityHUDSchema.safeParse(data);
}

export function validateTimerConfig(data: unknown) {
  return ValidateTimerConfigSchema.safeParse(data);
}
