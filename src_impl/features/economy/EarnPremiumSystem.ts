/**
 * EarnPremiumSystem
 *
 * Allows users to earn free Premium trial periods through achievement milestones.
 * Creates aspiration for non-paying users: "I'll grind to earn it"
 *
 * Achievement-based unlocks:
 * - 30-day streak: 7-day premium trial
 * - Complete all 6 boss tiers: 7-day premium trial
 * - Reach Level 20: 3-day premium trial
 *
 * Constraints:
 * - One earn-trial per type (not repeatable)
 * - Can buy Premium after trial expires
 * - Tracks claimed status to prevent duplicate claims
 *
 * Dependencies: shared/monetization, features/progression, features/streaks, features/boss
 * Consumers: paywall screens, achievement notifications, profile screen
 */

import { z } from "zod";
import * as Sentry from "@sentry/react-native";

import { capture } from "../../shared/analytics";
import { revenueCatService } from "../../shared/monetization/revenuecat-service";

// ============================================================================
// Types & Schemas
// ============================================================================

export enum EarnPremiumAchievementType {
  STREAK_30_DAYS = "STREAK_30_DAYS",
  ALL_BOSSES_DEFEATED = "ALL_BOSSES_DEFEATED",
  LEVEL_20 = "LEVEL_20",
}

export interface EarnPremiumReward {
  type: EarnPremiumAchievementType;
  trialDays: number;
  title: string;
  description: string;
  icon: string;
  claimed: boolean;
  claimedAt: number | null;
  unlockedAt: number | null;
}

export const EarnPremiumRewardSchema = z.object({
  type: z.nativeEnum(EarnPremiumAchievementType),
  trialDays: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  claimed: z.boolean().default(false),
  claimedAt: z.number().nullable().default(null),
  unlockedAt: z.number().nullable().default(null),
});

export const EarnPremiumStatusSchema = z.object({
  userId: z.string().uuid(),
  rewards: z.array(EarnPremiumRewardSchema),
  hasActiveTrial: z.boolean().default(false),
  trialEndsAt: z.number().nullable().default(null),
  totalTrialsClaimed: z.number().int().min(0).default(0),
});

export type EarnPremiumStatus = z.infer<typeof EarnPremiumStatusSchema>;

export interface CheckEligibilityInput {
  userId: string;
  streakDays: number;
  defeatedBossIds: string[];
  currentLevel: number;
  existingStatus: EarnPremiumStatus | null;
}

export const CheckEligibilityInputSchema = z.object({
  userId: z.string().uuid(),
  streakDays: z.number().int().min(0),
  defeatedBossIds: z.array(z.string()),
  currentLevel: z.number().int().min(1),
  existingStatus: EarnPremiumStatusSchema.nullable(),
});

// ============================================================================
// Reward Definitions
// ============================================================================

const REWARD_DEFINITIONS: Record<EarnPremiumAchievementType, Omit<EarnPremiumReward, "claimed" | "claimedAt" | "unlockedAt">> = {
  [EarnPremiumAchievementType.STREAK_30_DAYS]: {
    type: EarnPremiumAchievementType.STREAK_30_DAYS,
    trialDays: 7,
    title: "30-Day Champion",
    description: "Maintain a 30-day streak to unlock 7 days of Premium free",
    icon: "🔥",
  },
  [EarnPremiumAchievementType.ALL_BOSSES_DEFEATED]: {
    type: EarnPremiumAchievementType.ALL_BOSSES_DEFEATED,
    trialDays: 7,
    title: "Boss Slayer",
    description: "Defeat all 6 boss tiers to unlock 7 days of Premium free",
    icon: "⚔️",
  },
  [EarnPremiumAchievementType.LEVEL_20]: {
    type: EarnPremiumAchievementType.LEVEL_20,
    trialDays: 3,
    title: "Level 20 Legend",
    description: "Reach Level 20 to unlock 3 days of Premium free",
    icon: "🏆",
  },
};

const ALL_BOSS_IDS = ["1", "2", "3", "4", "5", "6"];

// ============================================================================
// Earn Premium System
// ============================================================================

export class EarnPremiumSystem {
  /**
   * Check eligibility and unlock rewards for newly achieved milestones
   */
  checkAndUnlock(input: CheckEligibilityInput): EarnPremiumStatus {
    const validated = CheckEligibilityInputSchema.parse(input);

    // Initialize or use existing status
    const status: EarnPremiumStatus = validated.existingStatus ?? {
      userId: validated.userId,
      rewards: [],
      hasActiveTrial: false,
      trialEndsAt: null,
      totalTrialsClaimed: 0,
    };

    const newlyUnlocked: EarnPremiumReward[] = [];

    // Check Streak 30 achievement
    if (validated.streakDays >= 30) {
      const existingReward = status.rewards.find((r) => r.type === EarnPremiumAchievementType.STREAK_30_DAYS);
      if (!existingReward) {
        const definition = REWARD_DEFINITIONS[EarnPremiumAchievementType.STREAK_30_DAYS];
        const reward: EarnPremiumReward = {
          ...definition,
          claimed: false,
          claimedAt: null,
          unlockedAt: Date.now(),
        };
        status.rewards.push(reward);
        newlyUnlocked.push(reward);
      }
    }

    // Check All Bosses Defeated achievement
    const hasDefeatedAllBosses = ALL_BOSS_IDS.every((id) => validated.defeatedBossIds.includes(id));
    if (hasDefeatedAllBosses) {
      const existingReward = status.rewards.find((r) => r.type === EarnPremiumAchievementType.ALL_BOSSES_DEFEATED);
      if (!existingReward) {
        const definition = REWARD_DEFINITIONS[EarnPremiumAchievementType.ALL_BOSSES_DEFEATED];
        const reward: EarnPremiumReward = {
          ...definition,
          claimed: false,
          claimedAt: null,
          unlockedAt: Date.now(),
        };
        status.rewards.push(reward);
        newlyUnlocked.push(reward);
      }
    }

    // Check Level 20 achievement
    if (validated.currentLevel >= 20) {
      const existingReward = status.rewards.find((r) => r.type === EarnPremiumAchievementType.LEVEL_20);
      if (!existingReward) {
        const definition = REWARD_DEFINITIONS[EarnPremiumAchievementType.LEVEL_20];
        const reward: EarnPremiumReward = {
          ...definition,
          claimed: false,
          claimedAt: null,
          unlockedAt: Date.now(),
        };
        status.rewards.push(reward);
        newlyUnlocked.push(reward);
      }
    }

    // Track analytics for newly unlocked rewards
    for (const reward of newlyUnlocked) {
      capture("premium_reward_unlocked", {
        user_id: validated.userId,
        achievement_type: reward.type,
        trial_days: reward.trialDays,
      });

      Sentry.addBreadcrumb({
        category: "earn-premium",
        message: `Premium reward unlocked: ${reward.type}`,
        level: "info",
        data: {
          userId: validated.userId,
          type: reward.type,
          trialDays: reward.trialDays,
        },
      });
    }

    // Update trial status
    this.updateTrialStatus(status);

    return status;
  }

  /**
   * Claim an unlocked premium trial reward
   */
  claimReward(status: EarnPremiumStatus, rewardType: EarnPremiumAchievementType): { success: boolean; status: EarnPremiumStatus; error?: string } {
    const reward = status.rewards.find((r) => r.type === rewardType);

    if (!reward) {
      return {
        success: false,
        status,
        error: "Reward not found or not yet unlocked",
      };
    }

    if (reward.claimed) {
      return {
        success: false,
        status,
        error: "Reward already claimed",
      };
    }

    if (!reward.unlockedAt) {
      return {
        success: false,
        status,
        error: "Reward not yet unlocked",
      };
    }

    // Mark as claimed
    reward.claimed = true;
    reward.claimedAt = Date.now();
    status.totalTrialsClaimed += 1;

    // Activate trial period
    const trialEndTime = Date.now() + reward.trialDays * 24 * 60 * 60 * 1000;
    status.hasActiveTrial = true;
    status.trialEndsAt = trialEndTime;

    // Sync with RevenueCat (grant promotional access)
    this.syncTrialWithRevenueCat(status.userId, reward.trialDays);

    // Track analytics
    capture("premium_trial_claimed", {
      user_id: status.userId,
      achievement_type: rewardType,
      trial_days: reward.trialDays,
      trial_ends_at: trialEndTime,
    });

    Sentry.addBreadcrumb({
      category: "earn-premium",
      message: `Premium trial claimed: ${rewardType}`,
      level: "info",
      data: {
        userId: status.userId,
        type: rewardType,
        trialDays: reward.trialDays,
        trialEndsAt: trialEndTime,
      },
    });

    return { success: true, status };
  }

  /**
   * Get available (unlocked but unclaimed) rewards
   */
  getAvailableRewards(status: EarnPremiumStatus): EarnPremiumReward[] {
    return status.rewards.filter((r) => !r.claimed && r.unlockedAt !== null);
  }

  /**
   * Get claimed rewards history
   */
  getClaimedRewards(status: EarnPremiumStatus): EarnPremiumReward[] {
    return status.rewards.filter((r) => r.claimed);
  }

  /**
   * Check if user has any unclaimed rewards (for notification purposes)
   */
  hasUnclaimedRewards(status: EarnPremiumStatus): boolean {
    return this.getAvailableRewards(status).length > 0;
  }

  /**
   * Format time remaining in trial
   */
  getTrialTimeRemaining(status: EarnPremiumStatus): number {
    if (!status.hasActiveTrial || !status.trialEndsAt) {
      return 0;
    }

    const now = Date.now();
    const remaining = status.trialEndsAt - now;

    return Math.max(0, remaining);
  }

  /**
   * Format trial time remaining as human-readable string
   */
  formatTrialTimeRemaining(status: EarnPremiumStatus): string {
    const remaining = this.getTrialTimeRemaining(status);

    if (remaining <= 0) {
      return "Trial expired";
    }

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} left`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} left`;
  }

  /**
   * Create initial status for new users
   */
  createInitialStatus(userId: string): EarnPremiumStatus {
    return {
      userId,
      rewards: [],
      hasActiveTrial: false,
      trialEndsAt: null,
      totalTrialsClaimed: 0,
    };
  }

  /**
   * Refresh trial status (call periodically to check expiration)
   */
  refreshTrialStatus(status: EarnPremiumStatus): EarnPremiumStatus {
    this.updateTrialStatus(status);
    return status;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private updateTrialStatus(status: EarnPremiumStatus): void {
    if (!status.hasActiveTrial || !status.trialEndsAt) {
      return;
    }

    const now = Date.now();
    if (now >= status.trialEndsAt) {
      status.hasActiveTrial = false;
      status.trialEndsAt = null;

      // Track trial expiration
      capture("premium_trial_expired", {
        user_id: status.userId,
      });
    }
  }

  private async syncTrialWithRevenueCat(userId: string, trialDays: number): Promise<void> {
    try {
      // Sync with RevenueCat to grant promotional access
      await revenueCatService.syncPurchases();

      Sentry.addBreadcrumb({
        category: "earn-premium",
        message: "Synced trial with RevenueCat",
        level: "info",
        data: {
          userId,
          trialDays,
        },
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: "earn-premium", operation: "sync-revenuecat" },
        extra: { userId, trialDays },
      });
    }
  }
}

// Export singleton instance
export const earnPremiumSystem = new EarnPremiumSystem();

// ============================================================================
// Convenience Functions
// ============================================================================

export function checkEarnPremiumEligibility(userId: string, streakDays: number, defeatedBossIds: string[], currentLevel: number, existingStatus: EarnPremiumStatus | null): EarnPremiumStatus {
  return earnPremiumSystem.checkAndUnlock({
    userId,
    streakDays,
    defeatedBossIds,
    currentLevel,
    existingStatus,
  });
}

export function claimEarnPremiumReward(status: EarnPremiumStatus, rewardType: EarnPremiumAchievementType): { success: boolean; status: EarnPremiumStatus; error?: string } {
  return earnPremiumSystem.claimReward(status, rewardType);
}

export function hasUnclaimedPremiumRewards(status: EarnPremiumStatus): boolean {
  return earnPremiumSystem.hasUnclaimedRewards(status);
}
