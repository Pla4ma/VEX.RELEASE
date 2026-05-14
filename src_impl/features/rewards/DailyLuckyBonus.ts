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

export interface LuckyBonusStatus {
  /** Whether lucky bonus is available today */
  available: boolean;
  /** Whether lucky bonus was already used today */
  used: boolean;
  /** Date string (YYYY-MM-DD) when last used */
  lastUsedDate: string | null;
  /** Hours until next reset */
  hoursUntilReset: number;
  /** Minutes until next reset */
  minutesUntilReset: number;
}

export interface LuckyBonusResult {
  /** Whether lucky bonus was triggered this session */
  triggered: boolean;
  /** Type of bonus that occurred */
  type: 'double_tier' | 'tier_skip' | 'none';
  /** Original tier before bonus */
  originalTier: string;
  /** Final tier after bonus */
  finalTier: string;
  /** Multiplier applied to rewards */
  rewardMultiplier: number;
}

export enum LuckyBonusType {
  NONE = 'NONE',
  DOUBLE_TIER = 'DOUBLE_TIER', // 10% chance - double variable reward tier
  TIER_SKIP = 'TIER_SKIP', // 5% chance - skip one tier up
}

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

export const LuckyBonusStatusSchema = z.object({
  available: z.boolean(),
  used: z.boolean(),
  lastUsedDate: z.string().nullable(),
  hoursUntilReset: z.number().int().min(0).max(24),
  minutesUntilReset: z.number().int().min(0).max(59),
});

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

export class DailyLuckyBonusService {
  private userTimezone: string = 'UTC';

  /**
   * Set user's timezone for accurate daily reset
   */
  setTimezone(timezone: string): void {
    this.userTimezone = timezone;
  }

  /**
   * Get current lucky bonus status
   */
  getStatus(userId: string): LuckyBonusStatus {
    try {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      const stored = storage.getString(storageKey);
      const today = getTodayDate(this.userTimezone);
      const timeUntil = getTimeUntilMidnight(this.userTimezone);

      if (!stored) {
        // First time user - bonus available
        return {
          available: true,
          used: false,
          lastUsedDate: null,
          hoursUntilReset: timeUntil.hours,
          minutesUntilReset: timeUntil.minutes,
        };
      }

      const data = JSON.parse(stored);
      const lastUsed = data.lastUsedDate;
      const used = data.usedToday || false;

      // Check if bonus was used today
      if (used && lastUsed === today) {
        return {
          available: false,
          used: true,
          lastUsedDate: lastUsed,
          hoursUntilReset: timeUntil.hours,
          minutesUntilReset: timeUntil.minutes,
        };
      }

      // Bonus available (new day or never used)
      return {
        available: true,
        used: false,
        lastUsedDate: lastUsed,
        hoursUntilReset: timeUntil.hours,
        minutesUntilReset: timeUntil.minutes,
      };
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'lucky-bonus', operation: 'getStatus' },
      });

      // Graceful fallback - assume available
      return {
        available: true,
        used: false,
        lastUsedDate: null,
        hoursUntilReset: 0,
        minutesUntilReset: 0,
      };
    }
  }

  /**
   * Consume the lucky bonus for today and determine the outcome
   * Should be called when starting a session
   */
  consumeBonus(userId: string, seed?: string): LuckyBonusResult {
    const status = this.getStatus(userId);

    // If not available, return no bonus
    if (!status.available) {
      return {
        triggered: false,
        type: 'none',
        originalTier: 'NONE',
        finalTier: 'NONE',
        rewardMultiplier: 1,
      };
    }

    // Mark as used
    this.markUsed(userId);

    // Roll for bonus type
    const roll = this.generateRoll(seed);
    let result: LuckyBonusResult;

    if (roll < LUCKY_BONUS_CONFIG.TIER_SKIP_CHANCE) {
      // Tier skip (5%)
      result = {
        triggered: true,
        type: 'tier_skip',
        originalTier: 'DETERMINED_BY_ENGINE',
        finalTier: 'UPGRADED',
        rewardMultiplier: 1,
      };
    } else if (roll < LUCKY_BONUS_CONFIG.TIER_SKIP_CHANCE + LUCKY_BONUS_CONFIG.DOUBLE_TIER_CHANCE) {
      // Double tier (10%)
      result = {
        triggered: true,
        type: 'double_tier',
        originalTier: 'DETERMINED_BY_ENGINE',
        finalTier: 'DOUBLED',
        rewardMultiplier: LUCKY_BONUS_CONFIG.REWARD_MULTIPLIER,
      };
    } else {
      // No bonus this time (85%)
      result = {
        triggered: false,
        type: 'none',
        originalTier: 'NONE',
        finalTier: 'NONE',
        rewardMultiplier: 1,
      };
    }

    // Track analytics
    Sentry.addBreadcrumb({
      category: 'lucky-bonus',
      message: `Lucky bonus consumed: ${result.type}`,
      level: result.triggered ? 'info' : 'debug',
      data: {
        userId,
        triggered: result.triggered,
        type: result.type,
        roll,
      },
    });

    return result;
  }

  /**
   * Check if lucky bonus should be applied to variable reward
   * Called by VariableRewardEngine
   */
  applyBonusToTier(originalTier: string, bonusType: LuckyBonusType): string {
    if (bonusType === LuckyBonusType.TIER_SKIP) {
      return LUCKY_BONUS_CONFIG.TIER_UPGRADE[originalTier] || originalTier;
    }
    return originalTier;
  }

  /**
   * Mark bonus as used for today
   */
  private markUsed(userId: string): void {
    try {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      const today = getTodayDate(this.userTimezone);

      storage.set(
        storageKey,
        JSON.stringify({
          usedToday: true,
          lastUsedDate: today,
          usedAt: Date.now(),
        }),
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'lucky-bonus', operation: 'markUsed' },
      });
    }
  }

  /**
   * Generate a random roll (0-1)
   */
  private generateRoll(seed?: string): number {
    if (seed) {
      return this.seededRandom(seed);
    }
    return Math.random();
  }

  /**
   * Simple seeded random for deterministic testing
   */
  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    // Simple LCG
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    const rand = (a * Math.abs(hash) + c) % m;
    return rand / m;
  }

  /**
   * Reset bonus status (for testing or admin)
   */
  resetBonus(userId: string): void {
    try {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      storage.delete(storageKey);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'lucky-bonus', operation: 'reset' },
      });
    }
  }

  /**
   * Get formatted countdown string
   */
  getCountdownString(status: LuckyBonusStatus): string {
    if (status.hoursUntilReset > 0) {
      return `${status.hoursUntilReset}h ${status.minutesUntilReset}m`;
    }
    return `${status.minutesUntilReset}m`;
  }

  /**
   * Simulate many rolls for testing probability distributions
   */
  simulateDistribution(rollCount: number): Record<LuckyBonusType, number> {
    const results: Record<LuckyBonusType, number> = {
      [LuckyBonusType.NONE]: 0,
      [LuckyBonusType.DOUBLE_TIER]: 0,
      [LuckyBonusType.TIER_SKIP]: 0,
    };

    for (let i = 0; i < rollCount; i++) {
      const roll = Math.random();

      if (roll < LUCKY_BONUS_CONFIG.TIER_SKIP_CHANCE) {
        results[LuckyBonusType.TIER_SKIP]++;
      } else if (roll < LUCKY_BONUS_CONFIG.TIER_SKIP_CHANCE + LUCKY_BONUS_CONFIG.DOUBLE_TIER_CHANCE) {
        results[LuckyBonusType.DOUBLE_TIER]++;
      } else {
        results[LuckyBonusType.NONE]++;
      }
    }

    return results;
  }
}

// Export singleton
export const dailyLuckyBonusService = new DailyLuckyBonusService();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick check if lucky bonus is available
 */
export function isLuckyBonusAvailable(userId: string): boolean {
  return dailyLuckyBonusService.getStatus(userId).available;
}

/**
 * Get lucky bonus status with formatted countdown
 */
export function getLuckyBonusDisplay(userId: string): {
  available: boolean;
  badge: string;
  subtitle: string;
} {
  const status = dailyLuckyBonusService.getStatus(userId);

  if (status.available) {
    return {
      available: true,
      badge: '🍀',
      subtitle: 'Lucky Bonus Available',
    };
  }

  const countdown = dailyLuckyBonusService.getCountdownString(status);
  return {
    available: false,
    badge: '⏰',
    subtitle: `Next bonus in ${countdown}`,
  };
}

// ============================================================================
// React Hook (for use in components)
// ============================================================================

/**
 * Hook to get lucky bonus status for UI
 * Call this in SessionSetupScreen to show the badge
 */
export function useLuckyBonus(userId: string): LuckyBonusStatus & {
  countdownString: string;
} {
  const status = dailyLuckyBonusService.getStatus(userId);
  return {
    ...status,
    countdownString: dailyLuckyBonusService.getCountdownString(status),
  };
}
