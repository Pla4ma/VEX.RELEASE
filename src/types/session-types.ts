import { z } from "zod";

export const SessionStatusSchema = z.enum([
  "PREPARING",
  "STARTING",
  "ACTIVE",
  "PAUSED",
  "BACKGROUNDED",
  "INTERRUPTION_RISK",
  "DEGRADED",
  "COMPLETING",
  "COMPLETED",
  "PARTIAL",
  "ABANDONED",
  "FAILED",
  "RECOVERING",
  "CONFLICT",
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionPhaseSchema = z.enum([
  "FOCUS",
  "SHORT_BREAK",
  "LONG_BREAK",
  "PREPARATION",
  "REVIEW",
]);
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;

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
});
export type SessionConfig = z.infer<typeof SessionConfigSchema>;

export interface SessionState {
  id: string;
  userId: string;
  status: SessionStatus;
  phase: SessionPhase;
  config: SessionConfig;
  remainingTime: number;
  totalDuration: number;
  elapsedTime: number;
  effectiveTime: number;
  pausedTime: number;
  totalPausedTime: number;
  totalBackgroundTime: number;
  currentInterval: number;
  totalIntervals: number;
  intervalsCompleted: number;
  interruptions: number;
  pauses: number;
  backgroundTime: number;
  baseScore: number;
  timeBonus: number;
  streakBonus: number;
  focusQuality: number;
  completionPercentage: number;
  damagePoints: number;
  penaltyMultiplier: number;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  canRecover: boolean;
  conflictStatus: "NONE" | "DETECTED" | "RESOLVED";
  storageStatus: "HEALTHY" | "CORRUPTED" | "MISSING";
  deviceId: string;
  appVersion: string;
  osVersion: string;
  antiCheatStatus: "CLEAN" | "SUSPICIOUS" | "FLAGGED";
  antiCheatFlags: string[];
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  pausedAt?: number;
  resumedAt?: number;
  completedAt?: number;
  isDirty: boolean;
}

export interface SessionSummary {
  sessionId: string;
  userId: string;
  duration: number;
  actualDuration?: number;
  effectiveDuration: number;
  completionPercentage: number;
  focusQuality: number;
  purityScore: number;
  focusPurityScore?: number;
  interruptions: number;
  baseScore: number;
  finalScore: number;
  grade: string;
  xpEarned: number;
  levelUp: boolean;
  newLevel?: number;
  bossDamageDealt: number;
  bossDefeated: boolean;
  startedAt: number;
  completedAt: number;
  wasAbandoned: boolean;
  hadInterruptions: boolean;
  usedRecovery: boolean;
  streakIncreased?: boolean;
  streakDays?: number;
  streakBonus?: number;
}

export type LegacySessionState = SessionState;
