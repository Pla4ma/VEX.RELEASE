import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


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

export function generateChest(userId: string, type: ChestType, source: Chest['source']): Chest {
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
    const amount = Math.floor(Math.random() * (guaranteed.maxAmount - guaranteed.minAmount + 1)) + guaranteed.minAmount;

    rewards.push({
      type: guaranteed.type as ChestReward['type'],
      amount,
      rarity: 'COMMON',
      dropChance: 1.0,
    });

    if (guaranteed.type === 'COINS') {
      totalCoins += amount;
    }
    if (guaranteed.type === 'GEMS') {
      totalGems += amount;
    }
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

        if (reward.type === 'COINS') {
          totalCoins += reward.amount;
        }
        if (reward.type === 'GEMS') {
          totalGems += reward.amount;
        }

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