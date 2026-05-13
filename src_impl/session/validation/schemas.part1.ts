import { z } from "zod";


export const UUIDSchema = z.string().uuid();

export const TimestampSchema = z.number().min(0);

export const DurationSchema = z.number().min(0).max(86400000);

export const PercentageSchema = z.number().min(0).max(100);

export const PurityLabelSchema = z.enum(['Elite', 'Good', 'Okay', 'Distracted']);

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