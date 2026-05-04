/**
 * Challenge ↔ Progression Integration
 *
 * Wires challenge completion to progression and rewards.
 */

import { eventBus } from '../events';
import * as challengeService from '../features/challenges/service';
import * as progressionService from '../features/progression/service';
import * as economyService from '../features/economy/service';
import { getAnalyticsService } from '../analytics';
import { createDebugger } from '../utils/debug';

const analytics = getAnalyticsService();
const debug = createDebugger('integration:challenge-progression');

/**
 * Initialize challenge-progression integration
 */
export function initializeChallengeProgressionIntegration(): () => void {
  // Listen for challenge completion
  const unsubscribeCompleted = eventBus.subscribe(
    'challenge:completed',
    async (event: {
      userId: string;
      challengeId: string;
      completedAt: number;
    }) => {
      await handleChallengeComplete(event.userId, event.challengeId);
    },
  );

  // Listen for challenge reward claim
  const unsubscribeClaimed = eventBus.subscribe(
    'challenge:reward_claimed',
    async (event) => {
      if (!event.userId) {
        debug.warn(
          'Challenge reward claimed without userId for %s',
          event.challengeId,
        );
        return;
      }
      await handleRewardClaim(event.userId, event.challengeId);
    },
  );

  // Listen for streak challenges
  const unsubscribeStreak = eventBus.subscribe(
    'streak:updated',
    async (event) => {
      await handleStreakMilestone(event.userId, event.state.currentStreak);
    },
  );

  return () => {
    unsubscribeCompleted();
    unsubscribeClaimed();
    unsubscribeStreak();
  };
}

/**
 * Handle challenge completion
 */
async function handleChallengeComplete(
  userId: string,
  challengeId: string,
): Promise<void> {
  try {
    const claimResult = await challengeService.claimChallengeReward({
      userId,
      challengeId,
    });
    if (!claimResult.success) {
      debug.warn(
        'Challenge reward claim skipped for %s: %s',
        challengeId,
        claimResult.error ?? 'unknown',
      );
      return;
    }
    const rewards = claimResult.rewards;
    // Add progression XP for completing challenge
    const totalXp = rewards
      .filter((r) => r.type === 'XP')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalXp > 0) {
      await progressionService.addXp(userId, {
        userId,
        amount: totalXp,
        source: 'MILESTONE_REWARD',
        metadata: { challengeId },
      });
    }

    // Process other rewards
    for (const reward of rewards) {
      switch (reward.type) {
        case 'COINS':
        case 'GEMS':
          await economyService.addCurrency({
            userId,
            currency: reward.type,
            amount: reward.amount,
            source: 'REWARD',
            description: 'Challenge reward',
            metadata: { challengeId },
            skipEvents: false,
          });
          break;

        case 'ITEM':
          if (reward.itemId) {
            eventBus.publish('inventory:add_item', {
              userId,
              itemId: reward.itemId,
              rarity: 'COMMON',
              source: 'CHALLENGE',
            });
          }
          break;

        case 'BADGE':
          if (reward.itemId) {
            eventBus.publish('achievements:unlock_badge', {
              userId,
              badgeId: reward.itemId,
            });
          }
          break;
      }
    }

    // Track analytics
    analytics.track('challenge_rewards_processed', {
      userId,
      challengeId,
      rewardTypes: rewards.map((r) => r.type),
      totalXp,
      timestamp: Date.now(),
    });
  } catch (error) {
    debug.error('Failed to process challenge rewards:', error as Error);
    analytics.track('challenge_reward_processing_failed', {
      userId,
      challengeId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle reward claim
 */
async function handleRewardClaim(
  userId: string,
  challengeId: string,
): Promise<void> {
  try {
    const completed = await challengeService.getCompletedChallenges(
      userId,
      100,
    );
    const completedCount = completed.length;

    // Milestone achievements
    if (completedCount === 1) {
      eventBus.publish('achievement:unlock', {
        userId,
        achievementId: 'first_challenge',
      });
    } else if (completedCount === 10) {
      eventBus.publish('achievement:unlock', {
        userId,
        achievementId: 'challenge_master',
      });
    }

    analytics.track('challenge_reward_claimed', {
      userId,
      challengeId,
      totalCompleted: completedCount,
    });
  } catch (error) {
    debug.error('Failed to handle reward claim:', error as Error);
  }
}

/**
 * Handle streak milestone - assign streak challenges
 */
async function handleStreakMilestone(
  userId: string,
  streakDays: number,
): Promise<void> {
  try {
    // Assign bonus challenges for streak milestones
    if (streakDays === 7 || streakDays === 30 || streakDays === 100) {
      // Bonus XP for streak milestone
      await progressionService.addXp(userId, {
        userId,
        amount: streakDays,
        source: 'STREAK_BONUS',
        metadata: { streakDays },
      });

      analytics.track('streak_challenge_assigned', {
        userId,
        streakDays,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    debug.error('Failed to handle streak milestone:', error as Error);
  }
}
