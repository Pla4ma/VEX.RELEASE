/**
 * Seasons Utility Functions
 *
 * Pure functions for season calculations
 */

import type { Season } from './schemas';
import type { SeasonPhase } from './types';

// ============================================================================
// Phase Calculations
// ============================================================================

/**
 * Calculate current season phase
 */
export function calculateSeasonPhase(season: Season): SeasonPhase {
  const now = Date.now();
  const startAt = season.startAt;
  const endAt = season.endAt;
  const archivedAt = season.archivedAt;

  // Archived takes precedence
  if (archivedAt || now > endAt + 3 * 24 * 60 * 60 * 1000) {
    return 'ARCHIVED';
  }

  // Ended (grace period)
  if (now > endAt) {
    return 'ENDED';
  }

  // Almost ending (< 7 days)
  const daysRemaining = Math.floor((endAt - now) / (24 * 60 * 60 * 1000));
  if (daysRemaining <= 7) {
    return 'ALMOST_ENDING';
  }

  // Active
  if (now >= startAt && now <= endAt) {
    return 'ACTIVE';
  }

  // Preseason
  if (now < startAt) {
    return 'PRESEASON';
  }

  return 'ENDED';
}

/**
 * Calculate days remaining in season
 */
export function calculateDaysRemaining(season: Season): number {
  const now = Date.now();
  const endAt = season.endAt;

  if (now > endAt) {
    // Grace period countdown (3 days after end)
    const graceEnd = endAt + 3 * 24 * 60 * 60 * 1000;
    const remaining = Math.ceil((graceEnd - now) / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  }

  return Math.ceil((endAt - now) / (24 * 60 * 60 * 1000));
}

/**
 * Calculate total season days
 */
export function calculateTotalDays(season: Season): number {
  return Math.ceil((season.endAt - season.startAt) / (24 * 60 * 60 * 1000));
}

/**
 * Check if almost ending notification should trigger
 * (Only once when crossing the 7-day threshold)
 */
export function shouldTriggerAlmostEnding(season: Season): boolean {
  const now = Date.now();
  const endAt = season.endAt;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // Check if we're within 7 days of end
  const withinSevenDays = now > endAt - sevenDaysMs && now < endAt;

  if (!withinSevenDays) {return false;}

  // Check if we crossed the threshold recently (within last hour)
  // This prevents duplicate triggers
  const thresholdCrossed = endAt - sevenDaysMs;
  const hourAgo = now - 60 * 60 * 1000;

  return thresholdCrossed >= hourAgo && thresholdCrossed <= now;
}

// ============================================================================
// Progress Calculations
// ============================================================================

/**
 * Calculate tier progress percentage
 */
export function calculateTierProgress(
  currentXp: number,
  xpPerTier: number
): number {
  return Math.min(100, Math.floor((currentXp / xpPerTier) * 100));
}

/**
 * Calculate total season progress
 */
export function calculateTotalProgress(
  currentTier: number,
  tierXp: number,
  tierCount: number,
  xpPerTier: number
): number {
  const totalXpEarned = currentTier * xpPerTier + tierXp;
  const totalXpRequired = tierCount * xpPerTier;
  return Math.min(100, Math.floor((totalXpEarned / totalXpRequired) * 100));
}

/**
 * Calculate XP needed to reach next tier
 */
export function calculateXpToNextTier(
  currentTierXp: number,
  xpPerTier: number
): number {
  return Math.max(0, xpPerTier - currentTierXp);
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format season dates for display
 */
export function formatSeasonDates(season: Season): {
  startDate: string;
  endDate: string;
  durationText: string;
} {
  const startDate = new Date(season.startAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const endDate = new Date(season.endAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const totalDays = calculateTotalDays(season);
  const durationText = `${totalDays} days`;

  return {
    startDate,
    endDate,
    durationText,
  };
}

/**
 * Format countdown for display
 */
export function formatCountdown(daysRemaining: number): string {
  if (daysRemaining <= 0) {
    return 'Ending soon';
  }

  if (daysRemaining === 1) {
    return '1 day left';
  }

  if (daysRemaining <= 7) {
    return `${daysRemaining} days left`;
  }

  const weeks = Math.floor(daysRemaining / 7);
  if (weeks === 1) {
    return '1 week left';
  }

  return `${weeks} weeks left`;
}
