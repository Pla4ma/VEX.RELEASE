/**
 * Reward Service
 *
 * Handles reward claims, daily bonuses, and achievement rewards.
 * Direct service implementation replacing archived system.
 */

import { createDebugger } from '../utils/debug';
import { capture } from '../shared/analytics/analytics-service';
import { RewardEvents } from '../shared/analytics/analytics-events';

const debug = createDebugger('reward-service');

class RewardService {
  private userId: string = '';
  private claimedRewards: Set<string> = new Set();
  private lastDailyClaim: string | null = null;

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
    debug.info('Reward service initialized for user:', userId);
  }

  /**
   * Get all available rewards for user
   */
  getAvailableRewards(): ClaimableReward[] {
    const rewards: Reward[] = this.generateRewards();

    return rewards.map(reward => ({
      reward,
      isAvailable: this.isRewardAvailable(reward),
      isClaimed: this.claimedRewards.has(reward.id),
      timeUntilAvailable: this.getTimeUntilAvailable(reward),
    }));
  }

  /**
   * Claim a reward
   */
  async claimReward(rewardId: string): Promise<boolean> {
    if (!this.userId) {
      debug.error('No user ID set for reward service');
      return false;
    }

    const rewards = this.generateRewards();
    const reward = rewards.find(r => r.id === rewardId);

    if (!reward) {
      debug.error('Reward not found:', rewardId);
      return false;
    }

    if (!this.isRewardAvailable(reward)) {
      debug.warn('Reward not available:', rewardId);
      return false;
    }

    if (this.claimedRewards.has(rewardId)) {
      debug.warn('Reward already claimed:', rewardId);
      return false;
    }

    try {
      // Mark as claimed
      this.claimedRewards.add(rewardId);

      // Handle special reward types
      if (reward.type === 'DAILY_LOGIN') {
        this.lastDailyClaim = new Date().toISOString();
      }

      // Grant rewards
      await this.grantRewardBenefits(reward);

      // Track analytics
      capture(RewardEvents.REWARD_CLAIMED, {
        user_id: this.userId,
        reward_id: rewardId,
        reward_type: reward.type,
        rewards_granted: reward.rewards,
      });

      debug.info('Reward claimed successfully', {
        rewardId,
        type: reward.type,
        rewards: reward.rewards,
      });

      return true;
    } catch (error) {
      debug.error('Failed to claim reward:', error);
      // Rollback on failure
      this.claimedRewards.delete(rewardId);
      return false;
    }
  }

  /**
   * Generate available rewards based on user state
   */
  private generateRewards(): Reward[] {
    const rewards: Reward[] = [];

    // Daily login reward
    rewards.push({
      id: 'daily_login',
      type: 'DAILY_LOGIN',
      title: 'Daily Login Bonus',
      description: 'Claim your daily reward for logging in!',
      rewards: {
        coins: 50,
        xp: 25,
      },
    });

    // Streak bonuses
    rewards.push(
      {
        id: 'streak_3',
        type: 'STREAK_BONUS',
        title: '3-Day Streak Bonus',
        description: 'Maintain a 3-day streak for bonus rewards!',
        rewards: {
          coins: 100,
          gems: 5,
        },
        requirements: {
          minStreak: 3,
        },
      },
      {
        id: 'streak_7',
        type: 'STREAK_BONUS',
        title: '7-Day Streak Bonus',
        description: 'One week streak! Excellent consistency!',
        rewards: {
          coins: 300,
          gems: 15,
          special: 1,
        },
        requirements: {
          minStreak: 7,
        },
      },
      {
        id: 'streak_30',
        type: 'STREAK_BONUS',
        title: '30-Day Streak Master',
        description: 'Incredible dedication! You\'re a focus master!',
        rewards: {
          coins: 1000,
          gems: 50,
          special: 5,
        },
        requirements: {
          minStreak: 30,
        },
      }
    );

    // Level up rewards
    for (let level = 5; level <= 50; level += 5) {
      rewards.push({
        id: `level_${level}`,
        type: 'LEVEL_UP',
        title: `Level ${level} Milestone`,
        description: `Congratulations on reaching level ${level}!`,
        rewards: {
          coins: level * 20,
          gems: Math.floor(level / 5),
        },
        requirements: {
          minLevel: level,
        },
      });
    }

    return rewards;
  }

  /**
   * Check if reward is available for claiming
   */
  private isRewardAvailable(reward: Reward): boolean {
    // Check if already claimed
    if (this.claimedRewards.has(reward.id)) {
      return false;
    }

    // Check expiration
    if (reward.expiresAt && new Date() > new Date(reward.expiresAt)) {
      return false;
    }

    // Check daily login availability
    if (reward.type === 'DAILY_LOGIN') {
      if (!this.lastDailyClaim) {return true;}

      const lastClaim = new Date(this.lastDailyClaim);
      const now = new Date();

      // Check if it's a new day (midnight reset)
      return lastClaim.toDateString() !== now.toDateString();
    }

    // For other rewards, assume available if requirements met
    return true;
  }

  /**
   * Get time until reward is available (in milliseconds)
   */
  private getTimeUntilAvailable(reward: Reward): number | undefined {
    if (reward.type === 'DAILY_LOGIN' && this.lastDailyClaim) {
      const lastClaim = new Date(this.lastDailyClaim);
      const tomorrow = new Date(lastClaim);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      return tomorrow.getTime() - Date.now();
    }

    return undefined;
  }

  /**
   * Grant reward benefits to user
   */
  private async grantRewardBenefits(reward: Reward): Promise<void> {
    // Import services dynamically to avoid circular dependencies
    const { progressionService } = await import('./progressionService');
    const { economyService } = await import('./economyService');

    // Grant XP
    if (reward.rewards.xp) {
      await progressionService.grantXP({
        amount: reward.rewards.xp,
        source: 'achievement_unlock',
        metadata: { rewardId: reward.id },
      });
    }

    // Grant currency
    if (reward.rewards.coins) {
      await economyService.addCurrency({
        userId: this.userId,
        amount: reward.rewards.coins,
        currency: 'COINS',
        source: 'ACHIEVEMENT',
        metadata: { rewardId: reward.id },
      });
    }

    if (reward.rewards.gems) {
      await economyService.addCurrency({
        userId: this.userId,
        amount: reward.rewards.gems,
        currency: 'GEMS',
        source: 'ACHIEVEMENT',
        metadata: { rewardId: reward.id },
      });
    }

    if (reward.rewards.special) {
      await economyService.addCurrency({
        userId: this.userId,
        amount: reward.rewards.special,
        currency: 'SPECIAL',
        source: 'ACHIEVEMENT',
        metadata: { rewardId: reward.id },
      });
    }
  }

  /**
   * Reset user data (for logout)
   */
  reset(): void {
    this.userId = '';
    this.claimedRewards.clear();
    this.lastDailyClaim = null;
    debug.info('Reward service reset');
  }
}

// Singleton instance
export const rewardService = new RewardService();

export * from "./rewardService.types";
