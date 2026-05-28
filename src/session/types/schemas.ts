import { z } from "zod";
import { SessionModeSchema } from "../modes";
import {
  SessionStatusSchema,
  SessionPhaseSchema,
  ConflictStatusSchema,
  StorageStatusSchema,
  SyncStatusSchema,
  AntiCheatStatusSchema,
} from "./enums";

export { SessionStatusSchema, SessionPhaseSchema, ConflictStatusSchema };
export { StorageStatusSchema, SyncStatusSchema, AntiCheatStatusSchema };

export {
  SessionConfigSchema,
  SessionPresetSchema,
  TimerStateSchema,
  ScoreCalculationSchema,
  DamageCalculationSchema,
  SessionMetricsSchema,
  SessionUIStateSchema,
  SessionNotificationTypeSchema,
} from "./config-schemas";
export type {
  SessionConfig,
  SessionPreset,
  TimerState,
  ScoreCalculation,
  DamageCalculation,
  SessionMetrics,
  SessionUIState,
  SessionNotificationType,
} from "./config-schemas";

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

import { SessionConfigSchema } from "./config-schemas";

export const SessionStateSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string(),
    config: SessionConfigSchema,
    status: SessionStatusSchema,
    phase: SessionPhaseSchema,
    actualDuration: z.number().default(0),
    effectiveDuration: z.number().default(0),
    totalDuration: z.number().default(0),
    duration: z.number().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    lastActiveAt: z.number().optional(),
  })
  .merge(SessionProgressSchema)
  .merge(SessionOutcomeSchema)
  .merge(SessionSyncMetaSchema);
export type SessionState = z.infer<typeof SessionStateSchema>;

export const SessionSummarySchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  status: SessionStatusSchema,
  sessionMode: SessionModeSchema,
  plannedDuration: z.number(),
  actualDuration: z.number(),
  effectiveDuration: z.number(),
  pausedDuration: z.number(),
  completionPercentage: z.number(),
  focusQuality: z.number(),
  focusPurityScore: z.number().optional(),
  interruptions: z.number(),
  pauses: z.number(),
  pausedTime: z.number(),
  streakMaintained: z.boolean(),
  modeBonus: z.number(),
  baseScore: z.number(),
  timeBonus: z.number(),
  finalScore: z.number(),
  createdAt: z.number(),
  streakIncreased: z.boolean(),
  streakDays: z.number(),
  streakBonus: z.number().optional(),
  xpEarned: z.number(),
  coinsEarned: z.number(),
  gemsEarned: z.number(),
  userLevel: z.number().int().min(1).default(1),
  bonuses: z
    .array(
      z.object({
        type: z.string(),
        amount: z.number(),
        description: z.string(),
      }),
    )
    .default([]),
  tasksPlanned: z.number().optional(),
  tasksCompleted: z.number().optional(),
  damage: z.object({ totalDamage: z.number() }).optional(),
  damageTaken: z.number(),
  penaltiesApplied: z.array(z.string()).default([]),
  vsAverage: z.number(),
  vsBest: z.number(),
  reflection: z.string().optional(),
  mood: z.enum(["GREAT", "GOOD", "OKAY", "STRUGGLING", "DIFFICULT"]).optional(),
  isPerfect: z.boolean().optional(),
  completedAt: z.number().optional(),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export const SessionEventSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.enum([
    "SESSION_STARTED",
    "SESSION_PAUSED",
    "SESSION_RESUMED",
    "SESSION_COMPLETED",
    "SESSION_ABANDONED",
    "FOCUS_QUALITY_UPDATE",
    "INTERRUPTION_DETECTED",
    "PHASE_CHANGE",
    "MODE_BONUS_EARNED",
  ]),
  timestamp: z.number(),
  data: z.record(z.unknown()).optional(),
});
export type SessionEvent = z.infer<typeof SessionEventSchema>;
