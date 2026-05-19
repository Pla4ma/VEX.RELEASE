import type { ChestReward } from './variable-reward-system';

export interface ChestDropConfig {
  name: string;
  color: string;
  guaranteedRewards: Array<{ type: string; minAmount: number; maxAmount: number }>;
  bonusRolls: number;
  dropTable: Array<{ reward: ChestReward; weight: number }>;
}

export const CHEST_DROP_TABLES: Record<string, ChestDropConfig> = {
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

export const MYSTERY_MULTIPLIER_TABLE = [
  { multiplier: 2, chance: 0.05, rarity: 'UNCOMMON' },
  { multiplier: 3, chance: 0.02, rarity: 'RARE' },
  { multiplier: 5, chance: 0.005, rarity: 'EPIC' },
  { multiplier: 10, chance: 0.001, rarity: 'LEGENDARY' },
];

export const CHEST_ICONS: Record<string, string> = {
  COMMON: '\uD83D\uDCE6', RARE: '\uD83D\uDC8E', EPIC: '\u2728', LEGENDARY: '\uD83D\uDC51', MYTHIC: '\uD83C\uDF1F',
};

export const MULTIPLIER_DISPLAYS: Record<number, { text: string; color: string; celebration: string }> = {
  2: { text: '2X BONUS!', color: '#4CAF50', celebration: 'Nice!' },
  3: { text: '3X BONUS!', color: '#2196F3', celebration: 'Great!' },
  5: { text: '5X JACKPOT!', color: '#9C27B0', celebration: 'Amazing!' },
  10: { text: '10X LEGENDARY!', color: '#FF9800', celebration: 'INCREDIBLE!' },
};

export const RARITY_VALUE: Record<string, number> = {
  COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5,
};
