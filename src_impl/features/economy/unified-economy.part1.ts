import { z } from "zod";


export const CurrencySchema = z.enum(['COINS', 'TOKENS']);

export const ItemRaritySchema = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);

export function calculateUpgradeCost(item: Item): UpgradeCost {
  const rarityMultiplier: Record<ItemRarity, number> = {
    COMMON: 1,
    UNCOMMON: 1.5,
    RARE: 2.5,
    EPIC: 4,
    LEGENDARY: 6,
  };

  const baseCost = 100 * Math.pow(1.5, item.level);

  return {
    coins: Math.floor(baseCost * rarityMultiplier[item.rarity]),
    materials: [
      { materialId: 'upgrade_shard', count: Math.floor(item.level / 2) + 1 },
      { materialId: 'essence_common', count: Math.max(1, 5 - item.level) },
    ],
  };
}

export function calculateUpgradeSuccessChance(item: Item): number {
  // Higher levels = lower success chance
  const baseChance = 0.95;
  const levelPenalty = item.level * 0.015;
  const rarityBonus: Record<ItemRarity, number> = {
    COMMON: 0.05,
    UNCOMMON: 0.03,
    RARE: 0,
    EPIC: -0.05,
    LEGENDARY: -0.1,
  };

  return Math.max(0.1, Math.min(1, baseChance - levelPenalty + rarityBonus[item.rarity]));
}

export const DURABILITY_LOSS_PER_SESSION = 5;

export function calculateDurabilityLoss(sessionDuration: number, bossFight: boolean, damageTaken: boolean): number {
  let loss = DURABILITY_LOSS_PER_SESSION;

  if (bossFight) {
    loss *= 1.5;
  }
  if (damageTaken) {
    loss *= 2;
  }

  return Math.floor(loss);
}

export function calculateRepairCost(item: Item): number {
  const durabilityLost = item.maxDurability - item.durability;
  const baseRepairCost = 10; // 10 coins per durability point

  return durabilityLost * baseRepairCost * (1 + item.level * 0.1);
}

export function repairItem(item: Item, _coinCost: number): Item {
  return {
    ...item,
    durability: item.maxDurability,
  };
}

export const VOID_CHESTS: LootTable[] = [
  {
    id: 'void_chest_basic',
    name: 'Basic Void Chest',
    cost: { currency: 'COINS', amount: 1000 },
    drops: [
      { itemId: 'material_common', weight: 40, rarity: 'COMMON' },
      { itemId: 'upgrade_shard', weight: 30, rarity: 'COMMON' },
      { itemId: 'equipment_common', weight: 20, rarity: 'UNCOMMON' },
      { itemId: 'equipment_rare', weight: 8, rarity: 'RARE' },
      { itemId: 'gem_red', weight: 2, rarity: 'EPIC' },
    ],
  },
  {
    id: 'void_chest_premium',
    name: 'Premium Void Chest',
    cost: { currency: 'TOKENS', amount: 100 },
    drops: [
      { itemId: 'material_rare', weight: 35, rarity: 'UNCOMMON' },
      { itemId: 'equipment_rare', weight: 30, rarity: 'RARE' },
      { itemId: 'gem_any', weight: 15, rarity: 'EPIC' },
      { itemId: 'equipment_epic', weight: 15, rarity: 'EPIC' },
      { itemId: 'equipment_legendary', weight: 4, rarity: 'LEGENDARY' },
      { itemId: 'cosmetic_exclusive', weight: 1, rarity: 'LEGENDARY' },
    ],
  },
];

export function rollLoot(table: LootTable): LootDrop {
  const totalWeight = table.drops.reduce((sum, d) => sum + d.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const drop of table.drops) {
    roll -= drop.weight;
    if (roll <= 0) {
      return drop;
    }
  }

  return table.drops[table.drops.length - 1];
}

export const TRADING_POST_CONFIG = {
  taxPercent: 10,
  maxListingsPerUser: 10,
  listingDurationDays: 7,
  minPrice: 100,
  maxPrice: 1000000,
};

export function calculateTradeTax(price: number): number {
  return Math.floor(price * (TRADING_POST_CONFIG.taxPercent / 100));
}

export function canListItem(userListings: number, item: Item, price: number): { allowed: boolean; reason: string | null } {
  if (userListings >= TRADING_POST_CONFIG.maxListingsPerUser) {
    return { allowed: false, reason: `Max ${TRADING_POST_CONFIG.maxListingsPerUser} listings allowed` };
  }
  if (price < TRADING_POST_CONFIG.minPrice) {
    return { allowed: false, reason: `Minimum price is ${TRADING_POST_CONFIG.minPrice} coins` };
  }
  if (price > TRADING_POST_CONFIG.maxPrice) {
    return { allowed: false, reason: `Maximum price is ${TRADING_POST_CONFIG.maxPrice} coins` };
  }
  if (item.durability < item.maxDurability) {
    return { allowed: false, reason: 'Cannot list damaged items' };
  }

  return { allowed: true, reason: null };
}

export const EARNING_RATES = {
  // Base session rewards
  BASE_COINS_PER_MINUTE: 5,
  PURITY_BONUS_MULTIPLIER: 1.5, // 50% bonus for 90%+ purity

  // Boss rewards
  BOSS_DEFEAT_BASE: 500,
  BOSS_DAMAGE_PER_POINT: 0.5,

  // Streak rewards
  STREAK_7_BONUS: 200,
  STREAK_14_BONUS: 500,
  STREAK_30_BONUS: 1500,

  // Daily login
  DAILY_LOGIN_BASE: 100,
  DAILY_LOGIN_STREAK_MULTIPLIER: 1.1,

  // Achievement one-time rewards
  ACHIEVEMENT_COMMON: 500,
  ACHIEVEMENT_RARE: 2000,
  ACHIEVEMENT_EPIC: 5000,
  ACHIEVEMENT_LEGENDARY: 10000,
};

export function calculateSessionCoins(durationMinutes: number, purityScore: number, streakDays: number, bossDefeated: boolean): number {
  let coins = durationMinutes * EARNING_RATES.BASE_COINS_PER_MINUTE;

  // Purity bonus
  if (purityScore >= 90) {
    coins *= EARNING_RATES.PURITY_BONUS_MULTIPLIER;
  }

  // Streak bonus (applies after 7 days)
  if (streakDays >= 30) {
    coins += EARNING_RATES.STREAK_30_BONUS;
  } else if (streakDays >= 14) {
    coins += EARNING_RATES.STREAK_14_BONUS;
  } else if (streakDays >= 7) {
    coins += EARNING_RATES.STREAK_7_BONUS;
  }

  // Boss bonus
  if (bossDefeated) {
    coins += EARNING_RATES.BOSS_DEFEAT_BASE;
  }

  return Math.floor(coins);
}