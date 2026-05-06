/**
 * Rewards Feature - Zod Schemas
 */

import { z } from "zod";

// ============================================================================
// Core Reward Schemas
// ============================================================================

export const RewardTypeSchema = z.enum(["XP", "COINS", "GEMS", "ITEM", "COSMETIC", "TITLE", "STREAK_SHIELD", "BOOST"]);

export const RewardStatusSchema = z.enum(["PENDING", "CLAIMED", "EXPIRED", "FAILED"]);

export const RewardTriggerSchema = z.enum(["SESSION_COMPLETE", "STREAK_MILESTONE", "BOSS_DEFEAT", "LEVEL_UP", "ACHIEVEMENT_UNLOCK", "DAILY_LOGIN", "COMEBACK", "PROMOTIONAL"]);

export const RewardSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: RewardTypeSchema,
    amount: z.number().nullable(),
    itemId: z.string().uuid().nullable(),
    triggerType: RewardTriggerSchema,
    triggerId: z.string().uuid().nullable(),
    status: RewardStatusSchema,
    claimedAt: z.number().nullable(),
    expiresAt: z.number().nullable(),
    createdAt: z.number(),
  })
  .strict();

// ============================================================================
// Ledger Schemas
// ============================================================================

export const LedgerActionSchema = z.enum(["CREATED", "CLAIMED", "EXPIRED", "FAILED", "REVOKED"]);

export const RewardLedgerEntrySchema = z
  .object({
    id: z.string().uuid(),
    rewardId: z.string().uuid(),
    action: LedgerActionSchema,
    timestamp: z.number(),
    details: z.record(z.unknown()),
  })
  .strict();

// ============================================================================
// Claim Schemas
// ============================================================================

export const DeliverableTypeSchema = z.enum(["XP", "COINS", "GEMS", "ITEM", "COSMETIC", "TITLE", "SHIELD"]);

export const ClaimStatusSchema = z.enum(["IN_PROGRESS", "COMPLETED", "PARTIAL", "FAILED"]);

export const DeliverableSchema = z
  .object({
    type: DeliverableTypeSchema,
    amount: z.number().min(0),
    itemId: z.string().nullable(),
    delivered: z.boolean(),
    deliveredAt: z.number().nullable(),
  })
  .strict();

export const RewardClaimSchema = z
  .object({
    rewardId: z.string().uuid(),
    userId: z.string().uuid(),
    claimedAt: z.number(),
    deliverables: z.array(DeliverableSchema),
    status: ClaimStatusSchema,
  })
  .strict();

export const RewardLedgerSchema = z
  .object({
    id: z.string().uuid(),
    rewardId: z.string().uuid(),
    action: z.enum(["CREATED", "CLAIMED", "EXPIRED", "FAILED"]),
    details: z.record(z.unknown()),
    createdAt: z.number(),
  })
  .strict();

// ============================================================================
// Calculator Schemas
// ============================================================================

export const RewardMultiplierSchema = z
  .object({
    source: z.string(),
    value: z.number(),
    description: z.string(),
  })
  .strict();

export const RewardBonusSchema = z
  .object({
    source: z.string(),
    amount: z.number(),
    description: z.string(),
  })
  .strict();

export const RewardCalculationSchema = z
  .object({
    baseAmount: z.number(),
    multipliers: z.array(RewardMultiplierSchema),
    bonuses: z.array(RewardBonusSchema),
    finalAmount: z.number(),
  })
  .strict();

// ============================================================================
// Session Chest Schemas
// ============================================================================

export const ChestTierSchema = z.enum(["common", "rare", "epic", "legendary"]);

export const ChestRollInputSchema = z
  .object({
    sessionDurationSeconds: z.number().finite().min(1),
    focusPurityScore: z.number().finite().min(0).max(100),
    currentStreakDays: z.number().int().min(0),
    userLevel: z.number().int().min(1),
    isFirstSessionToday: z.boolean(),
    lootMultiplier: z.number().min(1).max(8).default(1),
  })
  .strict();

export const ChestResultSchema = z
  .object({
    tier: ChestTierSchema,
    xpReward: z.number().int().min(1),
    coinReward: z.number().int().min(0),
    gemReward: z.number().int().min(0),
    bonusItemId: z.string().nullable(),
    nearMissSymbols: z.tuple([z.string(), z.string(), z.string()]),
    isNearMiss: z.boolean(),
  })
  .strict();

// ============================================================================
// Definition Schemas
// ============================================================================

export const MilestoneTypeSchema = z.enum(["STREAK_DAYS", "LEVEL", "SESSIONS_COMPLETED", "BOSS_DEFEATS", "DAYS_ACTIVE"]);

export const MilestoneRewardItemSchema = z
  .object({
    type: RewardTypeSchema,
    amount: z.number().min(0),
    itemId: z.string().nullable(),
    chancePercent: z.number().min(0).max(100).default(100),
  })
  .strict();

export const RewardDefinitionSchema = z
  .object({
    id: z.string().uuid(),
    triggerType: RewardTriggerSchema,
    rewardType: RewardTypeSchema,
    baseAmount: z.number().min(0),
    minLevel: z.number().min(1).optional(),
    maxLevel: z.number().min(1).optional(),
    chancePercent: z.number().min(0).max(100).optional(),
    cooldownHours: z.number().min(0).optional(),
    stackable: z.boolean().default(true),
  })
  .strict();

// ============================================================================
// Input Schemas
// ============================================================================

export const CreateRewardInputSchema = z
  .object({
    userId: z.string().uuid(),
    type: RewardTypeSchema,
    amount: z.number().min(0),
    itemId: z.string().uuid().optional(),
    triggerType: RewardTriggerSchema,
    triggerId: z.string().uuid().optional(),
    expiresAt: z.number().optional(),
  })
  .strict();

export const ClaimRewardInputSchema = z
  .object({
    rewardId: z.string().uuid(),
    userId: z.string().uuid(),
  })
  .strict();

export const CalculateRewardInputSchema = z
  .object({
    triggerType: RewardTriggerSchema,
    baseAmount: z.number().min(0),
    userLevel: z.number().min(1),
    streakDays: z.number().min(0).default(0),
    squadMultiplier: z.number().min(1).default(1),
    bossActive: z.boolean().default(false),
  })
  .strict();

// ============================================================================
// Inferred Types
// ============================================================================

export type Reward = z.infer<typeof RewardSchema>;
export type RewardType = z.infer<typeof RewardTypeSchema>;
export type RewardStatus = z.infer<typeof RewardStatusSchema>;
export type RewardTrigger = z.infer<typeof RewardTriggerSchema>;
export type RewardLedgerEntry = z.infer<typeof RewardLedgerEntrySchema>;
export type DeliverableType = z.infer<typeof DeliverableTypeSchema>;
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;
export type Deliverable = z.infer<typeof DeliverableSchema>;
export type RewardClaim = z.infer<typeof RewardClaimSchema>;
export type RewardLedger = z.infer<typeof RewardLedgerSchema>;
export type RewardCalculation = z.infer<typeof RewardCalculationSchema>;
export type ChestTier = z.infer<typeof ChestTierSchema>;
export type MilestoneType = z.infer<typeof MilestoneTypeSchema>;
export type MilestoneRewardItem = z.infer<typeof MilestoneRewardItemSchema>;
export type CreateRewardInput = z.infer<typeof CreateRewardInputSchema>;
export type ClaimRewardInput = z.infer<typeof ClaimRewardInputSchema>;
export type CalculateRewardInput = z.infer<typeof CalculateRewardInputSchema>;
export type ChestRollInput = z.infer<typeof ChestRollInputSchema>;
export type ChestResult = z.infer<typeof ChestResultSchema>;
