import { z } from "zod";


export const ProgressionSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    level: z.number().min(1).default(1),
    xp: z.number().min(0).default(0),
    totalXp: z.number().min(0).default(0),
    nextLevelThreshold: z.number().positive(),
    lastLevelUpAt: z.number().nullable().default(null),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .strict();

export const ProgressionSummarySchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    level: z.number().min(1),
    xp: z.number().min(0),
    nextLevelThreshold: z.number().positive(),
    progressPercent: z.number().min(0).max(100),
  })
  .strict();

export const XpSourceSchema = z.enum(['SESSION_COMPLETE', 'STREAK_BONUS', 'BOSS_BONUS', 'SQUAD_BONUS', 'PERFECT_SESSION_BONUS', 'COMEBACK_BONUS', 'DAILY_LOGIN', 'ACHIEVEMENT_UNLOCK', 'ACHIEVEMENT_BONUS', 'CHALLENGE_BONUS', 'SOCIAL_BONUS', 'EVENT_BONUS', 'BOOST_BONUS', 'SEASON_BONUS', 'AI_COACH_BONUS', 'LEVEL_UP_REWARD', 'MILESTONE_REWARD', 'PROMOTIONAL', 'EVENT_PARTICIPATION', 'AI_COACH_GOAL']);

export const XpMetadataSchema = z
  .object({
    streakDays: z.number().optional(),
    squadMultiplier: z.number().optional(),
    bossActive: z.boolean().optional(),
    perfectSession: z.boolean().optional(),
    comebackActive: z.boolean().optional(),
  })
  .catchall(z.unknown())
  .strict();

export const XpEntrySchema = z
  .object({
    id: z.string().uuid(),
    amount: z.number().positive(),
    source: XpSourceSchema,
    sessionId: z.string().uuid().nullable(),
    metadata: XpMetadataSchema.nullable(),
    createdAt: z.number(),
  })
  .strict();

export const LevelUpRecordSchema = z
  .object({
    level: z.number().min(1),
    achievedAt: z.number(),
    xpAtLevel: z.number().min(0),
  })
  .strict();

export const XpBreakdownSchema = z
  .object({
    base: z.number().min(0),
    streakBonus: z.number().min(0),
    squadBonus: z.number().min(0),
    bossBonus: z.number().min(0),
    comebackBonus: z.number().min(0),
    perfectBonus: z.number().min(0),
    total: z.number().min(0),
  })
  .strict();

export const UnlockTypeSchema = z.enum(['FEATURE', 'BOSS', 'SHOP_ITEM', 'COSMETIC', 'TITLE', 'GAME_MODE']);

export const UnlockSchema = z
  .object({
    id: z.string().uuid(),
    type: UnlockTypeSchema,
    featureId: z.string(),
    name: z.string().min(1),
    description: z.string(),
    unlockedAt: z.number().nullable(),
    minLevel: z.number().min(1),
  })
  .strict();

export const MilestoneTypeSchema = z.enum(['LEVEL', 'XP_TOTAL', 'SESSIONS_COMPLETED', 'DAYS_ACTIVE']);

export const MilestoneRewardTypeSchema = z.enum(['XP', 'COINS', 'GEMS', 'ITEM', 'TITLE', 'COSMETIC']);

export const MilestoneSchema = z
  .object({
    id: z.string().uuid(),
    type: MilestoneTypeSchema,
    threshold: z.number().positive(),
    rewardType: MilestoneRewardTypeSchema,
    rewardAmount: z.number().min(0),
    rewardItemId: z.string().nullable(),
    completed: z.boolean(),
    completedAt: z.number().nullable(),
  })
  .strict();

export const ProgressionTierSchema = z
  .object({
    level: z.number().min(1),
    name: z.string().min(1),
    description: z.string(),
    unlocks: z.array(z.string()),
    badgeUrl: z.string().nullable(),
  })
  .strict();

export const AddXpInputSchema = z
  .object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
    source: XpSourceSchema,
    sessionId: z.string().uuid().optional(),
    metadata: XpMetadataSchema.optional(),
  })
  .strict();

export const PrestigeInputSchema = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();

export const PrestigeRewardPreviewSchema = z
  .object({
    gems: z.number().min(0),
    badge: z.string().min(1),
    seasonalBonus: z.number().min(0),
  })
  .strict();

export const CalculateLevelThresholdInputSchema = z
  .object({
    level: z.number().min(1),
    baseXp: z.number().positive().default(100),
    growthFactor: z.number().positive().default(1.25),
  })
  .strict();

export const CheckUnlocksInputSchema = z
  .object({
    userId: z.string().uuid(),
    level: z.number().min(1),
    previousLevel: z.number().min(1),
  })
  .strict();

export const AddXpResultSchema = z
  .object({
    xpAdded: z.number().positive(),
    totalXp: z.number().min(0),
    currentLevel: z.number().min(1),
    levelsGained: z.number().min(0),
    newLevel: z.number().min(1),
    xpToNextLevel: z.number().positive(),
    breakdown: XpBreakdownSchema,
  })
  .strict();

export const LevelUpResultSchema = z
  .object({
    newLevel: z.number().min(1),
    previousLevel: z.number().min(1),
    totalXp: z.number().min(0),
    xpToNextLevel: z.number().positive(),
    rewards: z.array(z.string().uuid()),
    unlocks: z.array(UnlockSchema),
  })
  .strict();