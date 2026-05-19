import { z } from 'zod';
import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import {
  CHEST_DROP_TABLES, MYSTERY_MULTIPLIER_TABLE,
  CHEST_ICONS, MULTIPLIER_DISPLAYS, RARITY_VALUE,
} from './chest-config';

export const ChestTypeSchema = z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC']);
export const ChestRewardSchema = z.object({
  type: z.enum([
    'COINS', 'GEMS', 'XP_BOOST', 'STREAK_SHIELD',
    'COSMETIC', 'TITLE', 'BOSS_RETRY', 'ENERGY_REFILL',
  ]),
  amount: z.number().int().min(1),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
  dropChance: z.number().min(0).max(1),
});
export const ChestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: ChestTypeSchema,
  source: z.enum([
    'DAILY_REWARD', 'BATTLE_PASS', 'BOSS_DEFEAT',
    'SHOP_PURCHASE', 'ACHIEVEMENT', 'EVENT',
  ]),
  opened: z.boolean().default(false),
  rewards: z.array(ChestRewardSchema).nullable(),
  createdAt: z.number(),
  openedAt: z.number().nullable(),
});
export const MysteryMultiplierSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  multiplier: z.number().min(2).max(10),
  chance: z.number().min(0).max(1),
  triggered: z.boolean().default(false),
  sessionId: z.string().uuid().nullable(),
  triggeredAt: z.number().nullable(),
  expiresAt: z.number().nullable(),
});

export type ChestType = z.infer<typeof ChestTypeSchema>;
export type ChestReward = z.infer<typeof ChestRewardSchema>;
export type Chest = z.infer<typeof ChestSchema>;
export type MysteryMultiplier = z.infer<typeof MysteryMultiplierSchema>;

function formatHighlight(bestReward: ChestReward | null): string {
  if (!bestReward) return 'Standard rewards';
  const emojis: Record<string, string> = {
    COMMON: '\u2B1C', UNCOMMON: '\uD83D\uDFE9', RARE: '\uD83D\uDFE6', EPIC: '\uD83D\uDFEA', LEGENDARY: '\uD83D\uDFE7',
  };
  return `${emojis[bestReward.rarity] ?? ''} ${bestReward.rarity} ${bestReward.type}!`;
}

export function generateChest(
  userId: string,
  type: ChestType,
  source: Chest['source'],
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

export function openChest(
  chest: Chest,
): { chest: Chest; rewards: ChestReward[]; totalValue: { coins: number; gems: number }; highlight: string } {
  if (chest.opened) {
    return {
      chest,
      rewards: chest.rewards ?? [],
      totalValue: { coins: 0, gems: 0 },
      highlight: 'Already opened',
    };
  }

  const config = CHEST_DROP_TABLES[chest.type];
  if (!config) {
    return { chest, rewards: [], totalValue: { coins: 0, gems: 0 }, highlight: 'No config' };
  }

  const rewards: ChestReward[] = [];
  let totalCoins = 0;
  let totalGems = 0;

  for (const guaranteed of config.guaranteedRewards) {
    const amount = Math.floor(Math.random() * (guaranteed.maxAmount - guaranteed.minAmount + 1)) + guaranteed.minAmount;
    rewards.push({
      type: guaranteed.type as ChestReward['type'],
      amount,
      rarity: 'COMMON',
      dropChance: 1.0,
    });
    if (guaranteed.type === 'COINS') totalCoins += amount;
    if (guaranteed.type === 'GEMS') totalGems += amount;
  }

  let bestReward: ChestReward | null = null;

  for (let i = 0; i < config.bonusRolls; i++) {
    const roll = Math.random() * 100;
    let cumulativeWeight = 0;
    for (const entry of config.dropTable) {
      cumulativeWeight += entry.weight;
      if (roll <= cumulativeWeight) {
        const reward = { ...entry.reward };
        const variation = 0.8 + Math.random() * 0.4;
        reward.amount = Math.floor(reward.amount * variation);
        rewards.push(reward);
        if (reward.type === 'COINS') totalCoins += reward.amount;
        if (reward.type === 'GEMS') totalGems += reward.amount;
        if (!bestReward || (RARITY_VALUE[reward.rarity] ?? 0) > (RARITY_VALUE[bestReward.rarity] ?? 0)) {
          bestReward = reward;
        }
        break;
      }
    }
  }

  const openedChest: Chest = { ...chest, opened: true, rewards, openedAt: Date.now() };

  eventBus.publish('chest:opened', {
    userId: chest.userId,
    chestId: chest.id,
    rewards,
  });
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

export function rollMysteryMultiplier(
  userId: string,
  sessionId: string,
): MysteryMultiplier | null {
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
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    }
  }
  return null;
}

export function applyMysteryMultiplier(
  baseXp: number,
  multiplier: MysteryMultiplier | null,
): { finalXp: number; wasMultiplied: boolean; multiplierValue: number } {
  if (!multiplier || !multiplier.triggered) {
    return { finalXp: baseXp, wasMultiplied: false, multiplierValue: 1 };
  }
  const finalXp = Math.floor(baseXp * multiplier.multiplier);
  eventBus.publish('mystery_multiplier:applied', {
    userId: multiplier.userId,
    multiplierValue: multiplier.multiplier,
    sessionId: multiplier.sessionId,
  });
  return { finalXp, wasMultiplied: true, multiplierValue: multiplier.multiplier };
}

export function getChestDisplay(
  type: ChestType,
): { name: string; color: string; icon: string; description: string; animation: string } {
  const config = CHEST_DROP_TABLES[type];
  const animation = type === 'MYTHIC' ? 'rainbow-pulse' : type === 'LEGENDARY' ? 'glow-pulse' : 'bounce';
  return {
    name: config?.name ?? type,
    color: config?.color ?? '#757575',
    icon: CHEST_ICONS[type] ?? '\uD83D\uDCE6',
    description: config
      ? `${config.guaranteedRewards.length} guaranteed + ${config.bonusRolls} bonus rewards`
      : '',
    animation,
  };
}

export function getMultiplierDisplay(
  multiplier: number,
): { text: string; color: string; celebration: string } {
  return MULTIPLIER_DISPLAYS[multiplier] ?? {
    text: `${multiplier}X`,
    color: '#757575',
    celebration: 'Bonus!',
  };
}

export function formatChestOpeningSequence(
  _chestType: ChestType,
  rewards: ChestReward[],
): Array<{ delay: number; reward: ChestReward; revealType: 'slide' | 'pop' | 'spin' }> {
  const revealTypes: Array<'slide' | 'pop' | 'spin'> = ['slide', 'pop', 'spin', 'slide', 'pop'];
  return rewards.map((reward, index) => ({
    delay: index * 800,
    reward,
    revealType: revealTypes[index % revealTypes.length]!,
  }));
}

export function trackChestAnalytics(
  chestType: ChestType,
  rewards: ChestReward[],
  source: Chest['source'],
): void {
  const rarityCounts: Record<string, number> = {
    COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0,
  };
  rewards.forEach((r) => {
    const count = rarityCounts[r.rarity];
    if (count !== undefined) rarityCounts[r.rarity] = count + 1;
  });
  Sentry.addBreadcrumb({
    category: 'chest_analytics',
    message: `${chestType} chest opened from ${source}`,
    data: { chestType, source, totalRewards: rewards.length, rarityDistribution: rarityCounts },
  });
}
