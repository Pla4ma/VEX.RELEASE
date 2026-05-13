import { z } from "zod";


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

export const ValidatePurityScoreSchema = PercentageSchema;

export const ValidatePurityHUDSchema = z.object({
  purityScore: ValidatePurityScoreSchema,
  purityLabel: PurityLabelSchema,
  streakMultiplier: z.number().min(1),
});

export const ValidateTimerConfigSchema = z.object({
  tickInterval: z.number().int().min(100).max(5000),
  backgroundTickInterval: z.number().int().min(1000).max(30000),
  pauseThreshold: z.number().int().min(1000).max(60000),
  maxPauseDuration: z.number().int().min(60000).max(86400000),
  warningThresholds: z.array(z.number().int().min(0).max(3600)),
});

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