import { eventBus } from "../../events";
import * as repository from "./repository";
import { CreateRewardInputSchema, ClaimRewardInputSchema, CalculateRewardInputSchema, type Reward, type RewardCalculation, type CreateRewardInput, type ClaimRewardInput, type CalculateRewardInput, type Deliverable } from "./schemas";


export function mapRewardTypeToDeliverable(rewardType: string): Deliverable['type'] {
  const mapping: Record<string, Deliverable['type']> = {
    XP: 'XP',
    COINS: 'COINS',
    GEMS: 'GEMS',
    ITEM: 'ITEM',
    COSMETIC: 'COSMETIC',
    TITLE: 'TITLE',
    STREAK_SHIELD: 'SHIELD',
    BOOST: 'XP',
  };
  return mapping[rewardType] || 'XP';
}

export async function getPendingRewards(userId: string): Promise<Reward[]> {
  return repository.fetchRewards(userId, 'PENDING');
}

export async function getRewardHistory(userId: string, limit?: number): Promise<Reward[]> {
  const rewards = await repository.fetchRewards(userId);
  return limit ? rewards.slice(0, limit) : rewards;
}

export async function getRewardStats(userId: string): Promise<{
  totalRewards: number;
  pendingRewards: number;
  claimedRewards: number;
  totalXp: number;
  totalCoins: number;
  totalGems: number;
}> {
  const rewards = await repository.fetchRewards(userId);

  return {
    totalRewards: rewards.length,
    pendingRewards: rewards.filter((r) => r.status === 'PENDING').length,
    claimedRewards: rewards.filter((r) => r.status === 'CLAIMED').length,
    totalXp: rewards.filter((r) => r.status === 'CLAIMED' && r.type === 'XP').reduce((sum, r) => sum + (r.amount || 0), 0),
    totalCoins: rewards.filter((r) => r.status === 'CLAIMED' && r.type === 'COINS').reduce((sum, r) => sum + (r.amount || 0), 0),
    totalGems: rewards.filter((r) => r.status === 'CLAIMED' && r.type === 'GEMS').reduce((sum, r) => sum + (r.amount || 0), 0),
  };
}

export async function processExpiredRewards(): Promise<number> {
  const expired = await repository.fetchExpiredRewards();

  for (const reward of expired) {
    await repository.markRewardExpired(reward.id);
    await repository.recordLedgerEntry(reward.id, 'EXPIRED', {
      expiredAt: Date.now(),
    });
  }

  return expired.length;
}

export function rollMysteryChestDrop(): MysteryChest | null {
  const roll = Math.random();
  let cumulative = 0;

  // Check no-drop first
  if (roll < NO_DROP_CHANCE) {
    return null;
  }

  cumulative += NO_DROP_CHANCE;

  // Roll for rarity
  for (const [rarity, rate] of Object.entries(CHEST_DROP_RATES)) {
    cumulative += rate;
    if (roll < cumulative) {
      return createMysteryChest(rarity as ChestRarity);
    }
  }

  return null; // Should rarely reach here
}

export function getChestAppearance(rarity: ChestRarity): {
  emoji: string;
  color: string;
  glow: boolean;
  label: string;
} {
  switch (rarity) {
    case 'LEGENDARY':
      return { emoji: '🟠', color: '#F59E0B', glow: true, label: 'Legendary' };
    case 'EPIC':
      return { emoji: '🟣', color: '#A855F7', glow: true, label: 'Epic' };
    case 'RARE':
      return { emoji: '🔵', color: '#3B82F6', glow: false, label: 'Rare' };
    case 'UNCOMMON':
      return { emoji: '⚪', color: '#22C55E', glow: false, label: 'Uncommon' };
    default:
      return { emoji: '🟤', color: '#6B7280', glow: false, label: 'Common' };
  }
}

export function generateChestContents(rarity: ChestRarity): {
  xp: number;
  coins: number;
  gems?: number;
  item?: string;
} {
  const multipliers = {
    COMMON: 1,
    UNCOMMON: 1.5,
    RARE: 2.5,
    EPIC: 5,
    LEGENDARY: 10,
  };

  const multiplier = multipliers[rarity];

  return {
    xp: Math.floor((50 + Math.random() * 100) * multiplier),
    coins: Math.floor((20 + Math.random() * 50) * multiplier),
    ...(rarity !== 'COMMON' && rarity !== 'UNCOMMON' ? { gems: Math.floor(Math.random() * 5 * multiplier) } : {}),
    ...(rarity === 'EPIC' || rarity === 'LEGENDARY' ? { item: `${rarity} Mystery Item` } : {}),
  };
}

export const MAX_CHESTS_IN_INVENTORY = 3;

export function canReceiveChest(currentChests: MysteryChest[]): boolean {
  const unopenedCount = currentChests.filter((c) => !c.opened).length;
  return unopenedCount < MAX_CHESTS_IN_INVENTORY;
}