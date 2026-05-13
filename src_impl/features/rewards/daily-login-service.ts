/**
 * Daily Login Service
 *
 * Tracks consecutive daily login streak separately from session streak.
 * 7-day rotating rewards with bonus for completing the week.
 *
 * @phase 5C.2
 */

import { z } from 'zod';
import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';

// ============================================================================
// Schemas
// ============================================================================
// ============================================================================
// Constants
// ============================================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEK_LENGTH = 7;

// Bonus for completing 7 consecutive days
const WEEK_COMPLETION_BONUS = {
  coins: 200,
  gems: 20,
  badge: 'Consistent',
};

// ============================================================================
// State Management
// ============================================================================

/**
 * Get today's timestamp at midnight
 */
function getTodayTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/**
 * Get yesterday's timestamp at midnight
 */
function getYesterdayTimestamp(): number {
  return getTodayTimestamp() - MS_PER_DAY;
}

/**
 * Check if dates are consecutive
 */
function areConsecutiveDays(prevDate: number, currDate: number): boolean {
  return currDate - prevDate === MS_PER_DAY;
}

/**
 * Get reward for specific day
 */
function getRewardForDay(day: number): {
  type: 'coins' | 'gems' | 'boost' | 'chest';
  amount: number;
} {
  const rewards: Record<number, { type: 'coins' | 'gems' | 'boost' | 'chest'; amount: number }> = {
    1: { type: 'coins', amount: 50 },
    2: { type: 'coins', amount: 75 },
    3: { type: 'gems', amount: 5 },
    4: { type: 'coins', amount: 100 },
    5: { type: 'boost', amount: 1 },
    6: { type: 'gems', amount: 10 },
    7: { type: 'chest', amount: 1 },
  };

  return rewards[day] || { type: 'coins', amount: 50 };
}

// ============================================================================
// Persistence
// ============================================================================

const STORAGE_KEY = 'daily_login_state';
const storage = new MMKVStorageAdapter('daily-login');
export * from "./daily-login-service.types";
export * from "./daily-login-service.part1";
