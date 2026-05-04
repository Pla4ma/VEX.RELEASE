/**
 * Consolidated Type Definitions
 * 
 * Centralized type definitions to eliminate duplicates across the codebase.
 * All session, boss, and combat-related types unified here.
 */

import { z } from 'zod';

// ============================================================================
// Session Types (Consolidated from multiple files)
// ============================================================================

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
  'CONFLICT'
]);

export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionPhaseSchema = z.enum([
  'FOCUS',
  'SHORT_BREAK', 
  'LONG_BREAK',
  'PREPARATION',
  'REVIEW'
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
  
  // Timing
  remainingTime: number;
  totalDuration: number;
  elapsedTime: number;
  effectiveTime: number;
  pausedTime: number;
  totalPausedTime: number;
  totalBackgroundTime: number;
  
  // Intervals
  currentInterval: number;
  totalIntervals: number;
  intervalsCompleted: number;
  
  // Interruptions
  interruptions: number;
  pauses: number;
  backgroundTime: number;
  
  // Scoring
  baseScore: number;
  timeBonus: number;
  streakBonus: number;
  focusQuality: number;
  completionPercentage: number;
  damagePoints: number;
  penaltyMultiplier: number;
  
  // Recovery
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  canRecover: boolean;
  
  // State tracking
  conflictStatus: 'NONE' | 'DETECTED' | 'RESOLVED';
  storageStatus: 'HEALTHY' | 'CORRUPTED' | 'MISSING';
  deviceId: string;
  appVersion: string;
  osVersion: string;
  antiCheatStatus: 'CLEAN' | 'SUSPICIOUS' | 'FLAGGED';
  antiCheatFlags: string[];
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  pausedAt?: number;
  resumedAt?: number;
  completedAt?: number;
  
  // Dirty flag for persistence
  isDirty: boolean;
}

// ============================================================================
// Boss Types (Consolidated from multiple files)
// ============================================================================

export const BossTierSchema = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);
export type BossTier = z.infer<typeof BossTierSchema>;

export const BossPhaseSchema = z.enum(['CALM', 'AGITATED', 'ENRAGED', 'DESPERATE']);
export type BossPhase = z.infer<typeof BossPhaseSchema>;

export const BossAttackPatternSchema = z.enum([
  'DISTRACTION_WAVE',
  'PROCRASTINATION_BEAM', 
  'NOTIFICATION_BLAST',
  'SOCIAL_MEDIA_TRAP',
  'MULTITASKING_TEMPEST'
]);

export type BossAttackPattern = z.infer<typeof BossAttackPatternSchema>;

export const CombatAbilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  focusEnergyCost: z.number().int().min(0),
  baseDamage: z.number().int().min(1),
  cooldownSeconds: z.number().int().min(0),
  requiresStreak: z.number().int().min(0),
  requiresLevel: z.number().int().min(1),
  icon: z.string(),
});

export type CombatAbility = z.infer<typeof CombatAbilitySchema>;

export interface BossEncounter {
  id: string;
  userId: string;
  bossId: string;
  bossName: string;
  bossAvatarUrl: string | null;
  
  // Health
  bossMaxHealth: number;
  bossCurrentHealth: number;
  percentHealthRemaining: number;
  
  // Combat State
  currentPhase: BossPhase;
  currentAttackPattern: BossAttackPattern | null;
  attackPatternStartedAt: number | null;
  attackPatternDurationMs: number;
  
  // User Resources
  userMaxFocusEnergy: number;
  userCurrentFocusEnergy: number;
  userFocusEnergyRegenRate: number;
  
  // Abilities & Cooldowns
  availableAbilities: CombatAbility[];
  abilityCooldowns: Record<string, number>;
  
  // Timers
  encounterStartedAt: number;
  expiresAt: number;
  lastUserActionAt: number | null;
  
  // Session Tracking
  sessionCount: number;
  totalDamageDealt: number;
  attacksDodged: number;
  attacksHit: number;
  
  // Status
  status: 'ACTIVE' | 'VICTORY' | 'DEFEAT' | 'TIMED_OUT';
  
  // Tier
  tier: BossTier;
}

export interface BossState {
  encounter: BossEncounter | null;
  damageThisSession: DamageCalculation;
  estimatedKill: KillEstimate;
  combatState: 'ENCOUNTER_START' | 'COMBAT_ACTIVE' | 'BOSS_RAGE' | 'NEAR_DEATH' | 'VICTORY';
  showDamageFlash: boolean;
  recentDamage: number;
  isLoading: boolean;
  error: Error | null;
}

export interface DamageCalculation {
  baseDamage: number;
  purityMultiplier: number;
  streakMultiplier: number;
  totalDamage: number;
  damagePerMinute: number;
}

export interface KillEstimate {
  willDefeat: boolean;
  sessionsRemaining: number;
  minutesRemaining: number;
  percentDamage: number;
}

// ============================================================================
// Combat System Types
// ============================================================================

export interface CombatActionResult {
  success: boolean;
  damageDealt: number;
  energyConsumed: number;
  bossHealthRemaining: number;
  newPhase: BossPhase;
  comboBonus: number;
  message: string;
}

export interface ActiveEncounter {
  id: string;
  userId: string;
  bossId: string;
  bossName: string;
  bossAvatarUrl: string | null;
  
  // Health
  bossMaxHealth: number;
  bossCurrentHealth: number;
  
  // Combat State
  currentPhase: BossPhase;
  currentAttackPattern: BossAttackPattern | null;
  attackPatternStartedAt: number | null;
  attackPatternDurationMs: number;
  
  // User Resources
  userMaxFocusEnergy: number;
  userCurrentFocusEnergy: number;
  userFocusEnergyRegenRate: number;
  
  // Abilities & Cooldowns
  availableAbilities: CombatAbility[];
  abilityCooldowns: Record<string, number>;
  
  // Timers
  encounterStartedAt: number;
  expiresAt: number;
  lastUserActionAt: number | null;
  
  // Session Tracking
  sessionCount: number;
  totalDamageDealt: number;
  attacksDodged: number;
  attacksHit: number;
  
  status: 'ACTIVE' | 'VICTORY' | 'DEFEAT' | 'TIMED_OUT';
}

// ============================================================================
// Session Summary Types
// ============================================================================

export interface SessionSummary {
  sessionId: string;
  userId: string;

  // Basic metrics
  duration: number;
  actualDuration?: number;
  effectiveDuration: number;
  completionPercentage: number;

  // Quality metrics
  focusQuality: number;
  purityScore: number;
  focusPurityScore?: number;
  interruptions: number;

  // Scoring
  baseScore: number;
  finalScore: number;
  grade: string;

  // Progression
  xpEarned: number;
  levelUp: boolean;
  newLevel?: number;

  // Boss damage
  bossDamageDealt: number;
  bossDefeated: boolean;

  // Timestamps
  startedAt: number;
  completedAt: number;

  // Flags
  wasAbandoned: boolean;
  hadInterruptions: boolean;
  usedRecovery: boolean;

  // Streak properties (added for session-completion integration)
  streakIncreased?: boolean;
  streakDays?: number;
  streakBonus?: number;
}

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

// Legacy exports to prevent breaking changes
export type LegacySessionState = SessionState;
export type LegacyBossState = BossState;
export type LegacyBossEncounter = BossEncounter;
