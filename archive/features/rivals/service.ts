/**
 * Rivals Service
 *
 * Business logic for rival matching, scoring, and weekly management.
 * @phase 4A
 */

import type {
  RivalProfile,
  RivalMatchCriteria,
  RivalMatchResult,
  CurrentRival,
  RivalHistoryEntry,
} from './schemas';
import { useRivalsStore } from './store';

// ============================================================================
// Rival Matching Algorithm
// ============================================================================

/**
 * Calculate match score between two users
 * Returns 0-1 where 1 is perfect match
 */
function calculateMatchScore(
  myStats: RivalMatchCriteria,
  candidate: RivalProfile
): number {
  // Level similarity (±3 tolerance)
  const levelDiff = Math.abs(myStats.myLevel - candidate.level);
  const levelScore = Math.max(0, 1 - levelDiff / myStats.levelTolerance);

  // Sessions per week similarity (±2 tolerance)
  const sessionDiff = Math.abs(
    myStats.mySessionsPerWeek - candidate.sessionsPerWeek
  );
  const sessionScore = Math.max(0, 1 - sessionDiff / myStats.sessionTolerance);

  // Average session duration similarity (±10 min tolerance)
  const durationDiff = Math.abs(
    myStats.myAvgSessionDuration - candidate.avgSessionDuration
  );
  const durationScore = Math.max(
    0,
    1 - durationDiff / myStats.durationTolerance
  );

  // Weighted average
  return levelScore * 0.4 + sessionScore * 0.35 + durationScore * 0.25;
}

/**
 * Find best rival match from candidate pool
 */
export function findBestRivalMatch(
  myStats: RivalMatchCriteria,
  candidates: RivalProfile[]
): RivalMatchResult | null {
  if (candidates.length === 0) {return null;}

  const scored = candidates.map((candidate) => ({
    userId: candidate.userId,
    name: candidate.name,
    level: candidate.level,
    sessionsPerWeek: candidate.sessionsPerWeek,
    avgSessionDuration: candidate.avgSessionDuration,
    matchScore: calculateMatchScore(myStats, candidate),
  }));

  // Sort by match score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Return best match if score is good enough (>0.5)
  const best = scored[0];
  return best.matchScore > 0.5 ? best : null;
}

/**
 * Auto-match criteria
 */
export function createMatchCriteria(
  myLevel: number,
  mySessionsPerWeek: number,
  myAvgSessionDuration: number
): RivalMatchCriteria {
  return {
    myLevel,
    mySessionsPerWeek,
    myAvgSessionDuration,
    levelTolerance: 3,
    sessionTolerance: 2,
    durationTolerance: 10,
  };
}

// ============================================================================
// Weekly Score Management
// ============================================================================

/**
 * Get week start timestamp (Monday 00:00)
 */
export function getWeekStart(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Days to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

/**
 * Get days remaining in week (until Sunday)
 */
export function getDaysRemainingInWeek(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

/**
 * Check if week has reset (new Monday)
 */
export function hasWeekReset(lastWeekStart: number): boolean {
  const currentWeekStart = getWeekStart();
  return currentWeekStart > lastWeekStart;
}

/**
 * Format focus minutes as readable string
 */
export function formatFocusMinutes(minutes: number): string {
  if (minutes < 60) {return `${minutes} min`;}
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

// ============================================================================
// Rival Status Helpers
// ============================================================================

/**
 * Get rivalry status message
 */
export function getRivalStatusMessage(
  myScore: number,
  theirScore: number,
  rivalName: string
): { message: string; emoji: string; tone: 'positive' | 'neutral' | 'urgent' } {
  const diff = myScore - theirScore;

  if (diff > 0) {
    return {
      message: `You're ahead by ${formatFocusMinutes(diff)} 🔥`,
      emoji: '🔥',
      tone: 'positive',
    };
  } else if (diff < 0) {
    return {
      message: `${formatFocusMinutes(Math.abs(diff))} behind ${rivalName}. Start a session!`,
      emoji: '⚡',
      tone: 'urgent',
    };
  } else {
    return {
      message: "You're tied! One session could decide it.",
      emoji: '⚖️',
      tone: 'neutral',
    };
  }
}

/**
 * Determine weekly result
 */
export function determineWeeklyResult(
  myScore: number,
  theirScore: number
): 'WIN' | 'LOSS' | 'DRAW' {
  if (myScore > theirScore) {return 'WIN';}
  if (myScore < theirScore) {return 'LOSS';}
  return 'DRAW';
}

// ============================================================================
// Store Actions
// ============================================================================

/**
 * Set current rival
 */
export function setCurrentRival(rival: CurrentRival | null): void {
  useRivalsStore.getState().setCurrentRival(rival);
}

/**
 * Update weekly scores
 */
export function updateWeeklyScores(mine: number, theirs: number): void {
  useRivalsStore.getState().updateWeeklyScore(mine, theirs);
}

/**
 * Add history entry
 */
export function addRivalHistory(entry: RivalHistoryEntry): void {
  useRivalsStore.getState().addHistoryEntry(entry);
}

/**
 * Clear current rival (end of week)
 */
export function clearCurrentRival(): void {
  useRivalsStore.getState().clearRival();
}

// ============================================================================
// Notification Messages
// ============================================================================

/**
 * Get notification when rival pulls ahead
 */
export function getRivalAheadNotification(
  rivalName: string,
  theirNewSessionMinutes: number,
  currentDiff: number
): { title: string; body: string } {
  const diffText =
    currentDiff === 0
      ? "You're tied now!"
      : currentDiff > 0
      ? `You're still ahead by ${formatFocusMinutes(currentDiff)}`
      : `${rivalName} is ahead by ${formatFocusMinutes(Math.abs(currentDiff))}`;

  return {
    title: `${rivalName} just focused for ${theirNewSessionMinutes} min`,
    body: `${diffText} — start a session to stay in the lead!`,
  };
}
