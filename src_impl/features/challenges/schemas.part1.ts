import { z } from "zod";


export const ChallengeTypeSchema = z.enum(['DAILY', 'WEEKLY', 'EVENT']);

export const ChallengeStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'CLAIMED', 'EXPIRED', 'REROLLED', 'ABANDONED']);

export const ChallengeCategorySchema = z.enum(['SESSIONS', 'MINUTES', 'STREAK', 'BOSS_DAMAGE', 'SQUAD_ACTIVITY', 'SHOP_PURCHASE', 'LEVEL_UP', 'ACHIEVEMENT', 'SOCIAL']);

export const ChallengeDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);

export const DailyChallengeTriggerTypeSchema = z.enum(['SESSION_COMPLETED', 'MOOD_LOGGED', 'STREAK_CHECKED', 'PURITY_RECORDED', 'STREAK_UPDATED']);

export const ProgressHistoryEntrySchema = z
  .object({
    timestamp: z.number().int().nonnegative(),
    value: z.number().int().nonnegative(),
    source: z.string().min(1),
    delta: z.number().int(),
  })
  .strict();

export const ChallengeSchema = z.preprocess((value) => {
  const row = asRecord(value);
  return {
    id: readString(row, 'id') ?? '',
    seasonId: readString(row, 'seasonId', 'season_id') ?? '',
    type: readString(row, 'type') ?? 'DAILY',
    category: readString(row, 'category') ?? 'SESSIONS',
    title: readString(row, 'title') ?? '',
    description: readString(row, 'description') ?? '',
    iconUrl: readString(row, 'iconUrl', 'icon_url') ?? null,
    targetValue: readNumber(row, 'targetValue', 'target_value') ?? 1,
    targetType: readString(row, 'targetType', 'target_type') ?? 'SESSIONS',
    rewardType: readString(row, 'rewardType', 'reward_type') ?? 'XP',
    rewardAmount: readNumber(row, 'rewardAmount', 'reward_amount') ?? 0,
    rewardItemId: readString(row, 'rewardItemId', 'reward_item_id') ?? null,
    startAt: readNumber(row, 'startAt', 'start_at') ?? null,
    endAt: readNumber(row, 'endAt', 'end_at') ?? null,
    isActive: readBoolean(row, 'isActive', 'is_active') ?? true,
    difficulty: readString(row, 'difficulty') ?? 'MEDIUM',
    xpBonus: readNumber(row, 'xpBonus', 'xp_bonus') ?? 0,
    createdAt: readNumber(row, 'createdAt', 'created_at') ?? Date.now(),
  };
}, ChallengeShape);

export const ChallengeTemplateSchema = z.preprocess((value) => {
  const row = asRecord(value);
  return {
    id: readString(row, 'id') ?? '',
    category: readString(row, 'category') ?? 'SESSIONS',
    type: readString(row, 'type') ?? 'DAILY',
    titleTemplate: readString(row, 'titleTemplate', 'title_template') ?? '',
    descriptionTemplate: readString(row, 'descriptionTemplate', 'description_template') ?? '',
    minTarget: readNumber(row, 'minTarget', 'min_target') ?? 1,
    maxTarget: readNumber(row, 'maxTarget', 'max_target') ?? 1,
    minReward: readNumber(row, 'minReward', 'min_reward') ?? 0,
    maxReward: readNumber(row, 'maxReward', 'max_reward') ?? 0,
    rewardType: readString(row, 'rewardType', 'reward_type') ?? 'XP',
    weight: readNumber(row, 'weight') ?? 1,
    minLevel: readNumber(row, 'minLevel', 'min_level') ?? 1,
    requiresPremium: readBoolean(row, 'requiresPremium', 'requires_premium') ?? false,
    requiresSquad: readBoolean(row, 'requiresSquad', 'requires_squad') ?? false,
  };
}, ChallengeTemplateShape);

export const UserChallengeSchema = z.preprocess((value) => {
  const row = asRecord(value);
  return {
    id: readString(row, 'id') ?? '',
    userId: readString(row, 'userId', 'user_id') ?? '',
    challengeId: readString(row, 'challengeId', 'challenge_id') ?? '',
    currentValue: readNumber(row, 'currentValue', 'current_value') ?? 0,
    status: readString(row, 'status') ?? 'ACTIVE',
    assignedAt: readNumber(row, 'assignedAt', 'assigned_at') ?? Date.now(),
    completedAt: readNumber(row, 'completedAt', 'completed_at') ?? null,
    claimedAt: readNumber(row, 'claimedAt', 'claimed_at') ?? null,
    expiresAt: readNumber(row, 'expiresAt', 'expires_at') ?? null,
    rerollCount: readNumber(row, 'rerollCount', 'reroll_count') ?? 0,
    rerolledFromId: readString(row, 'rerolledFromId', 'rerolled_from_id') ?? null,
    lastProgressAt: readNumber(row, 'lastProgressAt', 'last_progress_at') ?? null,
    progressHistory: Array.isArray(row.progressHistory) ? row.progressHistory : Array.isArray(row.progress_history) ? row.progress_history : [],
    createdAt: readNumber(row, 'createdAt', 'created_at') ?? Date.now(),
  };
}, UserChallengeShape);

export const ChallengeRewardSchema = z
  .object({
    type: z.string().min(1),
    amount: z.number().int().nonnegative(),
    itemId: z.string().nullable(),
    delivered: z.boolean(),
    deliveredAt: z.number().int().nullable(),
  })
  .strict();

export const ChallengeCompletionResultSchema = z
  .object({
    success: z.boolean(),
    challengeId: z.string().min(1),
    userId: z.string().min(1),
    completedAt: z.number().int().nonnegative(),
    rewards: z.array(ChallengeRewardSchema),
    xpEarned: z.number().int().nonnegative(),
    seasonProgressAdvanced: z.boolean(),
    newTierUnlocked: z.boolean(),
    timeToComplete: z.number().int().nonnegative(),
    wasRerolled: z.boolean(),
  })
  .strict();

export const UserChallengeSummarySchema = z
  .object({
    challengeId: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    category: ChallengeCategorySchema,
    type: ChallengeTypeSchema,
    difficulty: ChallengeDifficultySchema,
    currentValue: z.number().int().nonnegative(),
    targetValue: z.number().int().positive(),
    progressPercent: z.number().min(0).max(100),
    status: ChallengeStatusSchema,
    isClaimable: z.boolean(),
    isExpired: z.boolean(),
    expiresInMs: z.number().nullable(),
    rewardType: z.string().min(1),
    rewardAmount: z.number().int().nonnegative(),
    canReroll: z.boolean(),
    rerollCost: z.number().int().nonnegative(),
    freeRerollAvailable: z.boolean(),
    rerollCount: z.number().int().nonnegative(),
  })
  .strict();

export const ChallengeDetailSchema = z
  .object({
    challenge: ChallengeSchema,
    userChallenge: UserChallengeSchema,
    xpReward: z.number().int().nonnegative(),
    coinReward: z.number().int().nonnegative(),
    requiredCount: z.number().int().positive(),
  })
  .strict();

export const RerollResultSchema = z
  .object({
    success: z.boolean(),
    oldChallengeId: z.string(),
    newChallengeId: z.string(),
    newChallenge: ChallengeSchema.nullable(),
    gemsSpent: z.number().int().nonnegative(),
    freeRerollUsed: z.boolean(),
    error: z.string().nullable(),
    remainingGems: z.number().int().nonnegative(),
    remainingFreeRerollsToday: z.number().int().nonnegative(),
  })
  .strict();

export const RerollEligibilitySchema = z
  .object({
    canReroll: z.boolean(),
    reason: z.string().nullable(),
    freeRerollAvailable: z.boolean(),
    gemsRequired: z.number().int().nonnegative(),
    currentGems: z.number().int().nonnegative(),
    rerollCountToday: z.number().int().nonnegative(),
    maxRerollsPerDay: z.number().int().positive(),
  })
  .strict();