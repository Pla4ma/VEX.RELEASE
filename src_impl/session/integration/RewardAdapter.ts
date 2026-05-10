/**
 * Reward Adapter
 *
 * Integrates the session system with the reward system.
 * Handles reward calculation and distribution based on session performance.
 */

import { eventBus } from '../../events';
import { getRewardService } from '../../rewards/RewardService';
import type { SessionSummary } from '../types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:rewardAdapter');

// ============================================================================
// Reward Adapter
// ============================================================================

export class RewardAdapter {
  private userId: string | null = null;
  private rewardService = getRewardService();

  setUserId(userId: string): void {
    this.userId = userId;
    this.rewardService.setUserId(userId);
    debug.info('RewardAdapter user set: %s', userId);
  }

  // ============================================================================
  // Reward Distribution
  // ============================================================================

  async distributeSessionRewards(summary: SessionSummary): Promise<{
    xpGranted: number;
    coinsGranted: number;
    gemsGranted: number;
    bonuses: string[];
  }> {
    if (!this.userId) {
      throw new Error('RewardAdapter: No user set');
    }

    const rewards = {
      xpGranted: 0,
      coinsGranted: 0,
      gemsGranted: 0,
      bonuses: [] as string[],
    };

    try {
      // Grant XP
      if (summary.xpEarned > 0) {
        await this.grantXP(summary.xpEarned, summary);
        rewards.xpGranted = summary.xpEarned;
      }

      // Grant Coins
      if (summary.coinsEarned > 0) {
        await this.grantCoins(summary.coinsEarned, summary);
        rewards.coinsGranted = summary.coinsEarned;
      }

      // Grant Gems (for exceptional performance)
      if (summary.gemsEarned > 0) {
        await this.grantGems(summary.gemsEarned, summary);
        rewards.gemsGranted = summary.gemsEarned;
      }

      // Check for bonus rewards
      const bonusRewards = this.calculateBonusRewards(summary);

      for (const bonus of bonusRewards) {
        await this.grantBonus(bonus, summary);
        rewards.bonuses.push(bonus.type);
      }

      // Emit rewards granted event
      eventBus.publish('session:rewards:granted', {
        sessionId: summary.sessionId,
        userId: this.userId,
        rewards,
        timestamp: Date.now(),
      });

      debug.info('Rewards distributed for session %s: XP=%d, Coins=%d, Gems=%d',
        summary.sessionId, rewards.xpGranted, rewards.coinsGranted, rewards.gemsGranted);

    } catch (error) {
      debug.error('Failed to distribute rewards', error as Error);
    }

    return rewards;
  }

  // ============================================================================
  // Individual Reward Granting
  // ============================================================================

  private async grantXP(amount: number, _summary: SessionSummary): Promise<void> {
    eventBus.publish('progression:add_xp', {
      userId: this.userId!,
      amount,
      source: 'SESSION_COMPLETE',
    });

    debug.debug('XP granted: %d', amount);
  }

  private async grantCoins(amount: number, _summary: SessionSummary): Promise<void> {
    eventBus.publish('economy:add_currency', {
      userId: this.userId!,
      type: 'COINS',
      amount,
      source: 'SESSION_REWARD',
    });

    debug.debug('Coins granted: %d', amount);
  }

  private async grantGems(amount: number, _summary: SessionSummary): Promise<void> {
    eventBus.publish('economy:add_currency', {
      userId: this.userId!,
      type: 'GEMS',
      amount,
      source: 'SESSION_BONUS',
    });

    debug.debug('Gems granted: %d', amount);
  }

  private async grantBonus(
    bonus: { type: string; amount: number; description: string },
    summary: SessionSummary
  ): Promise<void> {
    // Publish bonus earned event
    eventBus.publish('session:bonus:earned', {
      sessionId: summary.sessionId,
      userId: this.userId!,
      type: bonus.type,
      amount: bonus.amount,
      description: bonus.description,
    });

    // Use reward service for special rewards
    await this.rewardService.grantReward(
      'XP',
      'SESSION_COMPLETE',
      {
        baseAmount: bonus.amount,
        streakMultiplier: 1,
        levelMultiplier: 1,
      },
      { bonusType: bonus.type, sessionId: summary.sessionId }
    );

    debug.debug('Bonus granted: %s = %d', bonus.type, bonus.amount);
  }

  // ============================================================================
  // Bonus Reward Calculation
  // ============================================================================

  private calculateBonusRewards(summary: SessionSummary): Array<{
    type: string;
    amount: number;
    description: string;
  }> {
    const bonuses: Array<{ type: string; amount: number; description: string }> = [];

    // Perfect session bonus (100% completion + high quality)
    if (summary.completionPercentage >= 100 && summary.focusQuality >= 90) {
      bonuses.push({
        type: 'PERFECT_SESSION',
        amount: 50,
        description: 'Perfect focus session completed!',
      });
    }

    // High score bonus
    if (summary.finalScore > 500) {
      bonuses.push({
        type: 'HIGH_SCORE',
        amount: Math.floor(summary.finalScore * 0.1),
        description: 'Outstanding performance bonus!',
      });
    }

    // Streak milestone bonus
    if (summary.streakIncreased && summary.streakDays % 7 === 0) {
      bonuses.push({
        type: 'STREAK_MILESTONE',
        amount: summary.streakDays * 10,
        description: `${summary.streakDays} day streak!`,
      });
    }

    // Multi-interval bonus
    if (summary.interruptions <= 1 && summary.pauses <= 2) {
      bonuses.push({
        type: 'DEEP_FOCUS',
        amount: 25,
        description: 'Deep focus maintained!',
      });
    }

    // Early bird bonus (sessions before 9 AM)
    const hour = new Date().getHours();
    if (hour < 9) {
      bonuses.push({
        type: 'EARLY_BIRD',
        amount: 20,
        description: 'Early morning focus session!',
      });
    }

    // Night owl bonus (sessions after 9 PM)
    if (hour >= 21) {
      bonuses.push({
        type: 'NIGHT_OWL',
        amount: 20,
        description: 'Late night dedication!',
      });
    }

    return bonuses;
  }

  // ============================================================================
  // Streak Integration
  // ============================================================================

  async handleStreakMaintained(sessionId: string, streakDays: number): Promise<void> {
    if (!this.userId) {return;}

    eventBus.publish('session:streak:maintained', {
      sessionId,
      userId: this.userId,
      streakDays,
      timestamp: Date.now(),
    });

    debug.info('Streak maintained: %d days', streakDays);
  }

  async handleStreakBroken(sessionId: string, previousStreak: number): Promise<void> {
    if (!this.userId) {return;}

    eventBus.publish('session:streak:broken', {
      sessionId,
      userId: this.userId,
      previousStreak,
      timestamp: Date.now(),
    });

    // Grant comeback bonus if streak was significant
    if (previousStreak >= 7) {
      await this.rewardService.grantReward(
        'CURRENCY',
        'COMEBACK_BONUS',
        {
          baseAmount: 100,
          streakMultiplier: 1,
          levelMultiplier: 1,
        },
        { previousStreak, sessionId }
      );
    }

    debug.info('Streak broken: was %d days', previousStreak);
  }

  // ============================================================================
  // Achievement Integration
  // ============================================================================

  async checkSessionAchievements(summary: SessionSummary): Promise<void> {
    if (!this.userId) {return;}

    // Check for session count achievements
    // These would be checked against user stats in a real implementation

    // First session achievement
    // 10 sessions
    // 50 sessions
    // 100 sessions

    // Check for duration achievements
    // 1 hour total focus time
    // 10 hours total focus time
    // 100 hours total focus time

    // Check for streak achievements
    // 7 day streak
    // 30 day streak
    // 100 day streak

    debug.debug('Checked achievements for session %s', summary.sessionId);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createRewardAdapter(): RewardAdapter {
  return new RewardAdapter();
}

// ============================================================================
// Singleton
// ============================================================================

let adapterInstance: RewardAdapter | null = null;

export function getRewardAdapter(): RewardAdapter {
  if (!adapterInstance) {
    adapterInstance = new RewardAdapter();
  }
  return adapterInstance;
}
