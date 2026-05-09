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

export const DailyLoginStateSchema = z.object({
  currentStreak: z.number().int().min(0),
  lastLoginDate: z.number().nullable(),
  currentDayInWeek: z.number().int().min(1).max(7),
  weeksCompleted: z.number().int().min(0),
  totalLogins: z.number().int().min(0),
  consistentBadgeUnlocked: z.boolean(),
});

export type DailyLoginState = z.infer<typeof DailyLoginStateSchema>;

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
 * Process daily login
 * Returns updated state and reward info
 */
export function processDailyLogin(
  currentState: DailyLoginState,
  today: number = getTodayTimestamp(),
): {
  state: DailyLoginState;
  reward: {
    day: number;
    type: 'coins' | 'gems' | 'boost' | 'chest';
    amount: number;
    weekCompleted: boolean;
    weekBonus?: { coins: number; gems: number; badge: string };
  };
  isNewDay: boolean;
} {
  const lastLogin = currentState.lastLoginDate;

  // Already logged in today
  if (lastLogin === today) {
    return {
      state: currentState,
      reward: {
        day: currentState.currentDayInWeek,
        type: getRewardForDay(currentState.currentDayInWeek).type,
        amount: getRewardForDay(currentState.currentDayInWeek).amount,
        weekCompleted: false,
      },
      isNewDay: false,
    };
  }

  // Check streak continuity
  const isConsecutive = lastLogin ? areConsecutiveDays(lastLogin, today) : false;
  const isNewWeek = currentState.currentDayInWeek >= WEEK_LENGTH;

  // Calculate new streak
  const newStreak = isConsecutive ? currentState.currentStreak + 1 : 1;

  // Calculate new day in week (1-7)
  const newDayInWeek = isNewWeek ? 1 : currentState.currentDayInWeek + 1;

  // Check if week completed (day 7 and consecutive)
  const weekCompleted = newDayInWeek === 1 && isConsecutive && currentState.currentDayInWeek === 7;

  // Build new state
  const newState: DailyLoginState = {
    currentStreak: newStreak,
    lastLoginDate: today,
    currentDayInWeek: newDayInWeek,
    weeksCompleted: weekCompleted ? currentState.weeksCompleted + 1 : currentState.weeksCompleted,
    totalLogins: currentState.totalLogins + 1,
    consistentBadgeUnlocked: currentState.consistentBadgeUnlocked || (weekCompleted && currentState.weeksCompleted + 1 >= 1),
  };

  // Get today's reward
  const todayReward = getRewardForDay(newDayInWeek);

  return {
    state: newState,
    reward: {
      day: newDayInWeek,
      type: todayReward.type,
      amount: todayReward.amount,
      weekCompleted,
      weekBonus: weekCompleted ? WEEK_COMPLETION_BONUS : undefined,
    },
    isNewDay: true,
  };
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

/**
 * Get streak status message
 */
export function getLoginStreakMessage(streakDays: number): {
  title: string;
  subtitle: string;
  emoji: string;
} {
  if (streakDays === 0) {
    return {
      title: 'Start Your Streak',
      subtitle: 'Log in 7 days in a row for bonus rewards!',
      emoji: '📅',
    };
  }

  if (streakDays < 7) {
    return {
      title: `${streakDays}-Day Streak`,
      subtitle: `${7 - streakDays} more days for the weekly bonus!`,
      emoji: '🔥',
    };
  }

  if (streakDays === 7) {
    return {
      title: 'Week Complete! 🎉',
      subtitle: 'You earned the Consistent badge!',
      emoji: '🏆',
    };
  }

  return {
    title: `${streakDays}-Day Legend`,
    subtitle: 'Unstoppable daily login streak!',
    emoji: '👑',
  };
}

/**
 * Check if user should see daily login modal
 */
export function shouldShowDailyLogin(state: DailyLoginState, today: number = getTodayTimestamp()): boolean {
  // Don't show if already logged in today
  if (state.lastLoginDate === today) {
    return false;
  }

  // Show for new day
  return true;
}

/**
 * Initialize default daily login state
 */
export function createInitialLoginState(): DailyLoginState {
  return {
    currentStreak: 0,
    lastLoginDate: null,
    currentDayInWeek: 1,
    weeksCompleted: 0,
    totalLogins: 0,
    consistentBadgeUnlocked: false,
  };
}

// ============================================================================
// Persistence
// ============================================================================

const STORAGE_KEY = 'daily_login_state';
const storage = new MMKVStorageAdapter('daily-login');

export function loadDailyLoginState(): DailyLoginState {
  const raw = storage.getItemSync(STORAGE_KEY);
  if (!raw) {
    return createInitialLoginState();
  }

  const parsed = DailyLoginStateSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : createInitialLoginState();
}

export function saveDailyLoginState(state: DailyLoginState): void {
  const validated = DailyLoginStateSchema.parse(state);
  storage.setItemSync(STORAGE_KEY, JSON.stringify(validated));
}
