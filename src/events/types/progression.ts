/**
 * Progression Events
 */

export interface ProgressionEventDefinitions {
  'progression:add-xp': {
    userId: string;
    amount: number;
    source: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };
  'progression:add_xp': {
    userId: string;
    amount: number;
    source: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };
  'progression:xp_added': {
    userId: string;
    amount: number;
    source: string;
    totalXP: number;
    currentLevel: number;
    progressPercent: number;
    streakBonus: number;
    boostBonus: number;
  };
  'progression:level_up': {
    userId: string;
    newLevel: number;
    previousLevel: number;
    totalXP: number;
    xpToNextLevel: number;
    prestige: number;
    source: string;
    rewards: string[];
  };
  'progression:prestige': {
    userId: string;
    prestige: number;
    previousLevel: number;
    resetXP: number;
    multiplier: number;
  };
  'social:level_up': { userId: string; newLevel: number; timestamp: number };
  'social:prestige': {
    userId: string;
    prestige: number;
    previousLevel: number;
    timestamp: number;
    seasonalBonus: number;
    badge: string;
    rewards: string[];
  };
  'progression:xp_earned': {
    userId: string;
    xp: number;
    source: string;
    sessionId?: string;
    bossId?: string;
  };
  'progression:economy_activity': {
    userId: string;
    currency: string;
    amount: number;
    type: string;
    source: string;
  };
  'focus_tower:block_added': {
    userId: string;
    block: unknown;
    newTotal: number;
    tierUp: boolean;
    milestoneReached?: number;
  };
  'focus_tower:tier_up': {
    userId: string;
    tier?: number;
    previousTier?: number;
    newTier?: number;
    tierName?: string;
  };
  'focus_tower:milestone': {
    userId: string;
    milestone: string | number;
    value?: number;
    totalBlocks?: number;
  };
  'focus_tower:decay': {
    userId: string;
    daysInactive: number;
    decayAmount: number;
  };
  'focus_tower:restored': {
    userId: string;
    restoredTier: number;
    previousTier: number;
  };
  'mastery:unlocks': {
    userId: string;
    trackId: string;
    unlocks: string[];
    timestamp: number;
  };
  'prestige:available': {
    userId: string;
    prestigeLevel: number;
    requirements: string[];
    timestamp: number;
  };
  'progression:activate_boost': {
    userId: string;
    boostType: string;
    multiplier: number;
    duration: number;
  };
}
