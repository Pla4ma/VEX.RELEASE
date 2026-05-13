/**
 * DailyLuckyBonus
 *
 * Appointment mechanic that creates daily urgency.
 * Once per calendar day, the first session triggers a "Lucky Bonus" with
 * enhanced variable reward chances.
 *
 * Psychology: "I haven't gotten my lucky bonus today"
 * Drives daily retention through FOMO and anticipation.
 */

import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import { MMKV } from 'react-native-mmkv';

// ============================================================================
// Storage Setup
// ============================================================================

const storage = new MMKV({
  id: 'lucky-bonus-storage',
});

const STORAGE_KEY = 'daily_lucky_bonus';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Configuration
// ============================================================================

const LUCKY_BONUS_CONFIG = {
  /** Chance of double tier (10%) */
  DOUBLE_TIER_CHANCE: 0.1,
  /** Chance of tier skip (5%) */
  TIER_SKIP_CHANCE: 0.05,
  /** Reward amount multiplier when lucky bonus hits */
  REWARD_MULTIPLIER: 2,
  /** Tier upgrade map for TIER_SKIP */
  TIER_UPGRADE: {
    COMMON: 'UNCOMMON',
    UNCOMMON: 'RARE',
    RARE: 'EPIC',
    EPIC: 'LEGENDARY',
    LEGENDARY: 'LEGENDARY', // Already max
  } as Record<string, string>,
} as const;

// ============================================================================
// Validation Schemas
// ============================================================================
// ============================================================================
// Date Helpers
// ============================================================================

/**
 * Get current date in user's timezone as YYYY-MM-DD string
 */
function getTodayDate(timezone: string = 'UTC'): string {
  const now = new Date();
  return now
    .toLocaleDateString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');
}

/**
 * Get time until next midnight in user's timezone
 */
function getTimeUntilMidnight(timezone: string = 'UTC'): { hours: number; minutes: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Adjust for timezone
  const timeZoneOffset = getTimezoneOffset(timezone);
  const midnightTime = tomorrow.getTime() - timeZoneOffset;
  const diffMs = midnightTime - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours: Math.max(0, hours), minutes: Math.max(0, minutes) };
}

/**
 * Get timezone offset in milliseconds
 */
function getTimezoneOffset(timezone: string): number {
  // Simplified - in production, use a proper timezone library
  // This is a rough approximation
  const now = new Date();
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return utcDate.getTime() - tzDate.getTime();
}

// ============================================================================
// Core Service
// ============================================================================
// Export singleton
// ============================================================================
// Convenience Functions
// ============================================================================
// ============================================================================
// React Hook (for use in components)
// ============================================================================
export * from "./DailyLuckyBonus.types";
export * from "./DailyLuckyBonus.part1";
export * from "./DailyLuckyBonus.part2";
