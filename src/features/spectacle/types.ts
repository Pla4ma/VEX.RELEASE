export enum SpectacleType {
  MONTHLY_REPORT = 'MONTHLY_REPORT',
  LEVEL_UP = 'LEVEL_UP',
  BOSS_DEFEATED = 'BOSS_DEFEATED',
  BOSS_DEFEAT = 'BOSS_DEFEAT',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',
  PERFECT_SESSION = 'PERFECT_SESSION',
  FIRST_SESSION = 'FIRST_SESSION',
  RARE_LOOT_DROP = 'RARE_LOOT_DROP',
  LEGENDARY_LOOT_DROP = 'LEGENDARY_LOOT_DROP',
  MASTERY_RANK_UP = 'MASTERY_RANK_UP',
  SQUAD_WAR_WON = 'SQUAD_WAR_WON',
  WAGER_WON = 'WAGER_WON',
}

export enum LootRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface SpectacleEvent {
  id: string;
  type: SpectacleType;
  title: string;
  body: string;
  createdAt: number;
}

export interface SpectaclePayload {
  userId?: string;
  title?: string;
  body?: string;
  rarity?: LootRarity;
  [key: string]: unknown;
}

export type SpectacleListener = (event: SpectacleEvent) => void;
