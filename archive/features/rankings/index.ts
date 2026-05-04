/**
 * Rankings Feature - Public API
 */

// Types
export type {
  Leaderboard,
  LeaderboardType,
  LeaderboardScope,
  LeaderboardPeriod,
  LeaderboardEntry,
  RankTier,
  RankTierName,
  RankTierReward,
  UserRanking,
  CategoryRanking,
  SeasonSummary,
  SeasonReward,
  Division,
  PromotionSeries,
  GetLeaderboardInput,
  GetUserRankInput,
  GetSeasonSummaryInput,
  RankingError,
} from './schemas';

// Schemas
export {
  LeaderboardSchema,
  LeaderboardEntrySchema,
  RankTierSchema,
  UserRankingSchema,
  SeasonSummarySchema,
  GetLeaderboardInputSchema,
} from './schemas';

// Service
export {
  getLeaderboard,
  getUserRank,
  getGlobalRank,
  getNearbyRanks,
  getRankTiers,
  getUserTier,
  getUserRanking,
  updateUserRanking,
  getCurrentSeasonSummary,
  getSeasonHistory,
  generateSeasonSummary,
  updateLeaderboardEntry,
} from './service';

// Hooks
export {
  useLeaderboard,
  useUserRank,
  useGlobalRank,
  useNearbyRanks,
  useRankTiers,
  useUserTier,
  useUserRanking,
  useUpdateUserRanking,
  useCurrentSeasonSummary,
  useSeasonHistory,
} from './hooks';
