/**
 * Economy-Progression Bridge
 *
 * Links economy transactions with progression systems:
 * - Purchases contribute to progression milestones
 * - Currency gains tracked for achievements
 * - Economy events feed into challenges
 */

import { eventBus } from '../events';
import { getAnalyticsService } from '../analytics';

const analytics = getAnalyticsService();

interface EconomyTransaction {
  userId: string;
  type: 'EARN' | 'SPEND' | 'REFUND';
  currency: 'COINS' | 'GEMS' | 'SEASONAL';
  amount: number;
  source: string;
  metadata?: Record<string, unknown>;
}

interface ProgressionMilestone {
  id: string;
  name: string;
  requirement: { type: string; threshold: number };
  reward: { xp: number; currency?: { type: string; amount: number } };
}

/**
 * Process economy transaction with cross-system effects
 */
export async function processEconomyTransaction(
  transaction: EconomyTransaction,
): Promise<{
  success: boolean;
  milestonesAchieved: string[];
  challengesUpdated: string[];
  achievementsUnlocked: string[];
}> {
  const result = {
    success: true,
    milestonesAchieved: [] as string[],
    challengesUpdated: [] as string[],
    achievementsUnlocked: [] as string[],
  };

  // 1. Update spending/earning statistics
  await updateEconomyStats(transaction);

  // 2. Check progression milestones
  if (transaction.type === 'EARN') {
    const milestones = await checkMilestones(transaction.userId, {
      totalEarned: transaction.amount,
      currency: transaction.currency,
    });
    result.milestonesAchieved = milestones;

    for (const milestone of milestones) {
      // Cross-system: Milestone grants XP
      eventBus.publish('progression:add_xp', {
        userId: transaction.userId,
        amount: 100,
        source: 'economy_milestone',
      });
    }
  }

  // 3. Update challenges
  if (
    transaction.source.includes('shop') ||
    transaction.source.includes('purchase')
  ) {
    const challengeUpdate = await updateShopChallenge(
      transaction.userId,
      transaction.amount,
      transaction.type,
    );
    if (challengeUpdate) {
      result.challengesUpdated.push(challengeUpdate);
    }
  }

  // 4. Check achievements
  const achievements = await checkEconomyAchievements(transaction);
  result.achievementsUnlocked = achievements;

  for (const achievement of achievements) {
    // Cross-system: Achievement unlock
    eventBus.publish('achievement:unlocked', {
      userId: transaction.userId,
      achievementId: achievement,
      unlockedAt: Date.now(),
    });
  }

  // 5. Track analytics
  await analytics.track('economy_transaction', {
    user_id: transaction.userId,
    transaction_type: transaction.type,
    currency: transaction.currency,
    amount: transaction.amount,
    source: transaction.source,
    milestones_achieved: result.milestonesAchieved.length,
  });

  // 6. Social feed for large transactions
  if (transaction.amount >= 1000 && transaction.type === 'EARN') {
    eventBus.publish('feed:item_created', {
      itemId: `economy-${Date.now()}`,
      userId: transaction.userId,
      type: 'ECONOMY_MILESTONE',
      content: `Earned ${transaction.amount} ${transaction.currency}!`,
      visibility: 'PUBLIC',
    });
  }

  return result;
}

/**
 * Link shop purchase to progression
 */
export async function linkPurchaseToProgression(
  userId: string,
  itemId: string,
  cost: { currency: string; amount: number },
): Promise<void> {
  // Update "collector" progression track
  await updateCollectorProgress(userId, itemId);

  // Check for shop-related challenges
  const challengeProgress = await updatePurchaseChallenge(userId, cost.amount);

  if (challengeProgress.completed) {
    eventBus.publish('challenge:completed', {
      userId,
      challengeId: challengeProgress.challengeId,
      completedAt: Date.now(),
    });
  }

  // Analytics
  await analytics.track('shop_purchase_linked', {
    user_id: userId,
    item_id: itemId,
    cost_amount: cost.amount,
    cost_currency: cost.currency,
  });
}

/**
 * Grant currency with progression tracking
 */
export async function grantCurrencyWithProgression(
  userId: string,
  amount: number,
  currency: string,
  source: string,
): Promise<{ totalEarned: number; milestones: string[] }> {
  // Grant currency
  const newBalance = await grantCurrency(userId, amount, currency);

  // Update lifetime earnings
  const totalEarned = await updateLifetimeEarnings(userId, amount, currency);

  // Check milestones
  const milestones = await checkEarningMilestones(
    userId,
    totalEarned,
    currency,
  );

  // Cross-system events
  for (const milestone of milestones) {
    eventBus.publish('economy:milestone_achieved', {
      userId,
      milestoneId: milestone,
      totalEarned,
      currency,
    });
  }

  // Feed post for milestones
  if (milestones.length > 0) {
    eventBus.publish('feed:item_created', {
      itemId: `economy-${Date.now()}`,
      userId,
      type: 'ECONOMY_MILESTONE',
      content: `Reached ${milestones.length} earning milestones!`,
      visibility: 'PUBLIC',
    });
  }

  return { totalEarned, milestones };
}

// Helper functions
async function updateEconomyStats(
  transaction: EconomyTransaction,
): Promise<void> {
  // Update user's economy statistics
}

async function checkMilestones(
  userId: string,
  criteria: { totalEarned: number; currency: string },
): Promise<string[]> {
  // Check and return achieved milestone IDs
  return [];
}

async function updateShopChallenge(
  userId: string,
  amount: number,
  type: string,
): Promise<string | null> {
  // Update shop-related challenge progress
  return null;
}

async function checkEconomyAchievements(
  transaction: EconomyTransaction,
): Promise<string[]> {
  // Check for unlocked achievements
  return [];
}

async function updateCollectorProgress(
  userId: string,
  itemId: string,
): Promise<void> {
  // Update collector progression
}

async function updatePurchaseChallenge(
  userId: string,
  amount: number,
): Promise<{ challengeId: string; completed: boolean }> {
  return { challengeId: '', completed: false };
}

async function grantCurrency(
  userId: string,
  amount: number,
  currency: string,
): Promise<number> {
  return 0;
}

async function updateLifetimeEarnings(
  userId: string,
  amount: number,
  currency: string,
): Promise<number> {
  return amount;
}

async function checkEarningMilestones(
  userId: string,
  totalEarned: number,
  currency: string,
): Promise<string[]> {
  return [];
}
