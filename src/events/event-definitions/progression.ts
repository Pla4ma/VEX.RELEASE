/**
 * Progression Event Definitions
 *
 * Event interfaces for the progression system: XP gains, level ups,
 * achievement unlocks, and milestone events.
 */

export type ProgressionEventType =
  | 'progression:xp_earned'
  | 'progression:level_up'
  | 'progression:economy_activity'
  | 'progression:achievement_unlocked'
  | 'progression:milestone_reached';

export interface ProgressionXpEarnedEvent {
  userId: string;
  xp: number;
  source: string;
  sourceId?: string;
  previousTotal: number;
  newTotal: number;
  leveledUp: boolean;
}

export interface ProgressionLevelUpEvent {
  userId: string;
  previousLevel: number;
  newLevel: number;
  xpOverflow: number;
  nextLevelThreshold: number;
  rewards: {
    coins: number;
    gems: number;
    unlockedFeatures?: string[];
    unlockedItems?: string[];
  };
  timestamp: number;
}

export interface ProgressionAchievementUnlockedEvent {
  userId: string;
  achievementId: string;
  achievementType: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
  unlockedAt: number;
}

export interface ProgressionMilestoneReachedEvent {
  userId: string;
  milestoneId: string;
  milestoneType: string;
  value: number;
  reward?: { type: string; amount: number };
}
