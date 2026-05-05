/**
 * Battle Pass Service
 * Business logic for battle pass progression and rewards
 */

import * as repository from './repository';
import { eventBus } from '../../events';
import { addCurrency, spendCurrency } from '../economy/service';
import type {
  BattlePass,
  BattlePassTier,
  UserBattlePass,
  UserBattlePassSummary,
  TierDisplay,
  ClaimStatus,
  TierReward,
  ClaimResult,
  TierAdvanceResult,
  PremiumPurchaseResult,
  RetroactiveClaimResult,
  AddBattlePassXpInput,
  ClaimTierInput,
  PurchasePremiumInput,
} from './schemas';

// ============================================================================
// User Progress Management
// ============================================================================

export async function getOrCreateUserBattlePass(userId: string, seasonId: string): Promise<UserBattlePass> {
  let progress = await repository.fetchUserBattlePass(userId, seasonId);
  if (!progress) {
    progress = await repository.createUserBattlePass(userId, seasonId);
  }
  return progress;
}

export async function getUserBattlePassSummary(userId: string, seasonId: string): Promise<UserBattlePassSummary | null> {
  const [userBp, battlePass] = await Promise.all([
    repository.fetchUserBattlePass(userId, seasonId),
    repository.fetchBattlePassBySeason(seasonId),
  ]);

  if (!userBp || !battlePass) {return null;}

  const unclaimedFree = userBp.currentTier - userBp.claimedFreeTiers.length;
  const unclaimedPremium = userBp.isPremium
    ? userBp.currentTier - userBp.claimedPremiumTiers.length
    : 0;

  return {
    seasonId,
    currentTier: userBp.currentTier,
    tierProgress: Math.min(100, Math.floor((userBp.tierXp / battlePass.xpPerTier) * 100)),
    totalProgress: Math.min(100, Math.floor((userBp.currentTier / battlePass.tierCount) * 100)),
    isPremium: userBp.isPremium,
    canClaimFree: unclaimedFree > 0,
    canClaimPremium: unclaimedPremium > 0 && userBp.isPremium,
    unclaimedFreeTiers: Math.max(0, unclaimedFree),
    unclaimedPremiumTiers: Math.max(0, unclaimedPremium),
    nextTierUnlocked: userBp.tierXp >= battlePass.xpPerTier,
    xpToNextTier: Math.max(0, battlePass.xpPerTier - userBp.tierXp),
  };
}

// ============================================================================
// XP and Tier Progression
// ============================================================================

export async function addBattlePassXp(input: AddBattlePassXpInput): Promise<TierAdvanceResult> {
  const { userId, seasonId, xpAmount, source } = input;

  const [userBp, battlePass, tiers] = await Promise.all([
    getOrCreateUserBattlePass(userId, seasonId),
    repository.fetchBattlePassBySeason(seasonId),
    repository.fetchBattlePassTiers(seasonId),
  ]);

  if (!battlePass) {throw new Error('Battle pass not found');}

  const previousTier = userBp.currentTier;
  let currentTier = userBp.currentTier;
  let tierXp = userBp.tierXp + xpAmount;
  let tiersGained = 0;

  while (tierXp >= battlePass.xpPerTier && currentTier < battlePass.tierCount) {
    tierXp -= battlePass.xpPerTier;
    currentTier++;
    tiersGained++;
  }

  if (currentTier >= battlePass.tierCount) {
    currentTier = battlePass.tierCount;
    tierXp = 0;
  }

  await repository.updateUserBattlePass(userId, seasonId, {
    currentTier,
    tierXp,
    totalXp: userBp.totalXp + xpAmount,
  });

  const newUnlockedTiers: number[] = [];
  for (let i = previousTier + 1; i <= currentTier; i++) {
    newUnlockedTiers.push(i);
    eventBus.publish('season:tier_unlocked', { userId, seasonId, tier: i, source });
  }

  return {
    previousTier,
    newTier: currentTier,
    tiersGained,
    newUnlockedTiers,
    milestoneReached: tiersGained > 0,
  };
}

// ============================================================================
// Tier Claiming
// ============================================================================

export async function claimTier(input: ClaimTierInput): Promise<ClaimResult> {
  const { userId, seasonId, tierNumber, track } = input;

  const [userBp, battlePass, tiers] = await Promise.all([
    repository.fetchUserBattlePass(userId, seasonId),
    repository.fetchBattlePassBySeason(seasonId),
    repository.fetchBattlePassTiers(seasonId),
  ]);

  if (!userBp || !battlePass) {
    return { success: false, tierNumber, track, rewards: [], error: 'Battle pass not found' };
  }

  if (tierNumber > userBp.currentTier) {
    return { success: false, tierNumber, track, rewards: [], error: 'Tier not unlocked' };
  }

  if (track === 'PREMIUM' && !userBp.isPremium) {
    return { success: false, tierNumber, track, rewards: [], error: 'Premium required' };
  }

  const claimedTiers = track === 'FREE' ? userBp.claimedFreeTiers : userBp.claimedPremiumTiers;
  if (claimedTiers.includes(tierNumber)) {
    return { success: false, tierNumber, track, rewards: [], error: 'Already claimed' };
  }

  await repository.markTierClaimed(userId, seasonId, tierNumber, track);

  const tier = tiers.find(t => t.tierNumber === tierNumber);
  const reward = track === 'FREE' ? tier?.freeReward : tier?.premiumReward;

  const eventRewards = reward ? [{ type: reward.type, amount: reward.amount ?? undefined, itemId: reward.itemId ?? undefined }] : [];
  eventBus.publish('season:tier:claimed', { userId, seasonId, tier: tierNumber, rewards: eventRewards, timestamp: Date.now() });

  return {
    success: true,
    tierNumber,
    track,
    rewards: reward ? [reward] : [],
    error: null,
  };
}

export async function claimAllAvailable(userId: string, seasonId: string): Promise<{
  freeClaimed: number;
  premiumClaimed: number;
  rewards: TierReward[];
}> {
  const summary = await getUserBattlePassSummary(userId, seasonId);
  if (!summary) {return { freeClaimed: 0, premiumClaimed: 0, rewards: [] };}

  const results: ClaimResult[] = [];

  // Claim free tiers
  for (let i = 1; i <= summary.currentTier; i++) {
    const result = await claimTier({ userId, seasonId, tierNumber: i, track: 'FREE' });
    if (result.success) {results.push(result);}
  }

  // Claim premium tiers if applicable
  if (summary.isPremium) {
    for (let i = 1; i <= summary.currentTier; i++) {
      const result = await claimTier({ userId, seasonId, tierNumber: i, track: 'PREMIUM' });
      if (result.success) {results.push(result);}
    }
  }

  const freeClaimed = results.filter(r => r.track === 'FREE').length;
  const premiumClaimed = results.filter(r => r.track === 'PREMIUM').length;
  const rewards = results.flatMap(r => r.rewards);

  return { freeClaimed, premiumClaimed, rewards };
}

// ============================================================================
// Premium Purchase
// ============================================================================

export async function purchasePremium(input: PurchasePremiumInput): Promise<PremiumPurchaseResult> {
  const { userId, seasonId, paymentMethod } = input;

  const [userBp, battlePass] = await Promise.all([
    repository.fetchUserBattlePass(userId, seasonId),
    repository.fetchBattlePassBySeason(seasonId),
  ]);

  if (!userBp || !battlePass) {
    return { success: false, gemsDeducted: 0, previousTier: 0, newRewardsUnlocked: [], error: 'Battle pass not found' };
  }

  if (userBp.isPremium) {
    return { success: false, gemsDeducted: 0, previousTier: userBp.currentTier, newRewardsUnlocked: [], error: 'Already premium' };
  }

  const gemsDeducted = paymentMethod === 'GEMS' ? battlePass.premiumPriceGems : 0;
  let gemsSpent = false;
  let premiumGranted = false;
  let retroactive: RetroactiveClaimResult = {
    claimedTiers: [],
    claimedRewards: [],
    totalValue: 0,
  };

  try {
    if (gemsDeducted > 0) {
      await spendCurrency({
        userId,
        currency: 'GEMS',
        amount: gemsDeducted,
        sink: 'UPGRADE',
        description: `Battle pass premium upgrade: ${seasonId}`,
        metadata: { seasonId, source: 'BATTLE_PASS_PREMIUM_PURCHASE' },
      });
      gemsSpent = true;
    }

    await repository.updateUserBattlePass(userId, seasonId, {
      isPremium: true,
      premiumPurchasedAt: Date.now(),
    });
    premiumGranted = true;

    retroactive = await claimRetroactivePremium(userId, seasonId, userBp.currentTier);
  } catch (error) {
    const rollbackErrors: string[] = [];

    if (premiumGranted) {
      try {
        await repository.updateUserBattlePass(userId, seasonId, {
          isPremium: false,
          premiumPurchasedAt: null,
        });
      } catch (rollbackError) {
        rollbackErrors.push(
          rollbackError instanceof Error
            ? rollbackError.message
            : 'Failed to revoke premium battle pass access'
        );
      }
    }

    if (gemsSpent) {
      try {
        await addCurrency({
          userId,
          currency: 'GEMS',
          amount: gemsDeducted,
          source: 'REFUND',
          skipEvents: false,
          description: 'Battle pass premium refund',
          metadata: {
            seasonId,
            source: 'BATTLE_PASS_PREMIUM_PURCHASE_ROLLBACK',
          },
        });
      } catch (rollbackError) {
        rollbackErrors.push(
          rollbackError instanceof Error
            ? rollbackError.message
            : 'Failed to refund battle pass premium gems'
        );
      }
    }

    const message = error instanceof Error ? error.message : 'Premium purchase failed';
    const errorMessage = rollbackErrors.length > 0
      ? `${message}. Rollback failed: ${rollbackErrors.join('; ')}`
      : message;

    return {
      success: false,
      gemsDeducted: 0,
      previousTier: userBp.currentTier,
      newRewardsUnlocked: [],
      error: errorMessage,
    };
  }

  eventBus.publish('season:premium:purchased', { userId, seasonId, tier: userBp.currentTier, gemsSpent: gemsDeducted, timestamp: Date.now() });

  return {
    success: true,
    gemsDeducted,
    previousTier: userBp.currentTier,
    newRewardsUnlocked: retroactive.claimedRewards,
    error: null,
  };
}

async function claimRetroactivePremium(
  userId: string,
  seasonId: string,
  currentTier: number
): Promise<RetroactiveClaimResult> {
  const tiers = await repository.fetchBattlePassTiers(seasonId);
  const claimedTiers: number[] = [];
  const claimedRewards: TierReward[] = [];
  let totalValue = 0;

  for (let i = 1; i <= currentTier; i++) {
    const tier = tiers.find(t => t.tierNumber === i);
    if (tier?.premiumReward) {
      await repository.markTierClaimed(userId, seasonId, i, 'PREMIUM');
      claimedTiers.push(i);
      claimedRewards.push(tier.premiumReward);
      totalValue += tier.premiumReward.amount || 0;
    }
  }

  return { claimedTiers, claimedRewards, totalValue };
}

// ============================================================================
// Display Generation
// ============================================================================

export async function getBattlePassDisplay(userId: string, seasonId: string): Promise<{
  tiers: TierDisplay[];
  currentTier: number;
  tierXp: number;
  isPremium: boolean;
} | null> {
  const [userBp, tiers] = await Promise.all([
    repository.fetchUserBattlePass(userId, seasonId),
    repository.fetchBattlePassTiers(seasonId),
  ]);

  if (!userBp) {return null;}

  const tierDisplays: TierDisplay[] = tiers.map(tier => {
    const isUnlocked = tier.tierNumber <= userBp.currentTier;
    const isNext = tier.tierNumber === userBp.currentTier + 1;
    const isFreeClaimed = userBp.claimedFreeTiers.includes(tier.tierNumber);
    const isPremiumClaimed = userBp.claimedPremiumTiers.includes(tier.tierNumber);

    const getFreeStatus = (): ClaimStatus => {
      if (isFreeClaimed) {return 'CLAIMED';}
      if (!isUnlocked) {return 'LOCKED';}
      return 'AVAILABLE';
    };

    const getPremiumStatus = (): ClaimStatus => {
      if (isPremiumClaimed) {return 'CLAIMED';}
      if (!userBp.isPremium) {return 'PREMIUM_REQUIRED';}
      if (!isUnlocked) {return 'LOCKED';}
      return 'AVAILABLE';
    };

    return {
      tierNumber: tier.tierNumber,
      xpRequired: tier.xpRequired,
      isUnlocked,
      isClaimed: isFreeClaimed && (isPremiumClaimed || !userBp.isPremium),
      isNext,
      freeReward: tier.freeReward ?? null,
      premiumReward: tier.premiumReward ?? null,
      freeStatus: getFreeStatus(),
      premiumStatus: getPremiumStatus(),
      isMajorMilestone: tier.isMajorMilestone,
    };
  });

  return {
    tiers: tierDisplays,
    currentTier: userBp.currentTier,
    tierXp: userBp.tierXp,
    isPremium: userBp.isPremium,
  };
}
