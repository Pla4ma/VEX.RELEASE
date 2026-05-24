import { z } from "zod";
import { SessionModeSchema } from "../modes";
import {
  SessionStatusSchema, SessionPhaseSchema, ConflictStatusSchema,
  StorageStatusSchema, SyncStatusSchema, AntiCheatStatusSchema,
} from "./enums";

export { SessionStatusSchema, SessionPhaseSchema, ConflictStatusSchema };
export { StorageStatusSchema, SyncStatusSchema, AntiCheatStatusSchema };

export const SessionConfigSchema = z.object({
  presetId: z.string().uuid().optional(),
  customName: z.string().max(100).optional(),
  duration: z.number().min(60).max(86400),
  breakDuration: z.number().min(0).max(3600),
  longBreakDuration: z.number().min(0).max(7200),
  intervals: z.number().min(1).max(20),
  longBreakInterval: z.number().min(1).max(10),
  soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
  dndEnabled: z.boolean().default(false),
  strictMode: z.boolean().default(false),
  autoStartBreaks: z.boolean().default(false),
  autoStartNextInterval: z.boolean().default(false),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  goal: z.string().max(500).optional(),
  estimatedTaskCount: z.number().int().min(1).max(50).optional(),
  comebackMultiplier: z.number().min(1).max(3).optional(),
  sessionMode: SessionModeSchema,
  difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD", "EXTREME"]).default("MEDIUM"),
  adaptiveMode: z.boolean().default(false),
  focusScorePrimary: z.boolean().default(true),
  creativeMoodBonus: z.number().optional(),
  quizBonusPoints: z.number().optional(),
  sprintChainCount: z.number().optional(),
  studyPlanId: z.string().optional(),
});
export type SessionConfig = z.infer<typeof SessionConfigSchema>;

export const SessionProgressSchema = z.object({
  elapsedTime: z.number().default(0),
  remainingTime: z.number().default(0),
  effectiveTime: z.number().default(0),
  completionPercentage: z.number().default(0),
  currentInterval: z.number().default(1),
  totalIntervals: z.number().default(1),
  intervalsCompleted: z.number().default(0),
  focusQuality: z.number().default(100),
  interruptions: z.number().default(0),
  pauses: z.number().default(0),
  pausedTime: z.number().default(0),
  backgroundTime: z.number().default(0),
  totalPausedTime: z.number().default(0),
  totalBackgroundTime: z.number().default(0),
  startedAt: z.number().optional(),
  pausedAt: z.number().optional(),
  resumedAt: z.number().optional(),
  pauseStartTime: z.number().optional(),
  lastPauseReason: z.string().optional(),
  backgroundedAt: z.number().optional(),
  purityScore: z.number().optional(),
  damagePoints: z.number().default(0),
});
export type SessionProgress = z.infer<typeof SessionProgressSchema>;

export const SessionOutcomeSchema = z.object({
  baseScore: z.number().default(0),
  finalScore: z.number().default(0),
  timeBonus: z.number().default(0),
  streakBonus: z.number().default(0),
  modeBonus: z.number().default(0),
  penaltyMultiplier: z.number().default(1),
  streakMaintained: z.boolean().default(false),
  completedAt: z.number().optional(),
  endedAt: z.number().optional(),
  abandonedAt: z.number().optional(),
  abandonReason: z.string().optional(),
  error: z.string().optional(),
});
export type SessionOutcome = z.infer<typeof SessionOutcomeSchema>;

export const SessionSyncMetaSchema = z.object({
  conflictStatus: ConflictStatusSchema.default("NONE"),
  storageStatus: StorageStatusSchema.default("HEALTHY"),
  syncStatus: SyncStatusSchema.default("IDLE"),
  lastSyncAt: z.number().optional(),
  syncedAt: z.number().optional(),
  isDirty: z.boolean().default(false),
  isOnline: z.boolean().default(true),
  recoveryAttempts: z.number().default(0),
  maxRecoveryAttempts: z.number().default(3),
  lastRecoveryAt: z.number().optional(),
  canRecover: z.boolean().default(false),
  antiCheatStatus: AntiCheatStatusSchema.default("CLEAN"),
  antiCheatFlags: z.array(z.string()).default([]),
  deviceId: z.string().optional(),
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type SessionSyncMeta = z.infer<typeof SessionSyncMetaSchema>;

export const SessionStateSchema = z.object({
  id: z.string().uuid(), userId: z.string(),
  config: SessionConfigSchema, status: SessionStatusSchema, phase: SessionPhaseSchema,
  actualDuration: z.number().default(0), effectiveDuration: z.number().default(0),
  totalDuration: z.number().default(0), duration: z.number().optional(),
  createdAt: z.number(), updatedAt: z.number(), lastActiveAt: z.number().optional(),
}).merge(SessionProgressSchema).merge(SessionOutcomeSchema).merge(SessionSyncMetaSchema);
export type SessionState = z.infer<typeof SessionStateSchema>;

export const SessionPresetSchema = z.object({
  id: z.string().uuid(), name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().min(60).max(86400),
  breakDuration: z.number().min(0).max(3600).default(300),
  longBreakDuration: z.number().min(0).max(7200).default(900),
  intervals: z.number().min(1).max(20).default(1),
  longBreakInterval: z.number().min(1).max(10).default(4),
  isDefault: z.boolean().default(false), category: z.string().optional(),
  tags: z.array(z.string()).default([]), soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true), dndEnabled: z.boolean().default(false),
  strictMode: z.boolean().default(false), autoStartBreaks: z.boolean().default(false),
  autoStartNextInterval: z.boolean().default(false),
  createdAt: z.number(), updatedAt: z.number(), userId: z.string().optional(),
});
export type SessionPreset = z.infer<typeof SessionPresetSchema>;

export const SessionSummarySchema = z.object({
  sessionId: z.string(), userId: z.string(), status: SessionStatusSchema,
  sessionMode: SessionModeSchema, plannedDuration: z.number(), actualDuration: z.number(),
  effectiveDuration: z.number(), pausedDuration: z.number(), completionPercentage: z.number(),
  focusQuality: z.number(), focusPurityScore: z.number().optional(),
  interruptions: z.number(), pauses: z.number(), pausedTime: z.number(),
  streakMaintained: z.boolean(), modeBonus: z.number(), baseScore: z.number(),
  timeBonus: z.number(), finalScore: z.number(), createdAt: z.number(),
  streakIncreased: z.boolean(), streakDays: z.number(), streakBonus: z.number().optional(),
  xpEarned: z.number(), coinsEarned: z.number(), gemsEarned: z.number(),
  userLevel: z.number().int().min(1).default(1),
  bonuses: z.array(z.object({ type: z.string(), amount: z.number(), description: z.string() })).default([]),
  tasksPlanned: z.number().optional(), tasksCompleted: z.number().optional(),
  damage: z.object({ totalDamage: z.number() }).optional(), damageTaken: z.number(),
  penaltiesApplied: z.array(z.string()).default([]), vsAverage: z.number(), vsBest: z.number(),
  reflection: z.string().optional(),
  mood: z.enum(["GREAT", "GOOD", "OKAY", "STRUGGLING", "DIFFICULT"]).optional(),
  isPerfect: z.boolean().optional(),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export const SessionEventSchema = z.object({
  id: z.string().uuid(), sessionId: z.string().uuid(),
  type: z.enum([
    "SESSION_STARTED", "SESSION_PAUSED", "SESSION_RESUMED",
    "SESSION_COMPLETED", "SESSION_ABANDONED", "FOCUS_QUALITY_UPDATE",
    "INTERRUPTION_DETECTED", "PHASE_CHANGE", "MODE_BONUS_EARNED",
  ]), timestamp: z.number(), data: z.record(z.unknown()).optional(),
});
export type SessionEvent = z.infer<typeof SessionEventSchema>;

export const SessionMetricsSchema = z.object({
  focusTime: z.number(), totalTime: z.number(), efficiency: z.number(),
  consistency: z.number(), interruptions: z.number(), quality: z.number(),
  streakDays: z.number(), completionRate: z.number(),
});
export type SessionMetrics = z.infer<typeof SessionMetricsSchema>;

export const TimerStateSchema = z.object({
  isRunning: z.boolean().default(false), isPaused: z.boolean().default(false),
  startTime: z.number().optional(), pauseTime: z.number().optional(),
  totalPausedTime: z.number().default(0), lastTickAt: z.number().optional(),
  intervalId: z.unknown().optional(),
});
export type TimerState = z.infer<typeof TimerStateSchema>;

export const ScoreCalculationSchema = z.object({
  basePoints: z.number(), timeMultiplier: z.number(), streakMultiplier: z.number(),
  qualityMultiplier: z.number(), penaltyMultiplier: z.number(),
  comebackMultiplier: z.number().default(1), bonusPoints: z.number().default(0),
  isPerfect: z.boolean().default(false), timeBonus: z.number().default(0),
  streakBonus: z.number().default(0), qualityBonus: z.number().default(0),
  intervalBonus: z.number().default(0), comebackBonus: z.number().default(0),
  pausePenalty: z.number().default(0), interruptionPenalty: z.number().default(0),
  qualityPenalty: z.number().default(0), antiCheatPenalty: z.number().default(0),
});
export type ScoreCalculation = z.infer<typeof ScoreCalculationSchema>;

export const DamageCalculationSchema = z.object({
  baseDamage: z.number().min(0), pauseDamage: z.number().min(0).default(0),
  interruptionDamage: z.number().min(0).default(0), abandonDamage: z.number().min(0).default(0),
  antiCheatDamage: z.number().min(0).default(0), mitigation: z.number().min(0).max(1).default(0),
  streakProtection: z.boolean().default(false), totalDamage: z.number().min(0),
  finalPenalty: z.number().min(0).max(1),
});
export type DamageCalculation = z.infer<typeof DamageCalculationSchema>;

export const SessionUIStateSchema = z.enum([
  "PRE_SESSION", "STARTING", "ACTIVE", "PAUSED", "RESUMED", "BACKGROUNDED",
  "INTERRUPTION_RISK", "RECONNECTING", "DEGRADED", "COMPLETION_SUCCESS",
  "PARTIAL_COMPLETION", "FAILURE_ABANDON", "CONFLICT", "POST_REWARD",
]);
export type SessionUIState = z.infer<typeof SessionUIStateSchema>;

export const SessionNotificationTypeSchema = z.enum([
  "STARTING", "COMPLETED", "PAUSED_LONG", "STREAK_AT_RISK",
  "FOCUS_QUALITY_DROP", "INTERVAL_COMPLETE", "BREAK_STARTING",
  "RECOVERY_AVAILABLE", "SYNCS_CONFLICT",
]);
export type SessionNotificationType = z.infer<typeof SessionNotificationTypeSchema>;
