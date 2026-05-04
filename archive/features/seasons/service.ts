/**
 * Seasons Service
 *
 * Business logic and orchestration for season management.
 */

import * as Sentry from '@sentry/react-native';

import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { eventBus } from '../../events';
import { getEconomyService } from '../../economy/EconomyService';
import {
  getCustomerInfo,
  isRevenueCatReady,
  syncPurchases,
} from '../../shared/monetization/revenuecat-service';
import { hasPremiumEntitlement } from '../../shared/monetization/entitlements';
import {
  calculateDaysRemaining,
  calculateSeasonPhase,
  calculateTotalDays,
  shouldTriggerAlmostEnding,
} from './utils';
import * as repository from './repository';
import type {
  AdvanceTierInput,
  CreateSeasonInput,
  PurchasePremiumInput,
  Season,
  SeasonSummary,
  UpdateSeasonInput,
  UserSeasonProgress,
  UserSeasonProgressSummary,
} from './schemas';
import type { SeasonPhase } from './types';

const ALMOST_ENDING_DAYS = 7;
const GRACE_PERIOD_DAYS = 3;
const ACTIVE_SEASON_CACHE_KEY = 'seasons:active-season';
const ACTIVE_SEASON_CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_TIER = 40;
const XP_PER_TIER = 1000;

type RewardDescriptor =
  | { kind: 'COINS'; amount: number }
  | { kind: 'GEMS'; amount: number }
  | { kind: 'CHEST'; itemId: string }
  | { kind: 'BADGE'; badgeId: string };

type TierRewardPlan = {
  free: RewardDescriptor[];
  premium: RewardDescriptor[];
};

type ActiveSeasonCache = {
  expiresAt: number;
  season: Season | null;
};

function captureSeasonError(operation: string, error: unknown, extra?: Record<string, unknown>): void {
  Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
    tags: { feature: 'seasons', operation },
    extra,
  });
}

function getStorage() {
  return getMMKVStorageAdapter();
}

function buildTierRewardPlan(seasonId: string, tier: number): TierRewardPlan {
  const badgeId = `season_${seasonId}_tier_40_exclusive`;

  if (tier === MAX_TIER) {
    return {
      free: [
        { kind: 'CHEST', itemId: 'chest_legendary' },
        { kind: 'COINS', amount: 5000 },
        { kind: 'BADGE', badgeId },
      ],
      premium: [
        { kind: 'CHEST', itemId: 'chest_legendary' },
        { kind: 'COINS', amount: 5000 },
        { kind: 'BADGE', badgeId },
      ],
    };
  }

  if (tier % 10 === 0) {
    return {
      free: [
        { kind: 'CHEST', itemId: 'chest_standard' },
        { kind: 'COINS', amount: 1000 },
      ],
      premium: [
        { kind: 'CHEST', itemId: 'chest_rare' },
        { kind: 'COINS', amount: 1000 },
      ],
    };
  }

  if (tier % 5 === 0) {
    return {
      free: [{ kind: 'COINS', amount: 500 }],
      premium: [{ kind: 'GEMS', amount: 2 }],
    };
  }

  return { free: [], premium: [] };
}

async function applyReward(userId: string, reward: RewardDescriptor, seasonId: string): Promise<void> {
  if (reward.kind === 'COINS') {
    await getEconomyService(userId).addCurrency('COINS', reward.amount, 'SEASON_REWARD', {
      exactAmount: reward.amount,
      seasonId,
    });
    return;
  }

  if (reward.kind === 'GEMS') {
    await getEconomyService(userId).addCurrency('GEMS', reward.amount, 'SEASON_REWARD', {
      exactAmount: reward.amount,
      seasonId,
    });
    return;
  }

  if (reward.kind === 'CHEST') {
    eventBus.publish('inventory:add_item', {
      userId,
      itemId: reward.itemId,
      rarity: reward.itemId.includes('legendary')
        ? 'legendary'
        : reward.itemId.includes('rare')
          ? 'rare'
          : 'common',
      source: 'SEASON_REWARD',
    });
    return;
  }

  eventBus.publish('achievements:unlock_badge', {
    userId,
    badgeId: reward.badgeId,
    rarity: 'legendary',
  });
}

async function getOrCreateUserSeasonProgress(
  userId: string,
  seasonId: string
): Promise<UserSeasonProgress> {
  const existing = await repository.fetchUserSeasonProgress(userId, seasonId);
  if (existing) {
    return existing;
  }

  const progress = await repository.createUserSeasonProgress(userId, seasonId);
  eventBus.publish('season:progress:initialized', {
    userId,
    seasonId,
    timestamp: Date.now(),
  });
  return progress;
}

async function getOrCreateBattlePassRecord(userId: string, seasonId: string) {
  const existing = await repository.fetchUserBattlePass(userId, seasonId);
  if (existing) {
    return existing;
  }

  return repository.createUserBattlePass(userId, seasonId);
}

async function readActiveSeasonCache(): Promise<Season | null> {
  try {
    const raw = await getStorage().getItem(ACTIVE_SEASON_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ActiveSeasonCache;
    if (parsed.expiresAt <= Date.now()) {
      await getStorage().removeItem(ACTIVE_SEASON_CACHE_KEY);
      return null;
    }

    return parsed.season;
  } catch (error) {
    captureSeasonError('readActiveSeasonCache', error);
    return null;
  }
}

async function writeActiveSeasonCache(season: Season | null): Promise<void> {
  try {
    const value: ActiveSeasonCache = {
      expiresAt: Date.now() + ACTIVE_SEASON_CACHE_TTL_MS,
      season,
    };
    await getStorage().setItem(ACTIVE_SEASON_CACHE_KEY, JSON.stringify(value));
  } catch (error) {
    captureSeasonError('writeActiveSeasonCache', error);
  }
}

async function invalidateActiveSeasonCache(): Promise<void> {
  try {
    await getStorage().removeItem(ACTIVE_SEASON_CACHE_KEY);
  } catch (error) {
    captureSeasonError('invalidateActiveSeasonCache', error);
  }
}

async function finalizePremiumState(
  userId: string,
  seasonId: string,
  premiumPurchasedAt: number
): Promise<UserSeasonProgress> {
  await repository.updateUserBattlePass(userId, seasonId, {
    isPremium: true,
    premiumPurchasedAt,
  });

  return repository.updateUserSeasonProgress(userId, seasonId, {
    isPremium: true,
    premiumPurchasedAt,
  });
}

export async function getActiveSeason(): Promise<Season | null> {
  const cached = await readActiveSeasonCache();
  if (cached !== null) {
    return cached;
  }

  try {
    const season = await repository.fetchActiveSeason();
    await writeActiveSeasonCache(season);
    return season;
  } catch (error) {
    captureSeasonError('getActiveSeason', error);
    throw error;
  }
}

export async function getUpcomingSeasons(): Promise<Season[]> {
  return repository.fetchSeasonsByPhase('upcoming');
}

export async function getSeasonById(seasonId: string): Promise<Season | null> {
  return repository.fetchSeasonById(seasonId);
}

export async function getSeasonSummary(seasonId: string): Promise<SeasonSummary | null> {
  const season = await repository.fetchSeasonById(seasonId);
  if (!season) {
    return null;
  }

  const phase = calculateSeasonPhase(season);
  const daysRemaining = calculateDaysRemaining(season);
  const totalDays = calculateTotalDays(season);

  return {
    id: season.id,
    name: season.name,
    theme: season.theme,
    phase,
    daysRemaining,
    totalDays,
    progressPercent:
      phase === 'ARCHIVED'
        ? 100
        : Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)),
  };
}

export async function getSeasonPhase(seasonId: string): Promise<{
  phase: SeasonPhase;
  daysRemaining: number;
  totalDays: number;
  isGracePeriod: boolean;
}> {
  const season = await repository.fetchSeasonById(seasonId);
  if (!season) {
    throw new Error(`Season not found: ${seasonId}`);
  }

  const phase = calculateSeasonPhase(season);
  const daysRemaining = calculateDaysRemaining(season);
  const totalDays = calculateTotalDays(season);

  return {
    phase,
    daysRemaining,
    totalDays,
    isGracePeriod: phase === 'ENDED' && daysRemaining <= GRACE_PERIOD_DAYS,
  };
}

export async function createSeason(input: CreateSeasonInput): Promise<Season> {
  const season = await repository.createSeason(input);
  await invalidateActiveSeasonCache();
  eventBus.publish('season:created', {
    seasonId: season.id,
    name: season.name,
    startAt: season.startAt,
    endAt: season.endAt,
  });
  return season;
}

export async function updateSeason(seasonId: string, input: UpdateSeasonInput): Promise<Season> {
  const season = await repository.updateSeason(seasonId, input);
  await invalidateActiveSeasonCache();
  eventBus.publish('season:updated', { seasonId: season.id, changes: input });
  return season;
}

export async function activateSeason(seasonId: string): Promise<Season> {
  const season = await repository.updateSeason(seasonId, { isActive: true });
  await invalidateActiveSeasonCache();
  eventBus.publish('season:activated', { seasonId: season.id, name: season.name });
  return season;
}

export async function archiveSeason(seasonId: string): Promise<Season> {
  const season = await repository.archiveSeason(seasonId);
  await invalidateActiveSeasonCache();
  eventBus.publish('season:archived', { seasonId: season.id, name: season.name });
  return season;
}

export async function getOrCreateUserProgress(
  userId: string,
  seasonId: string
): Promise<UserSeasonProgress> {
  return getOrCreateUserSeasonProgress(userId, seasonId);
}

export async function getUserProgressSummary(
  userId: string,
  seasonId: string
): Promise<UserSeasonProgressSummary | null> {
  const [progress, season] = await Promise.all([
    repository.fetchUserSeasonProgress(userId, seasonId),
    repository.fetchSeasonById(seasonId),
  ]);

  if (!progress || !season) {
    return null;
  }

  const unclaimedTiers = Math.max(0, progress.currentTier - progress.claimedTiers.length);

  return {
    seasonId,
    currentTier: progress.currentTier,
    tierProgress: Math.min(100, Math.floor((progress.tierXp / season.xpPerTier) * 100)),
    totalProgress: Math.min(
      100,
      Math.floor(
        ((progress.currentTier * season.xpPerTier + progress.tierXp) /
          (season.tierCount * season.xpPerTier)) *
          100
      )
    ),
    isPremium: progress.isPremium,
    nextTierClaimable: unclaimedTiers > 0,
    unclaimedTiers,
  };
}

export async function getUserSeasonProgress(userId: string): Promise<UserSeasonProgress | null> {
  try {
    const season = await getActiveSeason();
    if (!season) {
      return null;
    }

    return getOrCreateUserSeasonProgress(userId, season.id);
  } catch (error) {
    captureSeasonError('getUserSeasonProgress', error, { userId });
    throw error;
  }
}

export async function claimTierReward(
  userId: string,
  tier: number,
  isPremium: boolean
): Promise<{ tier: number; rewards: RewardDescriptor[] }> {
  try {
    const season = await getActiveSeason();
    if (!season) {
      throw new Error('No active season available');
    }

    const [progress, battlePass] = await Promise.all([
      getOrCreateUserSeasonProgress(userId, season.id),
      getOrCreateBattlePassRecord(userId, season.id),
    ]);

    if (progress.currentTier < tier) {
      throw new Error(`Tier ${tier} is not unlocked`);
    }

    const plan = buildTierRewardPlan(season.id, tier);
    const rewards: RewardDescriptor[] = [];

    if (!battlePass.claimedFreeTiers.includes(tier)) {
      for (const reward of plan.free) {
        await applyReward(userId, reward, season.id);
        rewards.push(reward);
      }
      await repository.updateUserBattlePass(userId, season.id, {
        claimedFreeTiers: [...battlePass.claimedFreeTiers, tier],
      });
    }

    if (isPremium && !battlePass.claimedPremiumTiers.includes(tier)) {
      for (const reward of plan.premium) {
        await applyReward(userId, reward, season.id);
        rewards.push(reward);
      }
      await repository.updateUserBattlePass(userId, season.id, {
        claimedPremiumTiers: [...battlePass.claimedPremiumTiers, tier],
      });
    }

    const tierId = await repository.fetchSeasonTierId(season.id, tier);
    if (tierId && !progress.claimedTiers.includes(tierId)) {
      await repository.markTierClaimed(userId, season.id, tierId);
    }

    eventBus.publish('season:tier:claimed', {
      userId,
      seasonId: season.id,
      tierId: tierId ?? `${season.id}:${tier}`,
    });

    return { tier, rewards };
  } catch (error) {
    captureSeasonError('claimTierReward', error, { userId, tier, isPremium });
    throw error;
  }
}

export async function addSeasonXP(
  userId: string,
  amount: number,
  source: string
): Promise<{ newTier: number; tiersGained: number; totalSeasonXp: number }> {
  try {
    if (amount <= 0) {
      return { newTier: 0, tiersGained: 0, totalSeasonXp: 0 };
    }

    const season = await getActiveSeason();
    if (!season) {
      return { newTier: 0, tiersGained: 0, totalSeasonXp: 0 };
    }

    const [progress] = await Promise.all([
      getOrCreateUserSeasonProgress(userId, season.id),
      getOrCreateBattlePassRecord(userId, season.id),
    ]);

    const totalSeasonXp = progress.totalSeasonXp + amount;
    const newTier = Math.min(MAX_TIER, Math.floor(totalSeasonXp / XP_PER_TIER));
    const tierXp = newTier >= MAX_TIER ? 0 : totalSeasonXp % XP_PER_TIER;
    const tiersGained = Math.max(0, newTier - progress.currentTier);

    await Promise.all([
      repository.updateUserSeasonProgress(userId, season.id, {
        totalSeasonXp,
        currentTier: newTier,
        tierXp,
      }),
      repository.updateUserBattlePass(userId, season.id, {
        totalXp: totalSeasonXp,
        currentTier: newTier,
        tierXp,
        isPremium: progress.isPremium,
        premiumPurchasedAt: progress.premiumPurchasedAt,
      }),
    ]);

    for (let nextTier = progress.currentTier + 1; nextTier <= newTier; nextTier += 1) {
      eventBus.publish('season:tier_unlocked', {
        userId,
        seasonId: season.id,
        tier: nextTier,
        source,
      });
      await claimTierReward(userId, nextTier, progress.isPremium);
    }

    return { newTier, tiersGained, totalSeasonXp };
  } catch (error) {
    captureSeasonError('addSeasonXP', error, { userId, amount, source });
    throw error;
  }
}

export async function advanceTier(input: AdvanceTierInput): Promise<{
  newTier: number;
  tiersGained: number;
  overflowXp: number;
}> {
  const result = await addSeasonXP(input.userId, input.xpAmount, input.source);
  return {
    newTier: result.newTier,
    tiersGained: result.tiersGained,
    overflowXp: result.newTier >= MAX_TIER ? 0 : result.totalSeasonXp % XP_PER_TIER,
  };
}

export async function upgradeToPremiumPass(userId: string): Promise<{
  success: boolean;
  retroactiveClaimedTiers: number[];
}> {
  try {
    const season = await getActiveSeason();
    if (!season) {
      throw new Error('No active season available');
    }

    if (isRevenueCatReady()) {
      await syncPurchases();
    }

    const customerInfo = await getCustomerInfo();
    if (!customerInfo.success) {
      throw new Error(customerInfo.error?.message ?? 'Failed to verify RevenueCat purchase');
    }

    if (!hasPremiumEntitlement(customerInfo.entitlements)) {
      throw new Error('No active RevenueCat entitlement found for premium pass');
    }

    const progress = await getOrCreateUserSeasonProgress(userId, season.id);
    if (!progress.isPremium) {
      await finalizePremiumState(userId, season.id, Date.now());
    }

    const retroactiveClaimedTiers: number[] = [];
    for (let tier = 1; tier <= progress.currentTier; tier += 1) {
      const claim = await claimTierReward(userId, tier, true);
      if (claim.rewards.length > 0) {
        retroactiveClaimedTiers.push(tier);
      }
    }

    eventBus.publish('season:premium:purchased', {
      userId,
      seasonId: season.id,
      gemsDeducted: 0,
      paymentMethod: 'REAL_MONEY',
    });

    return { success: true, retroactiveClaimedTiers };
  } catch (error) {
    captureSeasonError('upgradeToPremiumPass', error, { userId });
    throw error;
  }
}

export async function purchasePremium(
  input: PurchasePremiumInput
): Promise<{ success: boolean; gemsDeducted: number }> {
  const season = await repository.fetchSeasonById(input.seasonId);
  if (!season) {
    throw new Error(`Season not found: ${input.seasonId}`);
  }

  if (input.paymentMethod === 'REAL_MONEY') {
    const result = await upgradeToPremiumPass(input.userId);
    return { success: result.success, gemsDeducted: 0 };
  }

  try {
    await getEconomyService(input.userId).spendCurrency(
      'GEMS',
      season.premiumPriceGems,
      `Battle Pass premium upgrade: ${season.name}`,
      { seasonId: season.id }
    );

    await finalizePremiumState(input.userId, season.id, Date.now());
    const progress = await getOrCreateUserSeasonProgress(input.userId, season.id);
    for (let tier = 1; tier <= progress.currentTier; tier += 1) {
      await claimTierReward(input.userId, tier, true);
    }

    eventBus.publish('season:premium:purchased', {
      userId: input.userId,
      seasonId: season.id,
      gemsDeducted: season.premiumPriceGems,
      paymentMethod: input.paymentMethod,
    });

    return { success: true, gemsDeducted: season.premiumPriceGems };
  } catch (error) {
    captureSeasonError('purchasePremium', error, input);
    throw error;
  }
}

export async function markTierClaimed(userId: string, seasonId: string, tierId: string): Promise<void> {
  await repository.markTierClaimed(userId, seasonId, tierId);
  eventBus.publish('season:tier:claimed', { userId, seasonId, tierId });
}

export async function endSeason(seasonId: string): Promise<Season> {
  try {
    const season = await repository.updateSeason(seasonId, {
      isActive: false,
      endAt: Date.now(),
    });

    const supabase = await import('../../config/supabase');
    const { error: functionError } = await supabase.getSupabaseClient().functions.invoke('season-finalize', {
      body: { seasonId },
    });
    if (functionError) {
      throw functionError;
    }

    await invalidateActiveSeasonCache();
    eventBus.publish('season:ended', {
      seasonId: season.id,
      name: season.name,
      gracePeriodEnds: Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    });

    return season;
  } catch (error) {
    captureSeasonError('endSeason', error, { seasonId });
    throw error;
  }
}

export async function checkSeasonTransitions(): Promise<{
  transitioned: boolean;
  actions: string[];
}> {
  const actions: string[] = [];
  const activeSeason = await repository.fetchActiveSeason();

  if (activeSeason) {
    const phase = calculateSeasonPhase(activeSeason);
    const daysRemaining = calculateDaysRemaining(activeSeason);

    if (phase === 'ACTIVE' && daysRemaining <= ALMOST_ENDING_DAYS) {
      if (shouldTriggerAlmostEnding(activeSeason)) {
        eventBus.publish('season:almost_ending', {
          seasonId: activeSeason.id,
          daysRemaining,
        });
        actions.push(`triggered-almost-ending:${activeSeason.id}`);
      }
    }

    if (phase === 'ENDED' && !activeSeason.archivedAt) {
      const graceEnd = activeSeason.endAt + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() > graceEnd) {
        await archiveSeason(activeSeason.id);
        actions.push(`archived:${activeSeason.id}`);
      }
    }
  }

  return {
    transitioned: actions.length > 0,
    actions,
  };
}
