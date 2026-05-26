/**
 * Boss Loot Definitions
 *
 * PHASE 12.3 - Boss-specific unique drops
 * Each boss has a signature item that drops on defeat
 *
 * @phase 12.3
 */

export const LootRarity = {
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY',
} as const;

export type LootRarity = typeof LootRarity[keyof typeof LootRarity];

export interface BossLootItem {
  itemId: string;
  name: string;
  description: string;
  icon: string;
  rarity: LootRarity;
  type: 'CONSUMABLE' | 'COSMETIC' | 'BADGE';
  /** Effect description for UI */
  effect: string;
  /** Boss ID that drops this item */
  bossId: string;
  /** Boss name for display */
  bossName: string;
}

/**
 * Boss-specific loot table
 */
export const BOSS_LOOT_TABLE: Record<string, BossLootItem> = {
  // Original boss - The Procrastinator
  'boss-procrastinator': {
    itemId: 'momentum-crystal',
    name: 'Momentum Crystal',
    description: 'A crystallized burst of pure momentum, forged from defeating the urge to delay.',
    icon: '💎',
    rarity: LootRarity.RARE,
    type: 'CONSUMABLE',
    effect: 'Next session starts immediately with 50 pre-earned boss damage',
    bossId: 'boss-procrastinator',
    bossName: 'The Procrastinator',
  },

  // Expansion bosses
  'boss-doomscroller': {
    itemId: 'focus-shield',
    name: 'Focus Shield',
    description: 'A barrier that repels the siren call of notifications and endless feeds.',
    icon: '🛡️',
    rarity: LootRarity.EPIC,
    type: 'CONSUMABLE',
    effect: 'Blocks one interruption from affecting session quality score',
    bossId: 'boss-doomscroller',
    bossName: 'The Doomscroller',
  },

  'boss-burnout-beast': {
    itemId: 'coordinated-focus-crystal',
    name: 'Coordinated Focus Crystal',
    description: 'The essence of synchronized squad energy, captured in crystalline form.',
    icon: '🔮',
    rarity: LootRarity.LEGENDARY,
    type: 'CONSUMABLE',
    effect: '3x damage multiplier for next squad session',
    bossId: 'boss-burnout-beast',
    bossName: 'Burnout Beast',
  },

  'boss-monday-demon': {
    itemId: 'weekend-warrior-badge',
    name: 'Weekend Warrior',
    description: 'A badge of honor for those who bring Monday energy to every day of the week.',
    icon: '🏅',
    rarity: LootRarity.EPIC,
    type: 'BADGE',
    effect: 'Profile cosmetic - shows you defeated the Monday Demon',
    bossId: 'boss-monday-demon',
    bossName: 'The Monday Demon',
  },

  'boss-perfectionist': {
    itemId: 'good-enough-badge',
    name: 'Good Enough',
    description: 'An ironic badge for those who learned that done is better than perfect.',
    icon: '🎯',
    rarity: LootRarity.EPIC,
    type: 'BADGE',
    effect: 'Profile cosmetic - ironic reward from the Perfectionist',
    bossId: 'boss-perfectionist',
    bossName: 'The Perfectionist',
  },

  'boss-midnight-procrastinator': {
    itemId: 'midnight-focus-charm',
    name: 'Midnight Focus Charm',
    description: 'A charm that glows with the light of discipline in the darkest hours.',
    icon: '🌙',
    rarity: LootRarity.RARE,
    type: 'CONSUMABLE',
    effect: '2x focus score for next late-night session (10 PM - 2 AM)',
    bossId: 'boss-midnight-procrastinator',
    bossName: 'Midnight Procrastinator',
  },

  'boss-comparison-trap': {
    itemId: 'mirror-of-self-worth',
    name: 'Mirror of Self-Worth',
    description: 'A mirror that reflects only your own progress, free from the distortion of comparison.',
    icon: '🪞',
    rarity: LootRarity.RARE,
    type: 'CONSUMABLE',
    effect: '2x XP for next session when you beat your personal record',
    bossId: 'boss-comparison-trap',
    bossName: 'The Comparison Trap',
  },
};

/**
 * Get boss-specific loot by boss ID
 */
export function getBossLoot(bossId: string): BossLootItem | null {
  return BOSS_LOOT_TABLE[bossId] || null;
}

/**
 * Get loot for all defeated bosses
 */
export function getLootForDefeatedBosses(bossIds: string[]): BossLootItem[] {
  return bossIds
    .map((id) => BOSS_LOOT_TABLE[id])
    .filter((item): item is BossLootItem => item !== undefined);
}

/**
 * Check if boss has specific loot
 */
export function hasBossLoot(bossId: string): boolean {
  return bossId in BOSS_LOOT_TABLE;
}
