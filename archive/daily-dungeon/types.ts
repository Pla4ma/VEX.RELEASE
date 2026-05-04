/**
 * Daily Dungeon System - VEX 10/10 Transformation
 *
 * Creates daily anticipation and FOMO:
 * - One unique boss per day with special mechanics
 * - Guaranteed rare drop on first clear
 * - Leaderboards for fastest kill
 * - 24-hour rotation creates urgency
 *
 * @phase 5 - Daily Hook Engineering
 */

import { z } from 'zod';

// ============================================================================
// Daily Dungeon Types
// ============================================================================

export const DungeonDifficultySchema = z.enum(['NORMAL', 'HARD', 'NIGHTMARE']);
export type DungeonDifficulty = z.infer<typeof DungeonDifficultySchema>;

export interface DailyDungeon {
  id: string;
  date: string; // YYYY-MM-DD
  bossId: string;
  bossName: string;
  bossAvatarUrl: string;

  // Special mechanics for this dungeon
  specialMechanic: string;
  mechanicDescription: string;

  // Rewards
  guaranteedDrop: DungeonReward;
  bonusRewards: DungeonReward[];

  // Difficulty scaling
  baseHealth: number;
  healthScaling: number;

  // Time limit
  timeLimitMinutes: number;

  // Theme
  theme: 'VOID' | 'FLAME' | 'FROST' | 'STORM' | 'LIGHT' | 'SHADOW';
}

export interface DungeonReward {
  id: string;
  type: 'ITEM' | 'COINS' | 'TOKENS' | 'MATERIAL' | 'COSMETIC';
  itemId?: string;
  amount?: number;
  rarity: 'RARE' | 'EPIC' | 'LEGENDARY';
  guaranteed: boolean;
}

export interface UserDungeonAttempt {
  userId: string;
  dungeonId: string;
  date: string;

  // Attempt tracking
  attempts: number;
  bestTimeSeconds: number | null;
  bestDamage: number;
  completed: boolean;
  completedAt: number | null;

  // Rewards claimed
  claimedRewards: string[];
}

export interface DungeonLeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  timeSeconds: number;
  damageDealt: number;
  rank: number;
}

// ============================================================================
// Dungeon Rotation Schedule
// ============================================================================

export const DUNGEON_ROTATION: Array<{
  dayOfWeek: number;
  theme: DailyDungeon['theme'];
  bossName: string;
  mechanic: string;
  difficultyModifier: number;
}> = [
  { dayOfWeek: 0, theme: 'VOID', bossName: 'Void Leviathan', mechanic: 'REGENERATION', difficultyModifier: 1.0 },
  { dayOfWeek: 1, theme: 'FLAME', bossName: 'Inferno Titan', mechanic: 'BURNING_AURA', difficultyModifier: 1.1 },
  { dayOfWeek: 2, theme: 'FROST', bossName: 'Glacier Colossus', mechanic: 'FREEZING_TOUCH', difficultyModifier: 1.1 },
  { dayOfWeek: 3, theme: 'STORM', bossName: 'Thunder Behemoth', mechanic: 'CHAIN_LIGHTNING', difficultyModifier: 1.2 },
  { dayOfWeek: 4, theme: 'LIGHT', bossName: 'Radiant Seraph', mechanic: 'BLINDING_LIGHT', difficultyModifier: 1.2 },
  { dayOfWeek: 5, theme: 'SHADOW', bossName: 'Shadow Wraith', mechanic: 'PHASING', difficultyModifier: 1.3 },
  { dayOfWeek: 6, theme: 'VOID', bossName: 'Abyssal Horror', mechanic: 'CONSUMPTION', difficultyModifier: 1.3 },
];

export function getTodayDungeon(): typeof DUNGEON_ROTATION[0] {
  const dayOfWeek = new Date().getDay();
  return DUNGEON_ROTATION.find(d => d.dayOfWeek === dayOfWeek) || DUNGEON_ROTATION[0];
}

// ============================================================================
// Special Mechanics
// ============================================================================

export const DUNGEON_MECHANICS: Record<string, {
  name: string;
  description: string;
  playerImpact: string;
  counterStrategy: string;
}> = {
  REGENERATION: {
    name: 'Void Regeneration',
    description: 'Boss regenerates 5% HP every 30 seconds',
    playerImpact: 'Must defeat quickly or damage will be undone',
    counterStrategy: 'Use Sprint mode for burst damage',
  },
  BURNING_AURA: {
    name: 'Burning Aura',
    description: 'Taking damage reduces purity over time',
    playerImpact: 'Lower purity = less damage dealt',
    counterStrategy: 'Maintain high purity with Deep Work mode',
  },
  FREEZING_TOUCH: {
    name: 'Freezing Touch',
    description: 'Pauses cost double purity',
    playerImpact: 'Pausing is very punishing',
    counterStrategy: 'Commit to uninterrupted session',
  },
  CHAIN_LIGHTNING: {
    name: 'Chain Lightning',
    description: 'Damage is reduced if session quality drops',
    playerImpact: 'Must maintain consistent focus',
    counterStrategy: 'Use Study mode for steady progress',
  },
  BLINDING_LIGHT: {
    name: 'Blinding Light',
    description: 'Timer is hidden after 50% boss health',
    playerImpact: 'Must feel the time internally',
    counterStrategy: 'Internal clock training',
  },
  PHASING: {
    name: 'Shadow Phasing',
    description: 'Boss takes 50% reduced damage from same mode twice in a row',
    playerImpact: 'Must vary session modes',
    counterStrategy: 'Switch between two modes',
  },
  CONSUMPTION: {
    name: 'Abyssal Consumption',
    description: 'If boss not defeated in 45 min, fail and lose streak progress',
    playerImpact: 'High stakes time pressure',
    counterStrategy: 'Bring your best loadout',
  },
};

// ============================================================================
// Reward Generation
// ============================================================================

export function generateDailyRewards(
  theme: DailyDungeon['theme'],
  dayOfWeek: number
): { guaranteed: DungeonReward; bonus: DungeonReward[] } {
  // Guaranteed reward based on day
  const guaranteedRewards: Record<number, DungeonReward> = {
    0: { id: 'sun_void', type: 'MATERIAL', rarity: 'RARE', guaranteed: true, amount: 5 },
    1: { id: 'mon_flame', type: 'ITEM', rarity: 'RARE', guaranteed: true, itemId: 'ember_shard' },
    2: { id: 'tue_frost', type: 'COSMETIC', rarity: 'EPIC', guaranteed: true, itemId: 'frost_aura' },
    3: { id: 'wed_storm', type: 'TOKENS', rarity: 'EPIC', guaranteed: true, amount: 50 },
    4: { id: 'thu_light', type: 'ITEM', rarity: 'EPIC', guaranteed: true, itemId: 'radiant_core' },
    5: { id: 'fri_shadow', type: 'COINS', rarity: 'RARE', guaranteed: true, amount: 2000 },
    6: { id: 'sat_abyss', type: 'ITEM', rarity: 'LEGENDARY', guaranteed: true, itemId: 'abyssal_relic' },
  };

  const guaranteed = guaranteedRewards[dayOfWeek];

  // Bonus rewards (random)
  const bonus: DungeonReward[] = [
    { id: 'bonus_coins', type: 'COINS', rarity: 'RARE', guaranteed: false, amount: 500 },
    { id: 'bonus_material', type: 'MATERIAL', rarity: 'RARE', guaranteed: false, itemId: 'dungeon_essence', amount: 3 },
  ];

  return { guaranteed, bonus };
}

// ============================================================================
// Time Remaining Display
// ============================================================================

export function getTimeUntilReset(): { hours: number; minutes: number; totalMs: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const totalMs = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, totalMs };
}

export function getUrgencyMessage(hoursRemaining: number): string {
  if (hoursRemaining < 2) {
    return '⚠️ Dungeon resets in under 2 hours! Complete now or miss today\'s reward!';
  }
  if (hoursRemaining < 6) {
    return `⏰ Only ${hoursRemaining} hours left to defeat today's boss`;
  }
  return `📅 ${hoursRemaining} hours remaining to challenge the ${getTodayDungeon().bossName}`;
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createDailyDungeon(date: string): DailyDungeon {
  const rotation = getTodayDungeon();
  const mechanic = DUNGEON_MECHANICS[rotation.mechanic];
  const rewards = generateDailyRewards(rotation.theme, new Date(date).getDay());

  return {
    id: `dungeon_${date}`,
    date,
    bossId: `daily_${rotation.theme.toLowerCase()}`,
    bossName: rotation.bossName,
    bossAvatarUrl: `bosses/${rotation.theme.toLowerCase()}.png`,
    specialMechanic: rotation.mechanic,
    mechanicDescription: mechanic.description,
    guaranteedDrop: rewards.guaranteed,
    bonusRewards: rewards.bonus,
    baseHealth: 10000 * rotation.difficultyModifier,
    healthScaling: 0.1,
    timeLimitMinutes: 45,
    theme: rotation.theme,
  };
}

export function createInitialAttempt(userId: string, dungeonId: string): UserDungeonAttempt {
  const date = new Date().toISOString().split('T')[0];

  return {
    userId,
    dungeonId,
    date,
    attempts: 0,
    bestTimeSeconds: null,
    bestDamage: 0,
    completed: false,
    completedAt: null,
    claimedRewards: [],
  };
}
