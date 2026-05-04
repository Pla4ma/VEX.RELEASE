/**
 * Rankings Feature - Domain Types
 *
 * Leaderboards, tier calculation, and seasonal competitive summaries.
 */

// ============================================================================
// Leaderboard Types
// ============================================================================

export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  scope: LeaderboardScope;
  period: LeaderboardPeriod;

  // Time range
  startsAt: number;
  endsAt: number;

  // Entries
  entries: LeaderboardEntry[];
  totalParticipants: number;

  // Meta
  updatedAt: number;
  frozen: boolean;
}

export type LeaderboardType =
  | 'XP'
  | 'FOCUS_TIME'
  | 'SESSION_COUNT'
  | 'STREAK_LENGTH'
  | 'DUEL_RATING'
  | 'CONTRIBUTION'
  | 'ACHIEVEMENTS'
  | 'CUSTOM';

export type LeaderboardScope = 'GLOBAL' | 'REGIONAL' | 'SQUAD' | 'GUILD' | 'FRIENDS';

export type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEASONAL' | 'ALL_TIME';

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  previousRank: number | null;

  // Score/value
  value: number;
  displayValue: string;

  // Change tracking
  rankChange: number; // Positive = moved up
  valueChange: number;

  // User info (enriched)
  displayName: string;
  avatarUrl: string | null;
  level: number;
  title: string | null;
}

// ============================================================================
// Ranking Tier Types
// ============================================================================

export interface RankTier {
  id: string;
  name: RankTierName;
  level: number;

  // Requirements
  minRating: number;
  maxRating: number;

  // Visual
  color: string;
  iconUrl: string;
  badgeUrl: string;

  // Rewards
  rewards: RankTierReward[];
}

export type RankTierName =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster'
  | 'Legend';

export interface RankTierReward {
  type: 'TITLE' | 'BADGE' | 'AVATAR_FRAME' | 'CURRENCY' | 'ITEM';
  value: string | number;
  itemId?: string;
}

// ============================================================================
// User Ranking Types
// ============================================================================

export interface UserRanking {
  userId: string;

  // Overall stats
  globalRank: number | null;
  regionalRank: number | null;

  // Category rankings
  rankings: CategoryRanking[];

  // Best performances
  bestGlobalRank: number;
  bestCategoryRank: CategoryRanking | null;

  // Updated
  updatedAt: number;
}

export interface CategoryRanking {
  category: LeaderboardType;
  rank: number;
  totalInCategory: number;
  percentile: number; // 0-100, lower is better
  value: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// ============================================================================
// Season Summary Types
// ============================================================================

export interface SeasonSummary {
  userId: string;
  seasonId: string;
  seasonName: string;

  // Final standings
  finalRank: number;
  finalTier: RankTierName;
  totalParticipants: number;
  percentile: number;

  // Performance
  xpGained: number;
  sessionsCompleted: number;
  totalFocusTime: number;
  streakHigh: number;
  duelsWon: number;
  duelsPlayed: number;

  // Rewards earned
  rewardsEarned: SeasonReward[];
  totalRewardValue: number;

  // Comparison
  rankImprovement: number | null; // vs previous season
  tierImprovement: number | null;

  // Generated
  generatedAt: number;

  // Shareable
  shareCardUrl: string | null;
}

export interface SeasonReward {
  type: 'RANK' | 'TIER' | 'MILESTONE' | 'PARTICIPATION';
  name: string;
  value: string | number;
  claimed: boolean;
  claimedAt: number | null;
}

// ============================================================================
// Division/Tier System
// ============================================================================

export interface Division {
  id: string;
  tier: RankTierName;
  division: number; // 1-5 within tier

  // Requirements
  minRating: number;
  maxRating: number;

  // Demotion protection
  demotionBuffer: number;

  // Promotion requirements
  promotionMatches: number;
  promotionWinsRequired: number;
}

export interface PromotionSeries {
  userId: string;
  currentTier: RankTierName;
  targetTier: RankTierName;

  // Series state
  matchesPlayed: number;
  wins: number;
  losses: number;

  // Requirements
  winsRequired: number;
  maxMatches: number;

  // Status
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  completedAt: number | null;
}

// ============================================================================
// Input Types
// ============================================================================

export interface GetLeaderboardInput {
  type: LeaderboardType;
  scope: LeaderboardScope;
  period: LeaderboardPeriod;
  squadId?: string;
  guildId?: string;
  limit?: number;
  nearUserId?: string;
}

export interface GetUserRankInput {
  userId: string;
  type: LeaderboardType;
  scope: LeaderboardScope;
}

export interface GetSeasonSummaryInput {
  userId: string;
  seasonId?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type RankingErrorCode =
  | 'LEADERBOARD_NOT_FOUND'
  | 'SEASON_NOT_FOUND'
  | 'USER_NOT_RANKED'
  | 'INVALID_SCOPE'
  | 'INVALID_PERIOD'
  | 'PROMOTION_NOT_AVAILABLE'
  | 'ALREADY_IN_SERIES'
  | 'SEASON_NOT_ENDED';

export interface RankingError {
  code: RankingErrorCode;
  message: string;
  context: Record<string, unknown>;
}
