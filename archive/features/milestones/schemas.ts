/**
 * Milestones Feature - Zod Schemas
 */

import { z } from 'zod';

// ============================================================================
// Core Milestone Schemas
// ============================================================================

export const MilestoneTypeSchema = z.enum([
  'LEVEL',
  'XP_TOTAL',
  'STREAK_DAYS',
  'SESSIONS_COMPLETED',
  'FOCUS_TIME',
  'BOSS_DEFEATS',
  'DAYS_ACTIVE',
  'ACHIEVEMENTS_UNLOCKED',
]);

export const MilestoneCategorySchema = z.enum([
  'PROGRESSION',
  'STREAK',
  'SESSION',
  'BOSS',
  'SOCIAL',
]);

export const MilestoneRewardTypeSchema = z.enum([
  'XP',
  'COINS',
  'GEMS',
  'ITEM',
  'BADGE',
  'TITLE',
  'COSMETIC',
]);

export const MilestoneSchema = z.object({
  id: z.string().uuid(),
  type: MilestoneTypeSchema,
  category: MilestoneCategorySchema,
  threshold: z.number().positive(),
  name: z.string().min(1),
  description: z.string(),
  iconUrl: z.string().nullable(),
  rewardType: MilestoneRewardTypeSchema,
  rewardAmount: z.number().min(0),
  rewardItemId: z.string().uuid().nullable(),
  unlockedAt: z.number().nullable(),
}).strict();

// ============================================================================
// Progress Schemas
// ============================================================================

export const MilestoneProgressSchema = z.object({
  id: z.string().uuid(),
  milestoneId: z.string().uuid(),
  currentValue: z.number().min(0),
  threshold: z.number().positive(),
  percentComplete: z.number().min(0).max(100),
  completed: z.boolean(),
  completedAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).strict();

export const MilestoneUnlockSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  milestoneId: z.string().uuid(),
  unlockedAt: z.number(),
  rewardType: z.string(),
  rewardAmount: z.number(),
  rewardClaimed: z.boolean(),
  rewardClaimedAt: z.number().nullable(),
  createdAt: z.number(),
}).strict();

// ============================================================================
// Unlock Schemas
// ============================================================================

export const UnlockTypeSchema = z.enum([
  'FEATURE',
  'BOSS',
  'SHOP_ITEM',
  'GAME_MODE',
  'COSMETIC',
  'TITLE',
  'SQUAD_FEATURE',
]);

export const UnlockSchema = z.object({
  id: z.string().uuid(),
  type: UnlockTypeSchema,
  featureId: z.string(),
  name: z.string().min(1),
  description: z.string(),
  minLevel: z.number().min(1),
  requiredMilestoneId: z.string().uuid().nullable(),
  unlockedAt: z.number().nullable(),
}).strict();

// ============================================================================
// Input Schemas
// ============================================================================

export const CheckMilestoneInputSchema = z.object({
  userId: z.string().uuid(),
  milestoneId: z.string().uuid(),
  currentValue: z.number().min(0),
}).strict();

export const CreateMilestoneInputSchema = z.object({
  type: MilestoneTypeSchema,
  category: MilestoneCategorySchema,
  threshold: z.number().positive(),
  name: z.string().min(1),
  description: z.string(),
  rewardType: MilestoneRewardTypeSchema,
  rewardAmount: z.number().min(0),
}).strict();

// ============================================================================
// Inferred Types
// ============================================================================

export type Milestone = z.infer<typeof MilestoneSchema>;
export type MilestoneType = z.infer<typeof MilestoneTypeSchema>;
export type MilestoneCategory = z.infer<typeof MilestoneCategorySchema>;
export type MilestoneRewardType = z.infer<typeof MilestoneRewardTypeSchema>;
export type MilestoneProgress = z.infer<typeof MilestoneProgressSchema>;
export type MilestoneUnlock = z.infer<typeof MilestoneUnlockSchema>;
export type UnlockType = z.infer<typeof UnlockTypeSchema>;
export type Unlock = z.infer<typeof UnlockSchema>;
export type CheckMilestoneInput = z.infer<typeof CheckMilestoneInputSchema>;
export type CreateMilestoneInput = z.infer<typeof CreateMilestoneInputSchema>;
