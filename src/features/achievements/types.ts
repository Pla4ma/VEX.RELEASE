export type AchievementCategory =
  | 'SESSION'
  | 'STREAK'
  | 'BOSS'
  | 'SOCIAL'
  | 'STUDY'
  | 'PROGRESSION'
  | 'ECONOMY';

export type AchievementRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY';

export interface AchievementCondition {
  type: string;
  target: number;
  comparator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CUMULATIVE';
  context?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  isHidden: boolean;
  isDeprecated?: boolean;
  progressMax: number;
  currentProgress?: number;
  unlockCondition: AchievementCondition;
  pointValue: number;
  reward: {
    insight?: string;
    proof?: string;
    badge?: string;
    title?: string;
    cosmetic?: string;
    itemId?: string;
    /** @deprecated Use insight/proof instead */
    coins?: number;
    /** @deprecated Use insight/proof instead */
    xp?: number;
    /** @deprecated */
    gems?: number;
  };
  shareText: string;
  unlockedAt?: number;
  unlockRate?: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  progressHistory: Array<{
    timestamp: number;
    progress: number;
    source: string;
  }>;
}

export const DEDICATION_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'achievement-first-session',
    title: 'First Steps',
    description: 'VEX recorded your first focus session',
    category: 'SESSION',
    rarity: 'COMMON',
    icon: '🌱',
    isHidden: false,
    progressMax: 1,
    unlockCondition: {
      type: 'SESSION_COMPLETE',
      target: 1,
      comparator: 'GREATER_THAN',
    },
    reward: { insight: 'First pattern recorded' },
    pointValue: 10,
    shareText: 'I just started my focus journey! 🌱',
    unlockRate: 0.95,
  },
  {
    id: 'achievement-100-sessions',
    title: '100 Milestone',
    description: 'VEX has learned from 100 of your sessions',
    category: 'SESSION',
    rarity: 'UNCOMMON',
    icon: '💯',
    isHidden: false,
    progressMax: 100,
    unlockCondition: {
      type: 'SESSION_COMPLETE',
      target: 100,
      comparator: 'CUMULATIVE',
    },
    reward: { insight: 'Strong momentum pattern detected', badge: 'Centurion' },
    pointValue: 25,
    shareText: '100 sessions — VEX knows my rhythm 💯',
    unlockRate: 0.45,
  },
  {
    id: 'achievement-1000-sessions',
    title: 'Depth Milestone',
    description: 'VEX has deep understanding from 1,000 sessions',
    category: 'SESSION',
    rarity: 'RARE',
    icon: '🏆',
    isHidden: false,
    progressMax: 1000,
    unlockCondition: {
      type: 'SESSION_COMPLETE',
      target: 1000,
      comparator: 'CUMULATIVE',
    },
    reward: {
      insight: 'VEX can predict your optimal focus windows',
      badge: 'Session Master',
      title: 'The Focused',
    },
    pointValue: 50,
    shareText: '1,000 sessions! VEX knows me deeply 🏆',
    unlockRate: 0.12,
  },
];
