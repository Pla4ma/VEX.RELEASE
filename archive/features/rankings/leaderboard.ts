/**
 * Leaderboard Calculation Engine
 *
 * Efficient ranking algorithms with tie handling and percentile calculations.
 */

import { type LeaderboardEntry } from './schemas';

interface RankedEntry extends LeaderboardEntry {
  rawRank: number;
  denseRank: number;
  competitionRank: number;
}

/**
 * Calculate rankings using competition ranking (1224)
 * Tied players receive the same rank, and the next player receives a rank
 * that accounts for the tie
 */
export function calculateCompetitionRanking(
  entries: Array<{ userId: string; value: number; displayValue?: string; displayName?: string; avatarUrl?: string | null; level?: number; title?: string | null }>
): RankedEntry[] {
  // Sort by value descending
  const sorted = [...entries].sort((a, b) => b.value - a.value);

  const ranked: RankedEntry[] = [];
  let currentRank = 1;
  let previousValue: number | null = null;
  let ties = 0;

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];

    if (previousValue !== null && entry.value !== previousValue) {
      // New value, update rank to account for ties
      currentRank += ties;
      ties = 0;
    }

    if (previousValue !== null && entry.value === previousValue) {
      ties++;
    }

    ranked.push({
      userId: entry.userId,
      rank: currentRank,
      previousRank: null,
      value: entry.value,
      displayValue: entry.displayValue || entry.value.toString(),
      rankChange: 0,
      valueChange: 0,
      displayName: entry.displayName ?? entry.userId.slice(0, 8),
      avatarUrl: entry.avatarUrl ?? null,
      level: entry.level ?? 1,
      title: entry.title ?? null,
      rawRank: i + 1,
      denseRank: currentRank,
      competitionRank: currentRank,
    });

    previousValue = entry.value;
  }

  return ranked;
}

/**
 * Calculate percentile for a ranking position
 */
export function calculatePercentile(rank: number, totalEntries: number): number {
  if (totalEntries === 0) {return 0;}
  if (rank > totalEntries) {return 0;}

  // Percentile = (total - rank) / total * 100
  // Rank 1 out of 100 = 99th percentile
  return Math.round(((totalEntries - rank) / totalEntries) * 100);
}

/**
 * Calculate rank changes from previous period
 */
export function calculateRankChanges(
  currentEntries: LeaderboardEntry[],
  previousEntries: Map<string, LeaderboardEntry>
): LeaderboardEntry[] {
  return currentEntries.map(entry => {
    const previous = previousEntries.get(entry.userId);

    if (!previous) {
      // New entry
      return {
        ...entry,
        previousRank: null,
        rankChange: 0,
        valueChange: entry.value,
      };
    }

    return {
      ...entry,
      previousRank: previous.rank,
      rankChange: previous.rank - entry.rank, // Positive = moved up
      valueChange: entry.value - previous.value,
    };
  });
}

/**
 * Get entries near a specific user's rank
 */
export function getNearbyRanks(
  entries: LeaderboardEntry[],
  targetUserId: string,
  windowSize: number = 10
): {
  userEntry: LeaderboardEntry | null;
  above: LeaderboardEntry[];
  below: LeaderboardEntry[];
  hasMoreAbove: boolean;
  hasMoreBelow: boolean;
} {
  const userIndex = entries.findIndex(e => e.userId === targetUserId);

  if (userIndex === -1) {
    return {
      userEntry: null,
      above: entries.slice(0, windowSize),
      below: [],
      hasMoreAbove: entries.length > windowSize,
      hasMoreBelow: false,
    };
  }

  const halfWindow = Math.floor(windowSize / 2);
  const startIndex = Math.max(0, userIndex - halfWindow);
  const endIndex = Math.min(entries.length, userIndex + halfWindow + 1);

  return {
    userEntry: entries[userIndex],
    above: entries.slice(startIndex, userIndex),
    below: entries.slice(userIndex + 1, endIndex),
    hasMoreAbove: startIndex > 0,
    hasMoreBelow: endIndex < entries.length,
  };
}

/**
 * Calculate leaderboard statistics
 */
export function calculateLeaderboardStats(entries: LeaderboardEntry[]): {
  totalParticipants: number;
  averageValue: number;
  medianValue: number;
  topScore: number;
  scoreRange: number;
  standardDeviation: number;
  giniCoefficient: number;
} {
  if (entries.length === 0) {
    return {
      totalParticipants: 0,
      averageValue: 0,
      medianValue: 0,
      topScore: 0,
      scoreRange: 0,
      standardDeviation: 0,
      giniCoefficient: 0,
    };
  }

  const values = entries.map(e => e.value).sort((a, b) => a - b);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = sum / values.length;

  // Median
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid];

  // Standard deviation
  const squaredDiffs = values.map(v => Math.pow(v - average, 2));
  const variance = squaredDiffs.reduce((acc, v) => acc + v, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Gini coefficient (inequality measure)
  const gini = calculateGiniCoefficient(values);

  return {
    totalParticipants: entries.length,
    averageValue: Math.round(average * 100) / 100,
    medianValue: Math.round(median * 100) / 100,
    topScore: Math.max(...values),
    scoreRange: Math.max(...values) - Math.min(...values),
    standardDeviation: Math.round(stdDev * 100) / 100,
    giniCoefficient: Math.round(gini * 100) / 100,
  };
}

/**
 * Calculate Gini coefficient for measuring score inequality
 * 0 = perfect equality, 1 = maximum inequality
 */
function calculateGiniCoefficient(values: number[]): number {
  if (values.length === 0) {return 0;}

  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;

  if (mean === 0) {return 0;}

  let sumAbsoluteDifferences = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumAbsoluteDifferences += Math.abs(values[i] - values[j]);
    }
  }

  return sumAbsoluteDifferences / (2 * n * n * mean);
}

/**
 * Paginate leaderboard with efficient cursor-based pagination
 */
export function paginateLeaderboard<T extends LeaderboardEntry>(
  entries: T[],
  cursor?: { rank: number; userId: string },
  limit: number = 20,
  direction: 'forward' | 'backward' = 'forward'
): {
  entries: T[];
  nextCursor?: { rank: number; userId: string };
  previousCursor?: { rank: number; userId: string };
  hasMore: boolean;
} {
  let startIndex = 0;

  if (cursor) {
    const cursorIndex = entries.findIndex(
      e => e.userId === cursor.userId && e.rank === cursor.rank
    );
    if (cursorIndex !== -1) {
      startIndex = direction === 'forward' ? cursorIndex + 1 : Math.max(0, cursorIndex - limit);
    }
  }

  const endIndex = Math.min(entries.length, startIndex + limit);
  const pageEntries = entries.slice(startIndex, endIndex);

  const hasMore = endIndex < entries.length;

  return {
    entries: pageEntries,
    nextCursor: hasMore ? { rank: pageEntries[pageEntries.length - 1].rank, userId: pageEntries[pageEntries.length - 1].userId } : undefined,
    previousCursor: startIndex > 0 ? { rank: entries[startIndex].rank, userId: entries[startIndex].userId } : undefined,
    hasMore,
  };
}

/**
 * Detect suspicious score patterns (cheating detection)
 */
export function detectAnomalies(
  entries: LeaderboardEntry[],
  historicalData?: Map<string, number[]>
): Array<{
  userId: string;
  anomalyType: 'IMPROVEMENT_SPIKE' | 'IMPOSSIBLE_SCORE' | 'STATISTICAL_OUTLIER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
}> {
  const anomalies: ReturnType<typeof detectAnomalies> = [];

  if (entries.length < 10) {return anomalies;}

  const values = entries.map(e => e.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length
  );

  for (const entry of entries) {
    // Check for statistical outlier (3 sigma rule)
    const zScore = Math.abs((entry.value - avg) / stdDev);
    if (zScore > 3) {
      anomalies.push({
        userId: entry.userId,
        anomalyType: 'STATISTICAL_OUTLIER',
        severity: zScore > 4 ? 'HIGH' : 'MEDIUM',
        details: `Score ${entry.value} is ${zScore.toFixed(2)} standard deviations from mean`,
      });
    }

    // Check for improvement spikes using historical data
    if (historicalData) {
      const history = historicalData.get(entry.userId);
      if (history && history.length >= 3) {
        const recentAvg = history.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const previousAvg = history.slice(0, -3).reduce((a, b) => a + b, 0) / (history.length - 3);

        if (previousAvg > 0) {
          const improvement = (recentAvg - previousAvg) / previousAvg;
          if (improvement > 1.0) { // 100% improvement
            anomalies.push({
              userId: entry.userId,
              anomalyType: 'IMPROVEMENT_SPIKE',
              severity: improvement > 2.0 ? 'HIGH' : 'MEDIUM',
              details: `${(improvement * 100).toFixed(0)}% improvement over recent history`,
            });
          }
        }
      }
    }
  }

  return anomalies;
}

/**
 * Calculate season rewards based on final rankings
 */
export function calculateSeasonRewards(
  finalRank: number,
  totalParticipants: number,
  finalTier: string,
  improvement: number
): Array<{
  type: 'CURRENCY' | 'ITEM' | 'TITLE' | 'BOOST';
  amount: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  claimableAt: number;
}> {
  const rewards: ReturnType<typeof calculateSeasonRewards> = [];
  const percentile = calculatePercentile(finalRank, totalParticipants);

  // Base participation reward
  rewards.push({
    type: 'CURRENCY',
    amount: 100,
    rarity: 'COMMON',
    claimableAt: Date.now(),
  });

  // Rank-based rewards
  if (percentile >= 99) {
    rewards.push({ type: 'TITLE', amount: 1, rarity: 'LEGENDARY', claimableAt: Date.now() });
    rewards.push({ type: 'CURRENCY', amount: 10000, rarity: 'LEGENDARY', claimableAt: Date.now() });
    rewards.push({ type: 'ITEM', amount: 3, rarity: 'LEGENDARY', claimableAt: Date.now() });
  } else if (percentile >= 95) {
    rewards.push({ type: 'TITLE', amount: 1, rarity: 'EPIC', claimableAt: Date.now() });
    rewards.push({ type: 'CURRENCY', amount: 5000, rarity: 'EPIC', claimableAt: Date.now() });
    rewards.push({ type: 'ITEM', amount: 2, rarity: 'EPIC', claimableAt: Date.now() });
  } else if (percentile >= 90) {
    rewards.push({ type: 'CURRENCY', amount: 2500, rarity: 'RARE', claimableAt: Date.now() });
    rewards.push({ type: 'ITEM', amount: 1, rarity: 'RARE', claimableAt: Date.now() });
  } else if (percentile >= 75) {
    rewards.push({ type: 'CURRENCY', amount: 1000, rarity: 'RARE', claimableAt: Date.now() });
  } else if (percentile >= 50) {
    rewards.push({ type: 'CURRENCY', amount: 500, rarity: 'COMMON', claimableAt: Date.now() });
  }

  // Tier bonus
  const tierBonus: Record<string, number> = {
    'Bronze': 100,
    'Silver': 250,
    'Gold': 500,
    'Platinum': 1000,
    'Diamond': 2000,
    'Master': 5000,
    'Grandmaster': 7500,
    'Legend': 10000,
  };

  if (tierBonus[finalTier]) {
    rewards.push({
      type: 'CURRENCY',
      amount: tierBonus[finalTier],
      rarity: ['Bronze', 'Silver'].includes(finalTier) ? 'COMMON' : 'RARE',
      claimableAt: Date.now(),
    });
  }

  // Improvement bonus
  if (improvement > 0) {
    rewards.push({
      type: 'BOOST',
      amount: Math.min(72, improvement * 24), // Hours of boost
      rarity: improvement > 50 ? 'EPIC' : improvement > 20 ? 'RARE' : 'COMMON',
      claimableAt: Date.now(),
    });
  }

  return rewards;
}
