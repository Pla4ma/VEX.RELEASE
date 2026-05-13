import { z } from "zod";
import { SessionMode, SessionModeSchema } from "../modes";


export const SessionEventSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.enum([
    'SESSION_STARTED',
    'SESSION_PAUSED',
    'SESSION_RESUMED',
    'SESSION_COMPLETED',
    'SESSION_ABANDONED',
    'FOCUS_QUALITY_UPDATE',
    'INTERRUPTION_DETECTED',
    'PHASE_CHANGE',
    'MODE_BONUS_EARNED',
  ]),
  timestamp: z.number(),
  data: z.record(z.any()).optional(),
});

export const SessionMetricsSchema = z.object({
  focusTime: z.number(),
  totalTime: z.number(),
  efficiency: z.number(),
  consistency: z.number(),
  interruptions: z.number(),
  quality: z.number(),
  streakDays: z.number(),
  completionRate: z.number(),
});

export const TimerStateSchema = z.object({
  isRunning: z.boolean().default(false),
  isPaused: z.boolean().default(false),
  startTime: z.number().optional(),
  pauseTime: z.number().optional(),
  totalPausedTime: z.number().default(0),
  lastTickAt: z.number().optional(),
  intervalId: z.unknown().optional(),
});

export const ScoreCalculationSchema = z.object({
  basePoints: z.number(),
  timeMultiplier: z.number(),
  streakMultiplier: z.number(),
  qualityMultiplier: z.number(),
  penaltyMultiplier: z.number(),
  comebackMultiplier: z.number().default(1),
  bonusPoints: z.number().default(0),
  isPerfect: z.boolean().default(false),
  timeBonus: z.number().default(0),
  streakBonus: z.number().default(0),
  qualityBonus: z.number().default(0),
  intervalBonus: z.number().default(0),
  comebackBonus: z.number().default(0),
  pausePenalty: z.number().default(0),
  interruptionPenalty: z.number().default(0),
  qualityPenalty: z.number().default(0),
  antiCheatPenalty: z.number().default(0),
});

export const DamageCalculationSchema = z.object({
  baseDamage: z.number().min(0),
  pauseDamage: z.number().min(0).default(0),
  interruptionDamage: z.number().min(0).default(0),
  abandonDamage: z.number().min(0).default(0),
  antiCheatDamage: z.number().min(0).default(0),
  mitigation: z.number().min(0).max(1).default(0),
  streakProtection: z.boolean().default(false),
  totalDamage: z.number().min(0),
  finalPenalty: z.number().min(0).max(1),
});

export const SessionUIStateSchema = z.enum([
  'PRE_SESSION',
  'STARTING',
  'ACTIVE',
  'PAUSED',
  'RESUMED',
  'BACKGROUNDED',
  'INTERRUPTION_RISK',
  'RECONNECTING',
  'DEGRADED',
  'COMPLETION_SUCCESS',
  'PARTIAL_COMPLETION',
  'FAILURE_ABANDON',
  'CONFLICT',
  'POST_REWARD',
]);

export const SessionNotificationTypeSchema = z.enum([
  'STARTING',
  'COMPLETED',
  'PAUSED_LONG',
  'STREAK_AT_RISK',
  'FOCUS_QUALITY_DROP',
  'INTERVAL_COMPLETE',
  'BREAK_STARTING',
  'RECOVERY_AVAILABLE',
  'SYNCS_CONFLICT',
]);