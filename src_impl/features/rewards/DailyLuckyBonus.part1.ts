import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import { MMKV } from "react-native-mmkv";


export const LuckyBonusStatusSchema = z.object({
  available: z.boolean(),
  used: z.boolean(),
  lastUsedDate: z.string().nullable(),
  hoursUntilReset: z.number().int().min(0).max(24),
  minutesUntilReset: z.number().int().min(0).max(59),
});

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