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
  'MULTITASKING_TEMPEST',
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
// ============================================================================
// Combat System Types
// ============================================================================
// ============================================================================
// Session Summary Types
// ============================================================================
// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

// Legacy exports to prevent breaking changes
export type LegacySessionState = SessionState;
export type LegacyBossState = BossState;
export type LegacyBossEncounter = BossEncounter;

export * from "./consolidated.types";
