import { z } from 'zod';
import { SessionMode, SessionModeSchema } from '../modes';

export const SessionStatusSchema = z.enum([
  'PREPARING',
  'STARTING', 
  'ACTIVE',
  'PAUSED',
  'BACKGROUNDED',
  'INTERRUPTION_RISK',
  'DEGRADED',
  'COMPLETING',
  'COMPLETED',
  'PARTIAL',
  'ABANDONED',
  'FAILED',
  'RECOVERING',
  'CONFLICT',
]);

export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionPhaseSchema = z.enum([
  'FOCUS',
  'SHORT_BREAK', 
  'LONG_BREAK',
  'PREPARATION',
  'REVIEW',
]);

export type SessionPhase = z.infer<typeof SessionPhaseSchema>;

export const SessionPresetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().min(60).max(86400),
  breakDuration: z.number().min(0).max(3600).default(300),
  longBreakDuration: z.number().min(0).max(7200).default(900),
  intervals: z.number().min(1).max(20).default(1),
  longBreakInterval: z.number().min(1).max(10).default(4),
  isDefault: z.boolean().default(false),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
  dndEnabled: z.boolean().default(false),
  strictMode: z.boolean().default(false),
  autoStartBreaks: z.boolean().default(false),
  autoStartNextInterval: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
  userId: z.string().optional(),
});

export type SessionPreset = z.infer<typeof SessionPresetSchema>;

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
  sessionMode: SessionModeSchema,
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXTREME']).default('MEDIUM'),
  adaptiveMode: z.boolean().default(false),
  focusScorePrimary: z.boolean().default(true),
  // Additional properties used throughout the codebase
  creativeMoodBonus: z.number().optional(),
  quizBonusPoints: z.number().optional(),
  sprintChainCount: z.number().optional(),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

export const SessionStateSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  config: SessionConfigSchema,
  status: SessionStatusSchema,
  phase: SessionPhaseSchema,
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  actualDuration: z.number().optional(),
  effectiveDuration: z.number().optional(),
  completionPercentage: z.number().optional(),
  focusQuality: z.number().optional(),
  interruptions: z.number().optional(),
  pauses: z.number().optional(),
  pausedTime: z.number().optional(),
  streakMaintained: z.boolean().optional(),
  modeBonus: z.number().optional(),
  baseScore: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  // Additional properties used throughout the codebase
  maxRecoveryAttempts: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  isDirty: z.boolean().optional(),
  antiCheatStatus: z.string().optional(),
  antiCheatFlags: z.array(z.any()).optional(),
  recoveryAttempts: z.number().optional(),
  elapsedTime: z.number().optional(),
  penaltyMultiplier: z.number().optional(),
  finalScore: z.number().optional(),
  currentInterval: z.number().optional(),
  totalIntervals: z.number().optional(),
  backgroundTime: z.number().optional(),
  remainingTime: z.number().optional(),
  effectiveTime: z.number().optional(),
  intervalsCompleted: z.number().optional(),
  startedAt: z.number().optional(),
  pausedAt: z.number().optional(),
  resumedAt: z.number().optional(),
  totalDuration: z.number().optional(),
  totalPausedTime: z.number().optional(),
  totalBackgroundTime: z.number().optional(),
  timeBonus: z.number().optional(),
  streakBonus: z.number().optional(),
  canRecover: z.boolean().optional(),
  conflictStatus: z.string().optional(),
  storageStatus: z.string().optional(),
  deviceId: z.string().optional(),
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
  backgroundedAt: z.number().optional(),
  error: z.string().optional(),
  lastActiveAt: z.number().optional(),
  syncStatus: z.string().optional(),
  lastSyncAt: z.number().optional(),
  isOnline: z.boolean().optional(),
  abandonReason: z.string().optional(),
  pauseStartTime: z.number().optional(),
  lastPauseReason: z.string().optional(),
  abandonedAt: z.number().optional(),
  syncedAt: z.number().optional(),
  lastRecoveryAt: z.number().optional(),
  damagePoints: z.number().optional(),
});

export type SessionState = z.infer<typeof SessionStateSchema>;

export const SessionSummarySchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  sessionMode: SessionModeSchema,
  plannedDuration: z.number(),
  actualDuration: z.number(),
  effectiveDuration: z.number(),
  completionPercentage: z.number(),
  focusQuality: z.number(),
  focusPurityScore: z.number().optional(),
  interruptions: z.number(),
  pauses: z.number(),
  pausedTime: z.number(),
  streakMaintained: z.boolean(),
  modeBonus: z.number(),
  baseScore: z.number().optional(),
  finalScore: z.number().optional(),
  createdAt: z.number(),
  // Streak properties for session-completion integration
  streakIncreased: z.boolean().optional(),
  streakDays: z.number().optional(),
  streakBonus: z.number().optional(),
  xpEarned: z.number().optional(),
  bonuses: z.array(z.any()).optional(),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

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

export type SessionEvent = z.infer<typeof SessionEventSchema>;

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

export type SessionMetrics = z.infer<typeof SessionMetricsSchema>;

// Additional exports needed by other modules
export interface SessionHistoryEntry {
  sessionId: string;
  userId: string;
  status: SessionStatus;
  config: SessionConfig;
  summary: SessionSummary;
  startedAt: number;
  endedAt: number;
  createdAt: number;
  startTime: number;
  endTime?: number;
  duration: number;
  mode: SessionMode;
  completionPercentage: number;
  focusQuality: number;
}

export interface TimerConfig {
  duration: number;
  breakDuration: number;
  longBreakDuration: number;
  intervals: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notes?: string;
  tags?: string[];
}

export interface InterruptionRecord {
  id: string;
  sessionId: string;
  timestamp: number;
  reason: string;
  duration: number;
  type: string;
  resolvedAt: number;
  impact: string;
  severity: string;
  autoRecovered: boolean;
}

export interface RecoveryRecord {
  id: string;
  sessionId: string;
  timestamp: number;
  recoveredTime: number;
  success: boolean;
  type: string;
  attemptedAt: number;
  penalties?: PenaltyRecord[];
}

export interface PenaltyRecord {
  type: string;
  amount: number;
  description?: string;
}

export interface AntiCheatFlag {
  id: string;
  sessionId: string;
  timestamp: number;
  flagType: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

// Additional exports needed by SessionOrchestrator.ts
export type InterruptionType = 'EXTERNAL' | 'INTERNAL' | 'SYSTEM' | 'USER' | 'USER_PAUSE';

export type InterruptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'MODERATE' | 'MINOR';

export type RecoveryType = 'AUTO_RESUME' | 'USER_RESUME' | 'MANUAL_RECOVERY' | 'STREAK_SAVE' | 'PARTIAL_CREDIT' | 'FULL_RESET';

export interface FocusQualityMetrics {
  sessionId: string;
  consistency?: number;
  stability?: number;
  peakPerformance?: number;
  averageFocus?: number;
  distractionCount?: number;
  recoveryTime?: number;
  timeInDeepFocus?: number;
  timeInShallowFocus?: number;
  timeDistracted?: number;
  focusSegments?: any[];
  consistencyScore?: number;
  depthScore?: number;
  recoveryScore?: number;
  overallScore?: number;
  calculatedAt?: number;
}

export interface SessionCreationResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface StateTransitionResult {
  success: boolean;
  newState?: SessionStatus;
  error?: string;
}
