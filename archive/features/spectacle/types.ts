/**
 * Spectacle Types
 *
 * Domain types for the spectacle/celebration system.
 * Defines all celebration event types and their payloads.
 */

import type { ViewStyle } from 'react-native';

/**
 * All spectacle types that can be triggered
 */
export enum SpectacleType {
  BOSS_DEFEATED = 'BOSS_DEFEATED',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  LEVEL_UP = 'LEVEL_UP',
  RARE_LOOT_DROP = 'RARE_LOOT_DROP',
  LEGENDARY_LOOT_DROP = 'LEGENDARY_LOOT_DROP',
  PERFECT_SESSION = 'PERFECT_SESSION',
  FIRST_SESSION = 'FIRST_SESSION',
  PRESTIGE = 'PRESTIGE',
  SQUAD_WAR_WON = 'SQUAD_WAR_WON',
  RIVAL_BEATEN = 'RIVAL_BEATEN',
  SEASON_COMPLETED = 'SEASON_COMPLETED',
  MASTERY_RANK_UP = 'MASTERY_RANK_UP',
  COMPANION_EVOLVED = 'COMPANION_EVOLVED',
  MONTHLY_REPORT = 'MONTHLY_REPORT',
  WAGER_WON = 'WAGER_WON',
}

/**
 * Rarity levels for loot drops
 */
export enum LootRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * Haptic feedback patterns
 */
export enum HapticPattern {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HEAVY = 'HEAVY',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  HEAVY_THEN_SUCCESS = 'HEAVY_THEN_SUCCESS',
  CELEBRATION = 'CELEBRATION',
  LEGENDARY = 'LEGENDARY',
}

/**
 * Animation intensity levels
 */
export enum AnimationIntensity {
  SUBTLE = 'SUBTLE',
  NORMAL = 'NORMAL',
  DRAMATIC = 'DRAMATIC',
  EPIC = 'EPIC',
}

/**
 * Base spectacle payload interface
 */
export interface SpectaclePayload {
  userId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Boss defeated payload
 */
export interface BossDefeatedPayload extends SpectaclePayload {
  bossId: string;
  bossName: string;
  encounterId: string;
  damageDealt: number;
  contributors: Array<{
    userId: string;
    displayName: string;
    avatarUrl?: string;
    damageContribution: number;
  }>;
  rewards: Array<{
    type: string;
    amount: number;
    rarity: LootRarity;
  }>;
  /** PHASE 12.3: Boss-specific unique drop */
  bossDrop?: {
    itemId: string;
    name: string;
    description: string;
    icon: string;
    rarity: LootRarity;
    type: 'CONSUMABLE' | 'COSMETIC' | 'BADGE';
  };
  /** PHASE 18.3: Next boss tier for contextual paywall */
  nextBossTier?: number;
}

/**
 * Streak milestone payload
 */
export interface StreakMilestonePayload extends SpectaclePayload {
  streakDays: number;
  previousStreakDays?: number;
  milestone: 3 | 7 | 14 | 30 | 60 | 100;
  rewards?: Array<{
    type: string;
    amount?: number;
    itemId?: string;
  }>;
}

/**
 * Level up payload
 */
export interface LevelUpPayload extends SpectaclePayload {
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
  tierName?: string;
  unlocks?: string[];
}

/**
 * Loot drop payload
 */
export interface LootDropPayload extends SpectaclePayload {
  rarity: LootRarity;
  items: Array<{
    type: string;
    amount: number;
    itemId?: string;
    name: string;
    icon: string;
  }>;
  source: 'SESSION_COMPLETE' | 'BOSS_DEFEAT' | 'MILESTONE' | 'CHEST';
}

/**
 * Perfect session payload
 */
export interface PerfectSessionPayload extends SpectaclePayload {
  userId: string;
  sessionId?: string;
  duration: number;
  score?: number;
  purity?: number;
  bonusXp?: number;
  bonusCoins?: number;
  gemChance?: boolean;
}

/**
 * First session payload
 */
export interface FirstSessionPayload extends SpectaclePayload {
  sessionId: string;
  bossName: string;
  damageDealt: number;
  bossHealthRemaining: number;
}

/**
 * Prestige payload
 */
export interface PrestigePayload extends SpectaclePayload {
  prestigeLevel: number;
  previousMaxLevel: number;
  rewards: Array<{
    type: string;
    amount: number;
  }>;
}

/**
 * Squad war victory payload
 */
export interface SquadWarVictoryPayload extends SpectaclePayload {
  squadId: string;
  squadName: string;
  opponentSquadId: string;
  opponentSquadName: string;
  contributors: Array<{
    userId: string;
    displayName: string;
    avatarUrl?: string;
    contributionScore: number;
  }>;
  rewards: Array<{
    type: string;
    amount: number;
  }>;
}

/**
 * Rival beaten payload
 */
export interface RivalBeatenPayload extends SpectaclePayload {
  rivalId: string;
  rivalName: string;
  duelId: string;
  score: number;
  rivalScore: number;
  rewards: Array<{
    type: string;
    amount: number;
  }>;
}

/**
 * Season completed payload
 */
export interface SeasonCompletedPayload extends SpectaclePayload {
  seasonId: string;
  seasonName: string;
  finalRank: number;
  finalTier: number;
  rewards: Array<{
    type: string;
    amount: number;
    rarity: LootRarity;
  }>;
}

/**
 * Mastery rank up payload
 */
export interface MasteryRankUpPayload extends SpectaclePayload {
  oldRank: string;
  newRank: string;
  totalPoints: number;
  unlockedFeatures: string[];
}

/**
 * Companion evolved payload - PHASE 13.2
 */
export interface CompanionEvolvedPayload extends SpectaclePayload {
  oldPhase: string;
  newPhase: string;
  totalFocusMinutes: number;
  element: string;
}

/**
 * Monthly report payload - BONUS PHASE
 */
export interface MonthlyReportPayload extends SpectaclePayload {
  month: string;
  startingScore: number;
  endingScore: number;
  change: number;
  sessionsCompleted: number;
  grade: string;
  highlight: string;
}

/**
 * Wager won payload - BONUS PHASE
 */
export interface WagerWonPayload extends SpectaclePayload {
  amount: number;
  wagerId: string;
}

/**
 * Union type of all spectacle payloads
 */
export type SpectaclePayloadUnion =
  | BossDefeatedPayload
  | StreakMilestonePayload
  | LevelUpPayload
  | LootDropPayload
  | PerfectSessionPayload
  | FirstSessionPayload
  | PrestigePayload
  | SquadWarVictoryPayload
  | RivalBeatenPayload
  | SeasonCompletedPayload
  | MasteryRankUpPayload
  | CompanionEvolvedPayload
  | MonthlyReportPayload
  | WagerWonPayload;

/**
 * Type map for spectacle payloads
 */
export interface SpectaclePayloadMap {
  [SpectacleType.BOSS_DEFEATED]: BossDefeatedPayload;
  [SpectacleType.STREAK_MILESTONE]: StreakMilestonePayload;
  [SpectacleType.LEVEL_UP]: LevelUpPayload;
  [SpectacleType.RARE_LOOT_DROP]: LootDropPayload;
  [SpectacleType.LEGENDARY_LOOT_DROP]: LootDropPayload;
  [SpectacleType.COMPANION_EVOLVED]: CompanionEvolvedPayload;
  [SpectacleType.PERFECT_SESSION]: PerfectSessionPayload;
  [SpectacleType.FIRST_SESSION]: FirstSessionPayload;
  [SpectacleType.PRESTIGE]: PrestigePayload;
  [SpectacleType.SQUAD_WAR_WON]: SquadWarVictoryPayload;
  [SpectacleType.RIVAL_BEATEN]: RivalBeatenPayload;
  [SpectacleType.SEASON_COMPLETED]: SeasonCompletedPayload;
  [SpectacleType.MASTERY_RANK_UP]: MasteryRankUpPayload;
  [SpectacleType.MONTHLY_REPORT]: MonthlyReportPayload;
  [SpectacleType.WAGER_WON]: WagerWonPayload;
}

/**
 * Animation configuration for a spectacle
 */
export interface AnimationConfig {
  intensity: AnimationIntensity;
  duration: number;
  delay?: number;
  staggerDelay?: number;
  style?: ViewStyle;
}

/**
 * Spectacle event with full configuration
 */
export interface SpectacleEvent {
  type: SpectacleType;
  payload: SpectaclePayloadUnion;
  animation: AnimationConfig;
  haptic: HapticPattern;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

/**
 * Spectacle listener function type
 */
export type SpectacleListener = (event: SpectacleEvent) => void;

/**
 * Options for triggering a spectacle
 */
export interface TriggerSpectacleOptions {
  skipAnimation?: boolean;
  skipHaptic?: boolean;
  customDuration?: number;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Spectacle queue entry
 */
export interface SpectacleQueueEntry {
  id: string;
  event: SpectacleEvent;
  options: TriggerSpectacleOptions;
  timestamp: number;
}

/**
 * Current spectacle state
 */
export interface SpectacleState {
  currentEvent: SpectacleEvent | null;
  queue: SpectacleQueueEntry[];
  isPlaying: boolean;
  lastPlayedAt: number | null;
}
