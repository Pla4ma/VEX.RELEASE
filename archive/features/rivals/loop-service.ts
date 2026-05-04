/**
 * Rival Loop Service
 *
 * Manages rival discovery, matching, and competition loops.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('rivals:loop');

// Rival match status
export type RivalMatchStatus = 'active' | 'ended' | 'pending' | 'declined';

// Rival match schema
export const RivalMatchSchema = z.object({
  id: z.string(),
  userId: z.string(),
  rivalId: z.string(),
  status: z.enum(['active', 'ended', 'pending', 'declined']),
  startedAt: z.number(),
  endedAt: z.number().nullable(),
  userScore: z.number(),
  rivalScore: z.number(),
  winStreak: z.number(),
  lossStreak: z.number(),
  lastSessionAt: z.number().nullable(),
  comparisonMetric: z.enum(['xp', 'sessions', 'focus_time', 'streak']),
});

export type RivalMatch = z.infer<typeof RivalMatchSchema>;

// Potential rival for discovery
export interface PotentialRival {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  similarityScore: number;
  stats: {
    xp: number;
    sessions: number;
    focusTime: number;
    streak: number;
  };
  reason: 'similar_skill' | 'close_stats' | 'recent_activity' | 'shared_goals';
}

// Generate potential rivals for user
export async function discoverPotentialRivals(
  userId: string,
  options: { limit?: number } = {}
): Promise<PotentialRival[]> {
  const limit = options.limit ?? 5;

  // In production, this would query for:
  // - Users with similar XP/level
  // - Users with similar session counts
  // - Users active in same time windows
  // - Users with similar focus patterns

  const rivals: PotentialRival[] = [
    {
      userId: 'rival-1',
      displayName: 'Taylor M.',
      similarityScore: 0.87,
      stats: { xp: 1250, sessions: 42, focusTime: 840, streak: 5 },
      reason: 'similar_skill',
    },
    {
      userId: 'rival-2',
      displayName: 'Jamie K.',
      similarityScore: 0.82,
      stats: { xp: 1180, sessions: 38, focusTime: 760, streak: 8 },
      reason: 'close_stats',
    },
    {
      userId: 'rival-3',
      displayName: 'Casey R.',
      similarityScore: 0.79,
      stats: { xp: 1320, sessions: 45, focusTime: 900, streak: 3 },
      reason: 'recent_activity',
    },
  ];

  debug.info('Discovered %d potential rivals for user %s', rivals.length, userId);
  return rivals.slice(0, limit);
}

// Calculate similarity score between two users
export function calculateSimilarityScore(
  userStats: { xp: number; sessions: number; focusTime: number },
  otherStats: { xp: number; sessions: number; focusTime: number }
): number {
  const xpDiff = Math.abs(userStats.xp - otherStats.xp);
  const sessionsDiff = Math.abs(userStats.sessions - otherStats.sessions);
  const timeDiff = Math.abs(userStats.focusTime - otherStats.focusTime);

  // Normalize differences (lower is better match)
  const xpScore = Math.max(0, 1 - xpDiff / 2000);
  const sessionsScore = Math.max(0, 1 - sessionsDiff / 100);
  const timeScore = Math.max(0, 1 - timeDiff / 2000);

  return Math.round(((xpScore + sessionsScore + timeScore) / 3) * 100) / 100;
}

// Create rival match
export async function createRivalMatch(
  userId: string,
  rivalId: string,
  comparisonMetric: RivalMatch['comparisonMetric'] = 'xp'
): Promise<RivalMatch> {
  const now = Date.now();

  const match: RivalMatch = {
    id: `match-${userId}-${rivalId}-${now}`,
    userId,
    rivalId,
    status: 'active',
    startedAt: now,
    endedAt: null,
    userScore: 0,
    rivalScore: 0,
    winStreak: 0,
    lossStreak: 0,
    lastSessionAt: null,
    comparisonMetric,
  };

  debug.info('Created rival match: %s between %s and %s', match.id, userId, rivalId);
  return match;
}

// Update rival scores after session
export function updateRivalScores(
  match: RivalMatch,
  userSessionValue: number,
  rivalSessionValue: number
): RivalMatch {
  const updated: RivalMatch = {
    ...match,
    userScore: match.userScore + userSessionValue,
    rivalScore: match.rivalScore + rivalSessionValue,
    lastSessionAt: Date.now(),
  };

  // Update streaks
  if (userSessionValue > rivalSessionValue) {
    updated.winStreak = match.winStreak + 1;
    updated.lossStreak = 0;
  } else if (rivalSessionValue > userSessionValue) {
    updated.lossStreak = match.lossStreak + 1;
    updated.winStreak = 0;
  }

  debug.info(
    'Updated rival scores: user=%d rival=%d (match: %s)',
    updated.userScore,
    updated.rivalScore,
    match.id
  );

  return updated;
}

// Get rival match status message
export function getRivalStatusMessage(match: RivalMatch): string {
  const diff = match.userScore - match.rivalScore;

  if (diff > 100) {
    return `You are ahead by ${diff} ${match.comparisonMetric}. Keep pushing!`;
  }
  if (diff < -100) {
    return `Trailing by ${Math.abs(diff)} ${match.comparisonMetric}. Time to focus!`;
  }
  if (match.winStreak >= 3) {
    return `${match.winStreak} wins in a row! You are on fire!`;
  }
  if (match.lossStreak >= 3) {
    return `Down ${match.lossStreak} in a row. Do not give up!`;
  }
  return 'Neck and neck! Every session counts.';
}

// Determine if user should get new rival suggestion
export function shouldSuggestNewRival(
  currentMatches: RivalMatch[],
  lastSuggestionAt: number
): boolean {
  // Don't suggest if recently suggested
  if (Date.now() - lastSuggestionAt < 24 * 60 * 60 * 1000) {
    return false;
  }

  // Don't suggest if already has 3+ active rivals
  const activeMatches = currentMatches.filter((m) => m.status === 'active');
  if (activeMatches.length >= 3) {
    return false;
  }

  return true;
}

// End rival match
export async function endRivalMatch(
  _matchId: string,
  winnerId?: string
): Promise<RivalMatch | null> {
  debug.info('Ending rival match: %s, winner: %s', _matchId, winnerId ?? 'none');

  // In production, update database
  // const match = await db.rivalMatches.update(...)

  return null;
}

// Get rival leaderboard
export async function getRivalLeaderboard(
  _matchId: string
): Promise<{
  userRank: number;
  rivalRank: number;
  percentile: number;
}> {
  // In production, calculate actual rankings
  return {
    userRank: 1,
    rivalRank: 2,
    percentile: 75,
  };
}
