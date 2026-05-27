import { z } from "zod";
import { SessionModeSchema } from "../modes";

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

export const SessionMetricsSchema = z.object({
  focusTime: z.number(), totalTime: z.number(), efficiency: z.number(),
  consistency: z.number(), interruptions: z.number(), quality: z.number(),
  streakDays: z.number(), completionRate: z.number(),
});
export type SessionMetrics = z.infer<typeof SessionMetricsSchema>;

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
