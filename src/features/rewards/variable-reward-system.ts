/**
 * Variable Reward System
 * Chests with random rewards using gacha mechanics
 * Mystery multipliers with surprise bonuses
 * Creates anticipation and "jackpot" moments
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const ChestTypeSchema = z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC']);

export const ChestRewardSchema = z.object({
  type: z.enum(['COINS', 'GEMS', 'XP_BOOST', 'STREAK_SHIELD', 'COSMETIC', 'TITLE', 'BOSS_RETRY', 'ENERGY_REFILL']),
  amount: z.number().int().min(1),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
  dropChance: z.number().min(0).max(1),
});

export const ChestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: ChestTypeSchema,
  source: z.enum(['DAILY_REWARD', 'BATTLE_PASS', 'BOSS_DEFEAT', 'SHOP_PURCHASE', 'ACHIEVEMENT', 'EVENT']),
  opened: z.boolean().default(false),
  rewards: z.array(ChestRewardSchema).nullable(),
  createdAt: z.number(),
  openedAt: z.number().nullable(),
});

export const MysteryMultiplierSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  multiplier: z.number().min(2).max(10),
  chance: z.number().min(0).max(1), // Base chance (e.g., 0.05 = 5%)
  triggered: z.boolean().default(false),
  sessionId: z.string().uuid().nullable(),
  triggeredAt: z.number().nullable(),
  expiresAt: z.number().nullable(),
});

// ============================================================================
// Chest Drop Tables (Gacha Rates)
// ============================================================================

const CHEST_DROP_TABLES: Record<string, {
  name: string;
  color: string;
  guaranteedRewards: Array<{ type: string; minAmount: number; maxAmount: number }>;
  bonusRolls: number;
  dropTable: Array<{ reward: any; weight: number }>;
}> = {
  COMMON: {
    name: 'Common Chest',
    color: '#9E9E9E',
    guaranteedRewards: [{ type: 'COINS', minAmount: 25, maxAmount: 75 }],
    bonusRolls: 1,
    dropTable: [
      { reward: { type: 'COINS', amount: 50, rarity: 'COMMON', dropChance: 0.6 }, weight: 60 },
      { reward: { type: 'XP_BOOST', amount: 1, rarity: 'UNCOMMON', dropChance: 0.25 }, weight: 25 },
      { reward: { type: 'GEMS', amount: 5, rarity: 'RARE', dropChance: 0.15 }, weight: 15 },
    ],
  },
  RARE: {
    name: 'Rare Chest',
    color: '#2196F3',
    guaranteedRewards: [{ type: 'COINS', minAmount: 100, maxAmount: 200 }],
    bonusRolls: 2,
    dropTable: [
      { reward: { type: 'COINS', amount: 150, rarity: 'COMMON', dropChance: 0.45 }, weight: 45 },
      { reward: { type: 'XP_BOOST', amount: 2, rarity: 'UNCOMMON', dropChance: 0.3 }, weight: 30 },
      { reward: { type: 'GEMS', amount: 15, rarity: 'RARE', dropChance: 0.2 }, weight: 20 },
      { reward: { type: 'STREAK_SHIELD', amount: 1, rarity: 'EPIC', dropChance: 0.05 }, weight: 5 },
    ],
  },
  EPIC: {
    name: 'Epic Chest',
    color: '#9C27B0',
    guaranteedRewards: [
      { type: 'COINS', minAmount: 300, maxAmount: 500 },
      { type: 'GEMS', minAmount: 20, maxAmount: 30 },
    ],
    bonusRolls: 3,
    dropTable: [
      { reward: { type: 'COINS', amount: 400, rarity: 'COMMON', dropChance: 0.35 }, weight: 35 },
      { reward: { type: 'GEMS', amount: 50, rarity: 'UNCOMMON', dropChance: 0.3 }, weight: 30 },
      { reward: { type: 'STREAK_SHIELD', amount: 2, rarity: 'RARE', dropChance: 0.2 }, weight: 20 },
      { reward: { type: 'BOSS_RETRY', amount: 1, rarity: 'EPIC', dropChance: 0.1 }, weight: 10 },
      { reward: { type: 'COSMETIC', amount: 1, rarity: 'LEGENDARY', dropChance: 0.05 }, weight: 5 },
    ],
  },
  LEGENDARY: {
    name: 'Legendary Chest',
    color: '#FF9800',
    guaranteedRewards: [
      { type: 'COINS', minAmount: 1000, maxAmount: 2000 },
      { type: 'GEMS', minAmount: 100, maxAmount: 150 },
    ],
    bonusRolls: 5,
    dropTable: [
      { reward: { type: 'GEMS', amount: 200, rarity: 'UNCOMMON', dropChance: 0.3 }, weight: 30 },
      { reward: { type: 'STREAK_SHIELD', amount: 5, rarity: 'RARE', dropChance: 0.25 }, weight: 25 },
      { reward: { type: 'BOSS_RETRY', amount: 3, rarity: 'RARE', dropChance: 0.2 }, weight: 20 },
      { reward: { type: 'COSMETIC', amount: 1, rarity: 'EPIC', dropChance: 0.15 }, weight: 15 },
      { reward: { type: 'TITLE', amount: 1, rarity: 'LEGENDARY', dropChance: 0.1 }, weight: 10 },
    ],
  },
  MYTHIC: {
    name: 'Mythic Chest',
    color: '#F44336',
    guaranteedRewards: [
      { type: 'COINS', minAmount: 5000, maxAmount: 10000 },
      { type: 'GEMS', minAmount: 500, maxAmount: 1000 },
    ],
    bonusRolls: 10,
    dropTable: [
      { reward: { type: 'GEMS', amount: 1000, rarity: 'RARE', dropChance: 0.4 }, weight: 40 },
      { reward: { type: 'COSMETIC', amount: 3, rarity: 'EPIC', dropChance: 0.3 }, weight: 30 },
      { reward: { type: 'TITLE', amount: 1, rarity: 'LEGENDARY', dropChance: 0.2 }, weight: 20 },
      { reward: { type: 'ENERGY_REFILL', amount: 10, rarity: 'LEGENDARY', dropChance: 0.1 }, weight: 10 },
    ],
  },
};

// ============================================================================
// Mystery Multiplier Configuration
// ============================================================================

const MYSTERY_MULTIPLIER_TABLE = [
  { multiplier: 2, chance: 0.05, rarity: 'UNCOMMON' },
  { multiplier: 3, chance: 0.02, rarity: 'RARE' },
  { multiplier: 5, chance: 0.005, rarity: 'EPIC' },
  { multiplier: 10, chance: 0.001, rarity: 'LEGENDARY' },
];

// ============================================================================
// Types
// ============================================================================

export type ChestType = z.infer<typeof ChestTypeSchema>;
export type ChestReward = z.infer<typeof ChestRewardSchema>;
export type Chest = z.infer<typeof ChestSchema>;
export type MysteryMultiplier = z.infer<typeof MysteryMultiplierSchema>;

// ============================================================================
// Chest Generation & Opening
// ============================================================================

export function generateChest(
  userId: string,
  type: ChestType,
  source: Chest['source']
): Chest {
  return ChestSchema.parse({
    id: crypto.randomUUID(),
    userId,
    type,
    source,
    opened: false,
    rewards: null,
    createdAt: Date.now(),
    openedAt: null,
  });
}

export function openChest(chest: Chest): {
  chest: Chest;
  rewards: ChestReward[];
  totalValue: { coins: number; gems: number };
  highlight: string; // Best reward for celebration
} {
  if (chest.opened) {
    return {
      chest,
      rewards: chest.rewards || [],
      totalValue: { coins: 0, gems: 0 },
      highlight: 'Already opened',
    };
  }

  const config = CHEST_DROP_TABLES[chest.type];
  const rewards: ChestReward[] = [];
  let totalCoins = 0;
  let totalGems = 0;

  // Add guaranteed rewards
  for (const guaranteed of config.guaranteedRewards) {
    const amount = Math.floor(
      Math.random() * (guaranteed.maxAmount - guaranteed.minAmount + 1)
    ) + guaranteed.minAmount;
    
    rewards.push({
      type: guaranteed.type as ChestReward['type'],
      amount,
      rarity: 'COMMON',
      dropChance: 1.0,
    });

    if (guaranteed.type === 'COINS') totalCoins += amount;
    if (guaranteed.type === 'GEMS') totalGems += amount;
  }

  // Roll bonus rewards
  let bestReward: ChestReward | null = null;
  for (let i = 0; i < config.bonusRolls; i++) {
    const roll = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const entry of config.dropTable) {
      cumulativeWeight += entry.weight;
      if (roll <= cumulativeWeight) {
        const reward = { ...entry.reward };
        
        // Amount variation (+/- 20%)
        const variation = 0.8 + Math.random() * 0.4;
        reward.amount = Math.floor(reward.amount * variation);

        rewards.push(reward);

        if (reward.type === 'COINS') totalCoins += reward.amount;
        if (reward.type === 'GEMS') totalGems += reward.amount;

        // Track best reward
        const rarityValue = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 };
        if (!bestReward || (rarityValue as any)[reward.rarity] > (rarityValue as any)[bestReward.rarity]) {
          bestReward = reward;
        }
        break;
      }
    }
  }

  const openedChest: Chest = {
    ...chest,
    opened: true,
    rewards,
    openedAt: Date.now(),
  };

  // Publish event
  eventBus.publish('chest:opened', {
    userId: chest.userId,
    chestId: chest.id,
    rewards,
    totalCoins,
    totalGems,
  } as any);

  Sentry.addBreadcrumb({
    category: 'variable_rewards',
    message: `${chest.type} chest opened`,
    data: { chestType: chest.type, totalCoins, totalGems, rewardCount: rewards.length },
  });

  return {
    chest: openedChest,
    rewards,
    totalValue: { coins: totalCoins, gems: totalGems },
    highlight: formatHighlight(bestReward),
  };
}

function formatHighlight(bestReward: ChestReward | null): string {
  if (!bestReward) return 'Standard rewards';
  
  const rarityEmojis: Record<string, string> = {
    COMMON: '⚪',
    UNCOMMON: '🟢',
    RARE: '🔵',
    EPIC: '🟣',
    LEGENDARY: '🟠',
  };

  return `${rarityEmojis[bestReward.rarity]} ${bestReward.rarity} ${bestReward.type}!`;
}

// ============================================================================
// Mystery Multiplier System
// ============================================================================

export function rollMysteryMultiplier(userId: string, sessionId: string): MysteryMultiplier | null {
  const roll = Math.random();
  let cumulativeChance = 0;

  for (const entry of MYSTERY_MULTIPLIER_TABLE) {
    cumulativeChance += entry.chance;
    if (roll <= cumulativeChance) {
      return MysteryMultiplierSchema.parse({
        id: crypto.randomUUID(),
        userId,
        multiplier: entry.multiplier,
        chance: entry.chance,
        triggered: true,
        sessionId,
        triggeredAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours to use
      });
    }
  }

  return null; // No multiplier triggered
}

export function applyMysteryMultiplier(
  baseXp: number,
  multiplier: MysteryMultiplier | null
): { finalXp: number; wasMultiplied: boolean; multiplierValue: number } {
  if (!multiplier || !multiplier.triggered) {
    return { finalXp: baseXp, wasMultiplied: false, multiplierValue: 1 };
  }

  const finalXp = Math.floor(baseXp * multiplier.multiplier);

  // Publish celebration event
  eventBus.publish('mystery_multiplier:applied', {
    userId: multiplier.userId,
    baseXp,
    finalXp,
    multiplier: multiplier.multiplier,
    sessionId: multiplier.sessionId,
  } as any);

  return { finalXp, wasMultiplied: true, multiplierValue: multiplier.multiplier };
}

// ============================================================================
// UI Helpers
// ============================================================================

export function getChestDisplay(type: ChestType): {
  name: string;
  color: string;
  icon: string;
  description: string;
  animation: string;
} {
  const config = CHEST_DROP_TABLES[type];
  const icons: Record<string, string> = {
    COMMON: '📦',
    RARE: '💎',
    EPIC: '👑',
    LEGENDARY: '🔥',
    MYTHIC: '🌟',
  };

  return {
    name: config.name,
    color: config.color,
    icon: icons[type],
    description: `${config.guaranteedRewards.length} guaranteed + ${config.bonusRolls} bonus rewards`,
    animation: type === 'MYTHIC' ? 'rainbow-pulse' : type === 'LEGENDARY' ? 'glow-pulse' : 'bounce',
  };
}

export function getMultiplierDisplay(multiplier: number): {
  text: string;
  color: string;
  celebration: string;
} {
  const displays: Record<number, { text: string; color: string; celebration: string }> = {
    2: { text: '2X BONUS!', color: '#4CAF50', celebration: 'Nice!' },
    3: { text: '3X BONUS!', color: '#2196F3', celebration: 'Great!' },
    5: { text: '5X JACKPOT!', color: '#9C27B0', celebration: 'Amazing!' },
    10: { text: '10X LEGENDARY!', color: '#FF9800', celebration: 'INCREDIBLE!' },
  };

  return displays[multiplier] || { text: `${multiplier}X`, color: '#757575', celebration: 'Bonus!' };
}

export function formatChestOpeningSequence(
  chestType: ChestType,
  rewards: ChestReward[]
): Array<{
  delay: number;
  reward: ChestReward;
  revealType: 'slide' | 'pop' | 'spin';
}> {
  const revealTypes: Array<'slide' | 'pop' | 'spin'> = ['slide', 'pop', 'spin', 'slide', 'pop'];
  
  return rewards.map((reward, index) => ({
    delay: index * 800, // 800ms between each reveal
    reward,
    revealType: revealTypes[index % revealTypes.length],
  }));
}

// ============================================================================
// Analytics
// ============================================================================

export function trackChestAnalytics(
  chestType: ChestType,
  rewards: ChestReward[],
  source: Chest['source']
): void {
  const rarityCounts: Record<string, number> = { COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
  rewards.forEach((r) => rarityCounts[r.rarity]++);

  Sentry.addBreadcrumb({
    category: 'chest_analytics',
    message: `${chestType} chest opened from ${source}`,
    data: {
      chestType,
      source,
      totalRewards: rewards.length,
      rarityDistribution: rarityCounts,
    },
  });
}
