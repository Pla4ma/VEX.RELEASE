/**
 * Seasons Feature - Domain Types
 *
 * Dependencies:
 * - BattlePass (seasonal progression tracking)
 * - Challenges (season-bound challenges)
 * - Rewards (season reward delivery)
 * - LiveOpsConfig (remote season configuration)
 * - Economy (premium purchases)
 */

// ============================================================================
// Core Season Types
// ============================================================================

export interface Season {
  id: string;
  name: string;
  description: string | null;
  theme: string | null;
  startAt: number;
  endAt: number;
  archivedAt: number | null;
  tierCount: number;
  xpPerTier: number;
  premiumPriceGems: number;
  isActive: boolean;
  createdAt: number;
}

export interface SeasonSummary {
  id: string;
  name: string;
  theme: string | null;
  phase: SeasonPhase;
  daysRemaining: number;
  totalDays: number;
  progressPercent: number;
}

export interface SeasonDetail extends Season {
  challenges: string[]; // Challenge IDs
  milestones: SeasonMilestone[];
  totalParticipants: number;
  averageProgress: number;
}

// ============================================================================
// Season Phase Types
// ============================================================================

export type SeasonPhase =
  | 'PRESEASON'      // Before season starts, preview available
  | 'ACTIVE'         // Season in progress
  | 'ALMOST_ENDING'  // < 7 days remaining
  | 'ENDED'          // Season over, grace period active
  | 'ARCHIVED';      // Grace period over, archived

export interface SeasonPhaseInfo {
  phase: SeasonPhase;
  displayName: string;
  description: string;
  color: string; // Design token key
  icon: string;
}

// ============================================================================
// Season Content Types
// ============================================================================

export interface SeasonContent {
  seasonId: string;
  themeAssets: ThemeAssets;
  featuredItems: string[]; // Item definition IDs
  exclusiveRewards: string[]; // Reward IDs
  storyContent: StoryContent | null;
}

export interface ThemeAssets {
  primaryColor: string;
  secondaryColor: string;
  backgroundUrl: string | null;
  bannerUrl: string | null;
  iconUrl: string | null;
}

export interface StoryContent {
  title: string;
  chapters: StoryChapter[];
}

export interface StoryChapter {
  id: string;
  title: string;
  unlockTier: number;
  content: string;
  imageUrl: string | null;
}

// ============================================================================
// Season Milestone Types
// ============================================================================

export interface SeasonMilestone {
  id: string;
  seasonId: string;
  tier: number;
  name: string;
  description: string;
  rewardType: string;
  rewardAmount: number;
  rewardItemId: string | null;
}

// ============================================================================
// User Season Progress Types
// ============================================================================

export interface UserSeasonProgress {
  id: string;
  userId: string;
  seasonId: string;
  currentTier: number;
  tierXp: number;
  totalSeasonXp: number;
  isPremium: boolean;
  premiumPurchasedAt: number | null;
  claimedTiers: string[]; // Tier IDs
  createdAt: number;
  updatedAt: number;
}

export interface UserSeasonProgressSummary {
  seasonId: string;
  currentTier: number;
  tierProgress: number; // 0-100
  totalProgress: number; // 0-100 across all tiers
  isPremium: boolean;
  nextTierClaimable: boolean;
  unclaimedTiers: number;
}

// ============================================================================
// Season Transition Types
// ============================================================================

export interface SeasonTransition {
  previousSeasonId: string | null;
  nextSeasonId: string | null;
  transitionType: 'START' | 'END' | 'ARCHIVE';
  userImpact: UserTransitionImpact;
}

export interface UserTransitionImpact {
  unclaimedRewards: number;
  carryoverProgress: number;
  newSeasonStartTier: number;
  bonusRewards: string[];
}

// ============================================================================
// Season Archive Types
// ============================================================================

export interface SeasonHistory {
  id: string;
  userId: string;
  seasonId: string;
  finalTier: number;
  totalXpEarned: number;
  challengesCompleted: number;
  rewardsClaimed: number;
  wasPremium: boolean;
  completedAt: number;
}

export interface ArchivedSeason {
  season: Season;
  userHistory: SeasonHistory | null;
  leaderboardSnapshot: LeaderboardSnapshot | null;
}

export interface LeaderboardSnapshot {
  topUsers: Array<{ userId: string; tier: number; xp: number }>;
  userRank: number | null;
  totalParticipants: number;
}

// ============================================================================
// Service Input/Output Types
// ============================================================================

export interface CreateSeasonInput {
  name: string;
  description?: string;
  theme?: string;
  startAt: number;
  endAt: number;
  tierCount: number;
  xpPerTier: number;
  premiumPriceGems: number;
}

export interface UpdateSeasonInput {
  name?: string;
  description?: string;
  theme?: string;
  endAt?: number;
  isActive?: boolean;
}

export interface GetSeasonProgressInput {
  userId: string;
  seasonId: string;
}

export interface AdvanceTierInput {
  userId: string;
  seasonId: string;
  xpAmount: number;
  source: string;
}

export interface PurchasePremiumInput {
  userId: string;
  seasonId: string;
  paymentMethod: 'GEMS' | 'REAL_MONEY';
}

// ============================================================================
// Season Analytics Types
// ============================================================================

export interface SeasonStats {
  seasonId: string;
  totalParticipants: number;
  premiumParticipants: number;
  averageTier: number;
  totalXpEarned: number;
  challengesCompleted: number;
  revenueGems: number;
}

export interface SeasonEngagementMetrics {
  dau: number; // Daily active users
  sessionCount: number;
  averageSessionDuration: number;
  challengeCompletionRate: number;
  claimRate: number;
}

// ============================================================================
// PHASE 14.1: Season Narrative Types
// ============================================================================

export interface SeasonNarrative {
  /** Compelling season name (e.g., "Season of the Void") */
  displayName: string;
  /** Theme description - 2 sentences about the season's bosses */
  themeDescription: string;
  /** Boss flavor for this season */
  bossTheme: string;
  /** Primary color for season theming */
  accentColor: string;
  /** Community goal description */
  communityGoalText: string;
  /** Target for community goal (e.g., 1_000_000 sessions) */
  communityGoalTarget: number;
}

export interface SeasonCommunityGoal {
  seasonId: string;
  currentSessions: number;
  targetSessions: number;
  percentComplete: number;
  lastUpdatedAt: number;
}

// ============================================================================
// PHASE 14.2: Rank Tier Types
// ============================================================================

export type RankTier =
  | 'BRONZE'      // Bottom 50%
  | 'SILVER'      // 50-75%
  | 'GOLD'        // 75-90%
  | 'PLATINUM'    // 90-95%
  | 'DIAMOND'     // 95-99%
  | 'LEGEND';     // Top 1%

export interface RankTierConfig {
  tier: RankTier;
  name: string;
  color: string;
  borderColor: string;
  glowColor?: string;
  minPercentile: number;
  maxPercentile: number;
  icon: string;
}

export interface UserRankInfo {
  tier: RankTier;
  percentile: number;
  weeklyFocusMinutes: number;
  rankPosition: number;
  totalParticipants: number;
  sessionsToNextTier: number | null;
}
