/**
 * Rankings Service
 *
 * Business logic for rankings and leaderboards.
 */

import * as repository from './repository';
import {
  GetLeaderboardInputSchema,
  GetUserRankInputSchema,
  RankTierNameSchema,
  type Leaderboard,
  type LeaderboardEntry,
  type RankTier,
  type UserRanking,
  type SeasonSummary,
  type GetLeaderboardInput,
  type GetUserRankInput,
  type RankingError,
} from './schemas';

function createError(code: RankingError['code'], message: string, context: Record<string, unknown> = {}): Error {
  return Object.assign(new Error(message), { code, context });
}

// Leaderboard Operations
export async function getLeaderboard(input: GetLeaderboardInput): Promise<Leaderboard> {
  const validated = GetLeaderboardInputSchema.parse(input);

  const leaderboard = await repository.fetchLeaderboard(
    validated.type,
    validated.scope,
    validated.period,
    { squadId: validated.squadId, guildId: validated.guildId, limit: validated.limit }
  );

  // Fetch enriched entries
  const entries = await repository.fetchLeaderboardEntries(leaderboard.id, {
    nearUserId: validated.nearUserId,
    limit: validated.limit,
  });

  return { ...leaderboard, entries };
}

export async function getUserRank(input: GetUserRankInput): Promise<LeaderboardEntry | null> {
  const validated = GetUserRankInputSchema.parse(input);
  return repository.fetchUserRank(validated.userId, validated.type, validated.scope, 'WEEKLY');
}

export async function getGlobalRank(userId: string): Promise<number | null> {
  const entry = await repository.fetchUserRank(userId, 'XP', 'GLOBAL', 'ALL_TIME');
  return entry?.rank || null;
}

export async function getNearbyRanks(userId: string, type: string, scope: string): Promise<LeaderboardEntry[]> {
  const validated = GetUserRankInputSchema.parse({ userId, type, scope });
  const leaderboard = await repository.fetchLeaderboard(validated.type, validated.scope, 'WEEKLY');
  return repository.fetchLeaderboardEntries(leaderboard.id, { nearUserId: userId, limit: 21 });
}

// Rank Tier Operations
export async function getRankTiers(): Promise<RankTier[]> {
  return repository.fetchRankTiers();
}

export async function getUserTier(userId: string): Promise<RankTier | null> {
  const ranking = await repository.fetchUserRanking(userId);
  if (!ranking) {return null;}

  // Find tier for global rank
  const globalEntry = await repository.fetchUserRank(userId, 'XP', 'GLOBAL', 'ALL_TIME');
  if (!globalEntry) {return null;}

  // Calculate tier based on percentile
  const percentile = (globalEntry.rank / globalEntry.value) * 100;
  const tiers = await repository.fetchRankTiers();

  // Return appropriate tier
  if (percentile <= 1) {return tiers.find(t => t.name === 'Legend') || null;}
  if (percentile <= 5) {return tiers.find(t => t.name === 'Grandmaster') || null;}
  if (percentile <= 10) {return tiers.find(t => t.name === 'Master') || null;}
  if (percentile <= 20) {return tiers.find(t => t.name === 'Diamond') || null;}
  if (percentile <= 35) {return tiers.find(t => t.name === 'Platinum') || null;}
  if (percentile <= 50) {return tiers.find(t => t.name === 'Gold') || null;}
  if (percentile <= 70) {return tiers.find(t => t.name === 'Silver') || null;}
  return tiers.find(t => t.name === 'Bronze') || null;
}

// User Ranking Operations
export async function getUserRanking(userId: string): Promise<UserRanking | null> {
  return repository.fetchUserRanking(userId);
}

export async function updateUserRanking(userId: string): Promise<void> {
  // Fetch all category rankings
  const categories = ['XP', 'FOCUS_TIME', 'SESSION_COUNT', 'STREAK_LENGTH', 'DUEL_RATING'] as const;
  const rankings = [];

  for (const category of categories) {
    const entry = await repository.fetchUserRank(userId, category, 'GLOBAL', 'WEEKLY');
    if (entry) {
      const trend: 'UP' | 'DOWN' | 'STABLE' = entry.rankChange > 0 ? 'UP' : entry.rankChange < 0 ? 'DOWN' : 'STABLE';
      rankings.push({
        category,
        rank: entry.rank,
        totalInCategory: entry.rank,
        percentile: 0,
        value: entry.value,
        trend,
      });
    }
  }

  const globalEntry = await repository.fetchUserRank(userId, 'XP', 'GLOBAL', 'ALL_TIME');

  await repository.updateUserRanking(userId, {
    globalRank: globalEntry?.rank || null,
    rankings,
    bestGlobalRank: globalEntry?.rank || 999999,
    bestCategoryRank: rankings.sort((a, b) => a.rank - b.rank)[0] || null,
    updatedAt: Date.now(),
  });
}

// Season Operations
export async function getCurrentSeasonSummary(userId: string): Promise<SeasonSummary | null> {
  return repository.fetchSeasonSummary(userId);
}

export async function getSeasonHistory(userId: string, limit?: number): Promise<SeasonSummary[]> {
  return repository.fetchSeasonHistory(userId, limit);
}

export async function generateSeasonSummary(userId: string, seasonId: string): Promise<SeasonSummary> {
  // Fetch user's season data
  const seasonData = await repository.fetchUserSeasonData(userId, seasonId);

  // Calculate rewards
  const rewards = calculateSeasonRewards(seasonData);

  const summary: SeasonSummary = {
    userId,
    seasonId,
    seasonName: seasonData.name,
    finalRank: seasonData.rank,
    finalTier: RankTierNameSchema.parse(seasonData.tier),
    totalParticipants: seasonData.totalParticipants,
    percentile: (seasonData.rank / seasonData.totalParticipants) * 100,
    xpGained: seasonData.xpGained,
    sessionsCompleted: seasonData.sessionsCompleted,
    totalFocusTime: seasonData.totalFocusTime,
    streakHigh: seasonData.streakHigh,
    duelsWon: seasonData.duelsWon,
    duelsPlayed: seasonData.duelsPlayed,
    rewardsEarned: rewards,
    totalRewardValue: rewards.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0),
    rankImprovement: null, // Compare with previous season
    tierImprovement: null,
    generatedAt: Date.now(),
    shareCardUrl: null, // Generate on demand
  };

  return summary;
}

// Leaderboard Update Operations
export async function updateLeaderboardEntry(
  leaderboardId: string,
  userId: string,
  value: number,
  displayValue: string
): Promise<void> {
  await repository.updateLeaderboardEntry(leaderboardId, userId, value, displayValue);
}

function calculateSeasonRewards(seasonData: {
  rank: number;
  tier: string;
  totalParticipants: number;
}): Array<{ type: 'RANK' | 'TIER' | 'MILESTONE' | 'PARTICIPATION'; name: string; value: string | number; claimed: boolean; claimedAt: number | null }> {
  const rewards: Array<{ type: 'RANK' | 'TIER' | 'MILESTONE' | 'PARTICIPATION'; name: string; value: string | number; claimed: boolean; claimedAt: number | null }> = [];

  // Rank reward
  if (seasonData.rank <= 10) {
    rewards.push({ type: 'RANK', name: 'Top 10 Finisher', value: 1000, claimed: false, claimedAt: null });
  } else if (seasonData.rank <= 100) {
    rewards.push({ type: 'RANK', name: 'Top 100 Finisher', value: 500, claimed: false, claimedAt: null });
  }

  // Tier reward
  rewards.push({ type: 'TIER', name: `${seasonData.tier} Tier`, value: seasonData.tier, claimed: false, claimedAt: null });

  // Participation reward
  rewards.push({ type: 'PARTICIPATION', name: 'Season Participant', value: 100, claimed: false, claimedAt: null });

  return rewards;
}
