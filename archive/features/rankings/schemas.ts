/**
 * Rankings Feature - Zod Schemas
 */

import { z } from 'zod';

// Enums
export const LeaderboardTypeSchema = z.enum(['XP', 'FOCUS_TIME', 'SESSION_COUNT', 'STREAK_LENGTH', 'DUEL_RATING', 'CONTRIBUTION', 'ACHIEVEMENTS', 'CUSTOM']);
export const LeaderboardScopeSchema = z.enum(['GLOBAL', 'REGIONAL', 'SQUAD', 'GUILD', 'FRIENDS']);
export const LeaderboardPeriodSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'ALL_TIME']);
export const RankTierNameSchema = z.enum(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Legend']);
export const RankingErrorCodeSchema = z.enum(['LEADERBOARD_NOT_FOUND', 'SEASON_NOT_FOUND', 'USER_NOT_RANKED', 'INVALID_SCOPE', 'INVALID_PERIOD', 'PROMOTION_NOT_AVAILABLE', 'ALREADY_IN_SERIES', 'SEASON_NOT_ENDED']);

// Core schemas
export const LeaderboardEntrySchema = z.object({
  userId: z.string().uuid(),
  rank: z.number().int().min(1),
  previousRank: z.number().int().nullable(),
  value: z.number(),
  displayValue: z.string(),
  rankChange: z.number().int(),
  valueChange: z.number(),
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
  level: z.number().int(),
  title: z.string().nullable(),
}).strict();

export const LeaderboardSchema = z.object({
  id: z.string().uuid(),
  type: LeaderboardTypeSchema,
  scope: LeaderboardScopeSchema,
  period: LeaderboardPeriodSchema,
  startsAt: z.number(),
  endsAt: z.number(),
  entries: z.array(LeaderboardEntrySchema),
  totalParticipants: z.number().int(),
  updatedAt: z.number(),
  frozen: z.boolean().default(false),
}).strict();

export const RankTierRewardSchema = z.object({
  type: z.enum(['TITLE', 'BADGE', 'AVATAR_FRAME', 'CURRENCY', 'ITEM']),
  value: z.union([z.string(), z.number()]),
  itemId: z.string().optional(),
}).strict();

export const RankTierSchema = z.object({
  id: z.string().uuid(),
  name: RankTierNameSchema,
  level: z.number().int(),
  minRating: z.number(),
  maxRating: z.number(),
  color: z.string(),
  iconUrl: z.string().url(),
  badgeUrl: z.string().url(),
  rewards: z.array(RankTierRewardSchema),
}).strict();

export const CategoryRankingSchema = z.object({
  category: LeaderboardTypeSchema,
  rank: z.number().int(),
  totalInCategory: z.number().int(),
  percentile: z.number().min(0).max(100),
  value: z.number(),
  trend: z.enum(['UP', 'DOWN', 'STABLE']),
}).strict();

export const UserRankingSchema = z.object({
  userId: z.string().uuid(),
  globalRank: z.number().int().nullable(),
  regionalRank: z.number().int().nullable(),
  rankings: z.array(CategoryRankingSchema),
  bestGlobalRank: z.number().int(),
  bestCategoryRank: CategoryRankingSchema.nullable(),
  updatedAt: z.number(),
}).strict();

export const SeasonRewardSchema = z.object({
  type: z.enum(['RANK', 'TIER', 'MILESTONE', 'PARTICIPATION']),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  claimed: z.boolean(),
  claimedAt: z.number().nullable(),
}).strict();

export const SeasonSummarySchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  seasonName: z.string(),
  finalRank: z.number().int(),
  finalTier: RankTierNameSchema,
  totalParticipants: z.number().int(),
  percentile: z.number().min(0).max(100),
  xpGained: z.number(),
  sessionsCompleted: z.number().int(),
  totalFocusTime: z.number(),
  streakHigh: z.number().int(),
  duelsWon: z.number().int(),
  duelsPlayed: z.number().int(),
  rewardsEarned: z.array(SeasonRewardSchema),
  totalRewardValue: z.number(),
  rankImprovement: z.number().int().nullable(),
  tierImprovement: z.number().int().nullable(),
  generatedAt: z.number(),
  shareCardUrl: z.string().url().nullable(),
}).strict();

export const DivisionSchema = z.object({
  id: z.string().uuid(),
  tier: RankTierNameSchema,
  division: z.number().int().min(1).max(5),
  minRating: z.number(),
  maxRating: z.number(),
  demotionBuffer: z.number(),
  promotionMatches: z.number().int(),
  promotionWinsRequired: z.number().int(),
}).strict();

export const PromotionSeriesSchema = z.object({
  userId: z.string().uuid(),
  currentTier: RankTierNameSchema,
  targetTier: RankTierNameSchema,
  matchesPlayed: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  winsRequired: z.number().int(),
  maxMatches: z.number().int(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'FAILED']),
  completedAt: z.number().nullable(),
}).strict();

// Input schemas
export const GetLeaderboardInputSchema = z.object({
  type: LeaderboardTypeSchema,
  scope: LeaderboardScopeSchema,
  period: LeaderboardPeriodSchema,
  squadId: z.string().uuid().optional(),
  guildId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  nearUserId: z.string().uuid().optional(),
}).strict();

export const GetUserRankInputSchema = z.object({
  userId: z.string().uuid(),
  type: LeaderboardTypeSchema,
  scope: LeaderboardScopeSchema,
}).strict();

export const GetSeasonSummaryInputSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid().optional(),
}).strict();

export const RankingErrorSchema = z.object({
  code: RankingErrorCodeSchema,
  message: z.string(),
  context: z.record(z.unknown()).default({}),
}).strict();

// Type exports
export type Leaderboard = z.infer<typeof LeaderboardSchema>;
export type LeaderboardType = z.infer<typeof LeaderboardTypeSchema>;
export type LeaderboardScope = z.infer<typeof LeaderboardScopeSchema>;
export type LeaderboardPeriod = z.infer<typeof LeaderboardPeriodSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type RankTier = z.infer<typeof RankTierSchema>;
export type RankTierName = z.infer<typeof RankTierNameSchema>;
export type RankTierReward = z.infer<typeof RankTierRewardSchema>;
export type UserRanking = z.infer<typeof UserRankingSchema>;
export type CategoryRanking = z.infer<typeof CategoryRankingSchema>;
export type SeasonSummary = z.infer<typeof SeasonSummarySchema>;
export type SeasonReward = z.infer<typeof SeasonRewardSchema>;
export type Division = z.infer<typeof DivisionSchema>;
export type PromotionSeries = z.infer<typeof PromotionSeriesSchema>;
export type GetLeaderboardInput = z.infer<typeof GetLeaderboardInputSchema>;
export type GetUserRankInput = z.infer<typeof GetUserRankInputSchema>;
export type GetSeasonSummaryInput = z.infer<typeof GetSeasonSummaryInputSchema>;
export type RankingError = z.infer<typeof RankingErrorSchema>;
export type RankingErrorCode = z.infer<typeof RankingErrorCodeSchema>;
