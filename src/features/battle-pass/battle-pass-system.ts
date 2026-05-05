/**
 * Battle Pass System
 * Seasonal progression with Free and Premium tracks
 * Creates FOMO, drives engagement, monetizes through Premium upgrade
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const BattlePassTierSchema = z.enum(['FREE', 'PREMIUM']);

export const BattlePassRewardSchema = z.object({
  tier: z.number().int().min(1),
  freeReward: z.object({
    type: z.enum(['COINS', 'GEMS', 'XP_BOOST', 'STREAK_SHIELD', 'CHEST', 'COSMETIC', 'TITLE']),
    amount: z.number().int(),
    cosmeticId: z.string().nullable(),
    titleId: z.string().nullable(),
  }),
  premiumReward: z.object({
    type: z.enum(['COINS', 'GEMS', 'XP_BOOST', 'STREAK_SHIELD', 'CHEST', 'COSMETIC', 'TITLE']),
    amount: z.number().int(),
    cosmeticId: z.string().nullable(),
    titleId: z.string().nullable(),
  }),
  xpRequired: z.number().int(), // XP needed to reach this tier
});

export const BattlePassSeasonSchema = z.object({
  id: z.string().uuid(),
  seasonNumber: z.number().int(),
  name: z.string(),
  description: z.string(),
  startDate: z.number(),
  endDate: z.number(),
  theme: z.string(),
  maxTier: z.number().int(),
  premiumPriceGems: z.number().int(), // Usually 500 gems (~$9.99 equivalent)
});

export const UserBattlePassSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  currentTier: z.number().int().min(0).default(0),
  currentTierXp: z.number().int().default(0),
  hasPremium: z.boolean().default(false),
  premiumPurchasedAt: z.number().nullable(),
  claimedRewards: z.array(z.number()).default([]), // Tiers already claimed
  xpBoostMultiplier: z.number().default(1.0), // Premium users get 50% boost
});

// ============================================================================
// Season Configuration
// ============================================================================

export const CURRENT_SEASON = {
  id: 'season-1-focus-mastery',
  seasonNumber: 1,
  name: 'Focus Mastery',
  description: 'Master your focus and earn exclusive rewards',
  startDate: Date.now(),
  endDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
  theme: 'cyber-focus',
  maxTier: 50,
  premiumPriceGems: 500,
};

// Generate tier rewards dynamically
function generateTierRewards(maxTier: number) {
  const rewards = [];
  let xpRequired = 1000; // Base XP for tier 1

  for (let tier = 1; tier <= maxTier; tier++) {
    // Scale XP required
    xpRequired = Math.floor(xpRequired * 1.05); // 5% increase per tier

    // Free rewards (every tier)
    const freeReward = {
      type: (tier % 5 === 0 ? 'CHEST' : 'COINS') as 'COINS' | 'GEMS' | 'XP_BOOST' | 'STREAK_SHIELD' | 'CHEST' | 'COSMETIC' | 'TITLE',
      amount: tier % 5 === 0 ? 1 : 50 + tier * 10,
      cosmeticId: null,
      titleId: null,
    };

    // Premium rewards (better, plus exclusive cosmetics/titles at milestones)
    let premiumReward;
    if (tier === 1) {
      premiumReward = { type: 'COSMETIC' as const, amount: 1, cosmeticId: 'premium-avatar-frame', titleId: null };
    } else if (tier === 10) {
      premiumReward = { type: 'TITLE' as const, amount: 1, cosmeticId: null, titleId: 'focus-apprentice' };
    } else if (tier === 25) {
      premiumReward = { type: 'COSMETIC' as const, amount: 1, cosmeticId: 'premium-theme', titleId: null };
    } else if (tier === 50) {
      premiumReward = { type: 'COSMETIC' as const, amount: 1, cosmeticId: 'legendary-pet', titleId: null };
    } else if (tier % 5 === 0) {
      premiumReward = { type: 'GEMS' as const, amount: 25, cosmeticId: null, titleId: null };
    } else {
      premiumReward = { type: 'COINS' as const, amount: 100 + tier * 20, cosmeticId: null, titleId: null };
    }

    rewards.push({
      tier,
      freeReward,
      premiumReward,
      xpRequired,
    });
  }

  return rewards;
}

export const TIER_REWARDS = generateTierRewards(50);

// ============================================================================
// Types
// ============================================================================

export type BattlePassTier = z.infer<typeof BattlePassTierSchema>;
export type BattlePassReward = z.infer<typeof BattlePassRewardSchema>;
export type BattlePassSeason = z.infer<typeof BattlePassSeasonSchema>;
export type UserBattlePass = z.infer<typeof UserBattlePassSchema>;

// ============================================================================
// Progression System
// ============================================================================

export function addXpToBattlePass(
  userBattlePass: UserBattlePass,
  baseXp: number,
  source: 'SESSION_COMPLETE' | 'CHALLENGE_COMPLETE' | 'STREAK_MILESTONE'
): {
  tiersGained: number;
  newTier: number;
  overflowXp: number;
  rewardsUnlocked: BattlePassReward[];
  totalXpAdded: number;
} {
  // Apply XP boost if premium
  const xpMultiplier = userBattlePass.hasPremium ? 1.5 : 1.0;
  const totalXpAdded = Math.floor(baseXp * xpMultiplier);

  let currentTier = userBattlePass.currentTier;
  let currentTierXp = userBattlePass.currentTierXp + totalXpAdded;
  const rewardsUnlocked: BattlePassReward[] = [];

  // Check for tier ups
  while (currentTier < CURRENT_SEASON.maxTier) {
    const nextTierConfig = TIER_REWARDS[currentTier]; // Array is 0-indexed, tiers are 1-indexed
    if (!nextTierConfig) {break;}

    const xpNeeded = nextTierConfig.xpRequired;

    if (currentTierXp >= xpNeeded) {
      currentTierXp -= xpNeeded;
      currentTier++;
      rewardsUnlocked.push(nextTierConfig);
    } else {
      break;
    }
  }

  return {
    tiersGained: currentTier - userBattlePass.currentTier,
    newTier: currentTier,
    overflowXp: currentTierXp,
    rewardsUnlocked,
    totalXpAdded,
  };
}

// ============================================================================
// Reward Claiming
// ============================================================================

export function canClaimTierReward(
  userBattlePass: UserBattlePass,
  tier: number,
  track: 'FREE' | 'PREMIUM'
): { canClaim: boolean; reason?: string } {
  // Check if tier reached
  if (tier > userBattlePass.currentTier) {
    return { canClaim: false, reason: 'Tier not yet reached' };
  }

  // Check if already claimed
  if (userBattlePass.claimedRewards.includes(tier)) {
    return { canClaim: false, reason: 'Reward already claimed' };
  }

  // Check premium for premium track
  if (track === 'PREMIUM' && !userBattlePass.hasPremium) {
    return { canClaim: false, reason: 'Premium required' };
  }

  return { canClaim: true };
}

export function claimTierReward(
  userBattlePass: UserBattlePass,
  tier: number,
  track: 'FREE' | 'PREMIUM'
): {
  success: boolean;
  reward: { type: string; amount: number; cosmeticId?: string; titleId?: string } | null;
  updatedUserBattlePass: UserBattlePass;
  error?: string;
} {
  const canClaim = canClaimTierReward(userBattlePass, tier, track);
  if (!canClaim.canClaim) {
    return {
      success: false,
      reward: null,
      updatedUserBattlePass: userBattlePass,
      error: canClaim.reason,
    };
  }

  const tierConfig = TIER_REWARDS[tier - 1];
  if (!tierConfig) {
    return {
      success: false,
      reward: null,
      updatedUserBattlePass: userBattlePass,
      error: 'Invalid tier',
    };
  }

  const reward = track === 'FREE' ? tierConfig.freeReward : tierConfig.premiumReward;

  const updatedBattlePass: UserBattlePass = {
    ...userBattlePass,
    claimedRewards: [...userBattlePass.claimedRewards, tier],
  };

  // Publish event
  eventBus.publish('battle_pass:reward_claimed', {
    userId: userBattlePass.userId,
    tier,
    rewardId: `${tier}`,
    rewardType: reward.type,
    timestamp: Date.now(),
  });

  return {
    success: true,
    reward: {
      type: reward.type,
      amount: reward.amount,
      cosmeticId: reward.cosmeticId || undefined,
      titleId: reward.titleId || undefined,
    },
    updatedUserBattlePass: updatedBattlePass,
  };
}

// ============================================================================
// Premium Upgrade
// ============================================================================

export function canPurchasePremium(
  userGems: number,
  userBattlePass: UserBattlePass
): { canPurchase: boolean; reason?: string; price: number } {
  if (userBattlePass.hasPremium) {
    return { canPurchase: false, reason: 'Already have Premium', price: 0 };
  }

  if (userGems < CURRENT_SEASON.premiumPriceGems) {
    return {
      canPurchase: false,
      reason: `Need ${CURRENT_SEASON.premiumPriceGems} gems`,
      price: CURRENT_SEASON.premiumPriceGems,
    };
  }

  // Check if season expired
  if (Date.now() > CURRENT_SEASON.endDate) {
    return { canPurchase: false, reason: 'Season ended', price: 0 };
  }

  return { canPurchase: true, price: CURRENT_SEASON.premiumPriceGems };
}

export function purchasePremium(
  userBattlePass: UserBattlePass,
  gemsSpent: number
): {
  success: boolean;
  updatedBattlePass: UserBattlePass;
  retroactiveRewards: BattlePassReward[];
  error?: string;
} {
  const check = canPurchasePremium(gemsSpent, userBattlePass);
  if (!check.canPurchase) {
    return {
      success: false,
      updatedBattlePass: userBattlePass,
      retroactiveRewards: [],
      error: check.reason,
    };
  }

  // Grant Premium
  const updatedBattlePass: UserBattlePass = {
    ...userBattlePass,
    hasPremium: true,
    premiumPurchasedAt: Date.now(),
    xpBoostMultiplier: 1.5,
  };

  // Calculate retroactive rewards for already-reached tiers
  const retroactiveRewards: BattlePassReward[] = [];
  for (let tier = 1; tier <= userBattlePass.currentTier; tier++) {
    if (!userBattlePass.claimedRewards.includes(tier)) {
      const tierConfig = TIER_REWARDS[tier - 1];
      if (tierConfig) {
        retroactiveRewards.push(tierConfig);
      }
    }
  }

  // Publish event
  eventBus.publish('battle_pass:premium_purchased', {
    userId: userBattlePass.userId,
    purchaseId: `premium-${Date.now()}`,
    price: check.price,
    timestamp: Date.now(),
  });

  Sentry.addBreadcrumb({
    category: 'battle_pass',
    message: 'Premium purchased',
    data: { userId: userBattlePass.userId, tier: userBattlePass.currentTier },
  });

  return {
    success: true,
    updatedBattlePass,
    retroactiveRewards,
  };
}

// ============================================================================
// UI Helpers
// ============================================================================

export function getBattlePassProgress(
  userBattlePass: UserBattlePass
): {
  currentTier: number;
  maxTier: number;
  tierProgressPercent: number;
  xpToNextTier: number;
  xpInCurrentTier: number;
  daysRemaining: number;
  totalClaimableFree: number;
  totalClaimablePremium: number;
} {
  const nextTierConfig = TIER_REWARDS[userBattlePass.currentTier];
  const xpToNextTier = nextTierConfig ? nextTierConfig.xpRequired : 0;
  const xpInCurrentTier = userBattlePass.currentTierXp;
  const tierProgressPercent = xpToNextTier > 0
    ? Math.floor((xpInCurrentTier / xpToNextTier) * 100)
    : 100;

  const msRemaining = CURRENT_SEASON.endDate - Date.now();
  const daysRemaining = Math.max(0, Math.floor(msRemaining / (24 * 60 * 60 * 1000)));

  // Count claimable rewards
  let claimableFree = 0;
  let claimablePremium = 0;

  for (let tier = 1; tier <= userBattlePass.currentTier; tier++) {
    if (!userBattlePass.claimedRewards.includes(tier)) {
      claimableFree++;
      if (userBattlePass.hasPremium) {
        claimablePremium++;
      }
    }
  }

  return {
    currentTier: userBattlePass.currentTier,
    maxTier: CURRENT_SEASON.maxTier,
    tierProgressPercent,
    xpToNextTier,
    xpInCurrentTier,
    daysRemaining,
    totalClaimableFree: claimableFree,
    totalClaimablePremium: claimablePremium,
  };
}

export function formatRewardPreview(reward: { type: string; amount: number }): string {
  const icons: Record<string, string> = {
    COINS: '🪙',
    GEMS: '💎',
    XP_BOOST: '⚡',
    STREAK_SHIELD: '🛡️',
    CHEST: '🎁',
    COSMETIC: '👕',
    TITLE: '🏆',
  };

  return `${icons[reward.type] || '🎁'} ${reward.amount} ${reward.type.toLowerCase()}`;
}

export function getSeasonEndCountdown(): string {
  const msRemaining = CURRENT_SEASON.endDate - Date.now();

  if (msRemaining <= 0) {
    return 'Season ended!';
  }

  const days = Math.floor(msRemaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((msRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 7) {
    return `${days} days remaining`;
  }

  return `⏰ ${days}d ${hours}h left!`;
}

// ============================================================================
// Season Transition
// ============================================================================

export async function processSeasonEnd(
  repository: {
    fetchAllActivePasses: () => Promise<UserBattlePass[]>;
    archiveSeason: (seasonId: string, passes: UserBattlePass[]) => Promise<void>;
    startNewSeason: (season: BattlePassSeason) => Promise<void>;
    resetUserPasses: () => Promise<void>;
  }
): Promise<{ archived: number; unclaimedRewardsDistributed: number }> {
  const now = Date.now();

  if (now < CURRENT_SEASON.endDate) {
    return { archived: 0, unclaimedRewardsDistributed: 0 };
  }

  try {
    const activePasses = await repository.fetchAllActivePasses();

    // Auto-claim all unclaimed rewards
    let unclaimedCount = 0;
    for (const pass of activePasses) {
      for (let tier = 1; tier <= pass.currentTier; tier++) {
        if (!pass.claimedRewards.includes(tier)) {
          claimTierReward(pass, tier, 'FREE');
          if (pass.hasPremium) {
            claimTierReward(pass, tier, 'PREMIUM');
          }
          unclaimedCount++;
        }
      }
    }

    // Archive and start new season
    await repository.archiveSeason(CURRENT_SEASON.id, activePasses);
    await repository.resetUserPasses();

    eventBus.publish('battle_pass:season_ended', {
      seasonId: CURRENT_SEASON.id,
      userId: 'system', // System event
      finalTier: Math.max(...activePasses.map(p => p.currentTier)),
      timestamp: Date.now(),
    });

    return {
      archived: activePasses.length,
      unclaimedRewardsDistributed: unclaimedCount,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'battle_pass', action: 'season_end' },
    });
    throw error;
  }
}
