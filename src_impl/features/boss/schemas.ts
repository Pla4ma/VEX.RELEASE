/**
 * Boss Feature - Zod Schemas
 */

import { z } from 'zod';

// ============================================================================
// Boss Template Schemas
// ============================================================================

export const BossRewardTypeSchema = z.enum([
  'XP',
  'COINS',
  'GEMS',
  'ITEM',
  'COSMETIC',
  'STREAK_SHIELD',
  'VARIABLE_REWARD',
  'INSIGHT',
  'AESTHETIC',
]);

export const BossTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  avatarUrl: z.string().nullable(),
  tier: z.number().min(1),
  baseHealth: z.number().positive(),
  healthScaling: z.number().positive(),
  minLevel: z.number().min(1),
  previousBossId: z.string().uuid().nullable(),
  timeLimit: z.number().positive(), // seconds
  rewardType: BossRewardTypeSchema,
  rewardAmount: z.number().min(0),
  rewardItemId: z.string().nullable(),
  taunts: z.object({
    spawn: z.string().min(1),
    halfHealth: z.string().min(1),
    nearDeath: z.string().min(1),
  }).strict().optional(),
}).strict();

// ============================================================================
// Boss Encounter Schemas
// ============================================================================

export const BossEncounterStatusSchema = z.enum([
  'ACTIVE',
  'DEFEATED',
  'TIMEOUT',
  'ABANDONED',
]);

export const BossEncounterSchema = z.object({
  id: z.string().uuid(),
  bossId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  squadId: z.string().uuid().nullable(),
  healthRemaining: z.number().min(0),
  maxHealth: z.number().positive(),
  damageDealt: z.number().min(0),
  status: BossEncounterStatusSchema,
  startedAt: z.number(),
  expiresAt: z.number(),
  defeatedAt: z.number().nullable(),
  contributingSessionIds: z.array(z.string().uuid()),
  createdAt: z.number(),
}).strict();

export const BossEncounterSummarySchema = z.object({
  id: z.string().uuid(),
  bossId: z.string().uuid(),
  bossName: z.string(),
  bossAvatarUrl: z.string().nullable(),
  healthRemaining: z.number().min(0),
  maxHealth: z.number().positive(),
  percentHealthRemaining: z.number().min(0).max(100),
  status: BossEncounterStatusSchema,
  expiresAt: z.number(),
  timeRemaining: z.number(),
}).strict();

// ============================================================================
// Damage Schemas
// ============================================================================

export const BossDamageItemSchema = z.object({
  id: z.string().uuid(),
  effect: z.enum(['BOSS_DAMAGE', 'CRITICAL_CHANCE', 'CRITICAL_DAMAGE']),
  bonusPercent: z.number().min(0),
}).strict();

export const DamageCalculationInputSchema = z.object({
  baseDamage: z.number().positive(),
  sessionQuality: z.number().min(0).max(100),
  streakDays: z.number().min(0),
  squadMultiplier: z.number().min(1),
  equippedItems: z.array(BossDamageItemSchema),
}).strict();

export const BossDamageResultSchema = z.object({
  damageDealt: z.number().min(0),
  healthRemaining: z.number().min(0),
  maxHealth: z.number().positive(),
  isDefeated: z.boolean(),
  percentComplete: z.number().min(0).max(100),
  criticalHit: z.boolean(),
}).strict();

// ============================================================================
// Boss Defeat Schemas
// ============================================================================

export const BossRewardSchema = z.object({
  userId: z.string().uuid(),
  type: BossRewardTypeSchema,
  amount: z.number().min(0),
  itemId: z.string().nullable(),
}).strict();

export const BossDefeatResultSchema = z.object({
  encounterId: z.string().uuid(),
  bossId: z.string().uuid(),
  defeatedAt: z.number(),
  contributors: z.array(z.string().uuid()),
  rewards: z.array(BossRewardSchema),
  unlockedNextBoss: z.string().uuid().nullable(),
}).strict();

export const BossDefeatSummarySchema = z.object({
  encounterId: z.string().uuid(),
  bossName: z.string(),
  defeatedAt: z.number(),
  totalDamage: z.number().min(0),
  contributors: z.array(z.object({
    userId: z.string().uuid(),
    damageDealt: z.number().min(0),
    sessions: z.number().min(0),
  })),
  rewards: z.array(BossRewardSchema),
}).strict();

// ============================================================================
// Input Schemas
// ============================================================================

export const CreateEncounterInputSchema = z.object({
  bossId: z.string().uuid(),
  userId: z.string().uuid(),
  squadId: z.string().uuid().optional(),
  userLevel: z.number().min(1),
}).strict();

export const ApplyDamageInputSchema = z.object({
  encounterId: z.string().uuid(),
  sessionId: z.string().uuid(),
  damage: z.number().positive(),
}).strict();

export const CalculateDamageInputSchema = z.object({
  sessionDuration: z.number().positive(), // seconds
  sessionQuality: z.number().min(0).max(100),
  streakDays: z.number().min(0),
  squadMultiplier: z.number().min(1).default(1),
  equippedItemIds: z.array(z.string().uuid()).default([]),
  bossId: z.string().optional(),
  backgroundEvents: z.number().int().min(0).optional(),
  currentDay: z.number().int().min(0).max(6).optional(),
  currentHour: z.number().int().min(0).max(23).optional(),
}).strict();

// ============================================================================
// Inferred Types
// ============================================================================

export type BossTemplate = z.infer<typeof BossTemplateSchema>;
export type BossEncounter = z.infer<typeof BossEncounterSchema>;
export type BossEncounterStatus = z.infer<typeof BossEncounterStatusSchema>;
export type BossEncounterSummary = z.infer<typeof BossEncounterSummarySchema>;
export type BossDamageResult = z.infer<typeof BossDamageResultSchema>;
export type BossReward = z.infer<typeof BossRewardSchema>;
export type BossDefeatResult = z.infer<typeof BossDefeatResultSchema>;
export type BossDefeatSummary = z.infer<typeof BossDefeatSummarySchema>;
export type CreateEncounterInput = z.infer<typeof CreateEncounterInputSchema>;
export type ApplyDamageInput = z.infer<typeof ApplyDamageInputSchema>;
export type CalculateDamageInput = z.infer<typeof CalculateDamageInputSchema>;
