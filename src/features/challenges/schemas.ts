import { z } from 'zod';

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

const readString = (row: Record<string, unknown>, ...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) {return value;}
  }
  return undefined;
};

const readNumber = (row: Record<string, unknown>, ...keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) {return value;}
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {return parsed;}
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {return numeric;}
    }
  }
  return undefined;
};

const readBoolean = (row: Record<string, unknown>, ...keys: string[]): boolean | undefined => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'boolean') {return value;}
  }
  return undefined;
};

export const ChallengeTypeSchema = z.enum(['DAILY', 'WEEKLY', 'EVENT']);
export const ChallengeStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'CLAIMED', 'EXPIRED', 'REROLLED', 'ABANDONED']);
export const ChallengeCategorySchema = z.enum([
  'SESSIONS',
  'MINUTES',
  'STREAK',
  'BOSS_DAMAGE',
  'SQUAD_ACTIVITY',
  'SHOP_PURCHASE',
  'LEVEL_UP',
  'ACHIEVEMENT',
  'SOCIAL',
]);
export const ChallengeDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);
export const DailyChallengeTriggerTypeSchema = z.enum([
  'SESSION_COMPLETED',
  'MOOD_LOGGED',
  'STREAK_CHECKED',
  'PURITY_RECORDED',
  'STREAK_UPDATED',
]);

export const ProgressHistoryEntrySchema = z.object({
  timestamp: z.number().int().nonnegative(),
  value: z.number().int().nonnegative(),
  source: z.string().min(1),
  delta: z.number().int(),
}).strict();

const ChallengeShape = z.object({
  id: z.string().min(1),
  seasonId: z.string().min(1),
  type: ChallengeTypeSchema,
  category: ChallengeCategorySchema,
  title: z.string().min(1).max(200),
  description: z.string().nullable().default(null).transform((value) => value ?? ''),
  iconUrl: z.string().nullable().default(null),
  targetValue: z.number().int().positive(),
  targetType: z.string().min(1),
  rewardType: z.string().min(1).default('XP'),
  rewardAmount: z.number().int().nonnegative().default(0),
  rewardItemId: z.string().nullable().default(null),
  startAt: z.number().int().nullable().default(null),
  endAt: z.number().int().nullable().default(null),
  isActive: z.boolean().default(true),
  difficulty: ChallengeDifficultySchema.default('MEDIUM'),
  xpBonus: z.number().int().nonnegative().default(0),
  createdAt: z.number().int().nonnegative().default(0),
}).strict();

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

const ChallengeTemplateShape = z.object({
  id: z.string().min(1),
  category: ChallengeCategorySchema,
  type: ChallengeTypeSchema,
  titleTemplate: z.string().min(1),
  descriptionTemplate: z.string().min(1),
  minTarget: z.number().int().positive(),
  maxTarget: z.number().int().positive(),
  minReward: z.number().int().nonnegative(),
  maxReward: z.number().int().nonnegative(),
  rewardType: z.string().min(1),
  weight: z.number().positive(),
  minLevel: z.number().int().nonnegative().default(1),
  requiresPremium: z.boolean().default(false),
  requiresSquad: z.boolean().default(false),
}).strict();

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

const UserChallengeShape = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  challengeId: z.string().min(1),
  currentValue: z.number().int().nonnegative().default(0),
  status: ChallengeStatusSchema.default('ACTIVE'),
  assignedAt: z.number().int().nonnegative().default(0),
  completedAt: z.number().int().nullable().default(null),
  claimedAt: z.number().int().nullable().default(null),
  expiresAt: z.number().int().nullable().default(null),
  rerollCount: z.number().int().nonnegative().default(0),
  rerolledFromId: z.string().nullable().default(null),
  lastProgressAt: z.number().int().nullable().default(null),
  progressHistory: z.array(ProgressHistoryEntrySchema).default([]),
  createdAt: z.number().int().nonnegative().default(0),
}).strict();

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

export const ChallengeRewardSchema = z.object({
  type: z.string().min(1),
  amount: z.number().int().nonnegative(),
  itemId: z.string().nullable(),
  delivered: z.boolean(),
  deliveredAt: z.number().int().nullable(),
}).strict();

export const ChallengeCompletionResultSchema = z.object({
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
}).strict();

export const UserChallengeSummarySchema = z.object({
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
}).strict();

export const ChallengeDetailSchema = z.object({
  challenge: ChallengeSchema,
  userChallenge: UserChallengeSchema,
  xpReward: z.number().int().nonnegative(),
  coinReward: z.number().int().nonnegative(),
  requiredCount: z.number().int().positive(),
}).strict();

export const RerollResultSchema = z.object({
  success: z.boolean(),
  oldChallengeId: z.string(),
  newChallengeId: z.string(),
  newChallenge: ChallengeSchema.nullable(),
  gemsSpent: z.number().int().nonnegative(),
  freeRerollUsed: z.boolean(),
  error: z.string().nullable(),
  remainingGems: z.number().int().nonnegative(),
  remainingFreeRerollsToday: z.number().int().nonnegative(),
}).strict();

export const RerollEligibilitySchema = z.object({
  canReroll: z.boolean(),
  reason: z.string().nullable(),
  freeRerollAvailable: z.boolean(),
  gemsRequired: z.number().int().nonnegative(),
  currentGems: z.number().int().nonnegative(),
  rerollCountToday: z.number().int().nonnegative(),
  maxRerollsPerDay: z.number().int().positive(),
}).strict();

export const AssignChallengeInputSchema = z.object({
  userId: z.string().min(1),
  seasonId: z.string().min(1),
  challengeType: ChallengeTypeSchema,
  challengeId: z.string().min(1).optional(),
}).strict();

export const UpdateChallengeProgressInputSchema = z.object({
  userId: z.string().min(1),
  challengeId: z.string().min(1),
  delta: z.number().int().positive(),
  source: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
}).strict();

export const RerollChallengeInputSchema = z.object({
  userId: z.string().min(1),
  challengeId: z.string().min(1),
  usePaidReroll: z.boolean(),
  idempotencyKey: z.string().optional(),
}).strict();

export const ClaimChallengeRewardInputSchema = z.object({
  userId: z.string().min(1),
  challengeId: z.string().min(1),
}).strict();

export const ChallengeGenerationConfigSchema = z.object({
  seasonId: z.string().min(1),
  userId: z.string().min(1),
  userLevel: z.number().int().positive(),
  isPremium: z.boolean(),
  hasSquad: z.boolean(),
  challengeType: ChallengeTypeSchema,
  dailyChallengeCount: z.number().int().min(1).max(5).default(3),
  weeklyChallengeCount: z.number().int().min(1).max(5).default(3),
}).strict();

export const DailyChallengeContextSchema = z.object({
  minutesCompleted: z.number().int().nonnegative().optional(),
  sessionCount: z.number().int().nonnegative().optional(),
  purity: z.number().min(0).max(100).optional(),
  streakDays: z.number().int().nonnegative().optional(),
  moodLogged: z.boolean().optional(),
  streakChecked: z.boolean().optional(),
}).strict();

export const ChallengeProgressCheckResultSchema = z.object({
  updated: z.array(ChallengeDetailSchema),
  completed: z.array(ChallengeCompletionResultSchema),
}).strict();

export type Challenge = z.infer<typeof ChallengeSchema>;
export type ChallengeTemplate = z.infer<typeof ChallengeTemplateSchema>;
export type ChallengeType = z.infer<typeof ChallengeTypeSchema>;
export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;
export type ChallengeCategory = z.infer<typeof ChallengeCategorySchema>;
export type ChallengeDifficulty = z.infer<typeof ChallengeDifficultySchema>;
export type UserChallenge = z.infer<typeof UserChallengeSchema>;
export type UserChallengeSummary = z.infer<typeof UserChallengeSummarySchema>;
export type ProgressHistoryEntry = z.infer<typeof ProgressHistoryEntrySchema>;
export type ChallengeReward = z.infer<typeof ChallengeRewardSchema>;
export type ChallengeCompletionResult = z.infer<typeof ChallengeCompletionResultSchema>;
export type ChallengeDetail = z.infer<typeof ChallengeDetailSchema>;
export type RerollResult = z.infer<typeof RerollResultSchema>;
export type RerollEligibility = z.infer<typeof RerollEligibilitySchema>;
export type AssignChallengeInput = z.infer<typeof AssignChallengeInputSchema>;
export type UpdateChallengeProgressInput = z.infer<typeof UpdateChallengeProgressInputSchema>;
export type RerollChallengeInput = z.infer<typeof RerollChallengeInputSchema>;
export type ClaimChallengeRewardInput = z.infer<typeof ClaimChallengeRewardInputSchema>;
export type ChallengeGenerationConfig = z.infer<typeof ChallengeGenerationConfigSchema>;
export type DailyChallengeTriggerType = z.infer<typeof DailyChallengeTriggerTypeSchema>;
export type DailyChallengeContext = z.infer<typeof DailyChallengeContextSchema>;
export type ChallengeProgressCheckResult = z.infer<typeof ChallengeProgressCheckResultSchema>;
export type ChallengeAnalytics = {
  totalChallengesIssued: number;
  completionRate: number;
  averageTimeToComplete: number;
  rerollRate: number;
  claimRate: number;
  categoryBreakdown: Record<string, { issued: number; completed: number; avgTime: number }>;
  difficultyBreakdown: Record<string, { issued: number; completed: number }>;
};
