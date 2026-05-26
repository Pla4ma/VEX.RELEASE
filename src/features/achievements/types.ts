export type AchievementCategory =
  | 'SESSION'
  | 'STREAK'
  | 'BOSS'
  | 'SOCIAL'
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
    coins?: number;
    xp?: number;
    gems?: number;
    badge?: string;
    title?: string;
    cosmetic?: string;
    itemId?: string;
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
    description: 'Complete your first focus session',
    category: 'SESSION',
    rarity: 'COMMON',
    icon: '🌱',
    isHidden: false,
    progressMax: 1,
    unlockCondition: { type: 'SESSION_COMPLETE', target: 1, comparator: 'GREATER_THAN' },
    reward: { coins: 50, xp: 100 },
    pointValue: 10,
    shareText: 'I just started my focus journey! 🌱',
    unlockRate: 0.95,
  },
  {
    id: 'achievement-100-sessions',
    title: 'Centurion',
    description: 'Complete 100 focus sessions',
    category: 'SESSION',
    rarity: 'UNCOMMON',
    icon: '💯',
    isHidden: false,
    progressMax: 100,
    unlockCondition: { type: 'SESSION_COMPLETE', target: 100, comparator: 'CUMULATIVE' },
    reward: { coins: 200, xp: 500, badge: 'Centurion' },
    pointValue: 25,
    shareText: '100 sessions complete! Building momentum 💯',
    unlockRate: 0.45,
  },
  {
    id: 'achievement-1000-sessions',
    title: 'Session Master',
    description: 'Complete 1,000 focus sessions',
    category: 'SESSION',
    rarity: 'RARE',
    icon: '🏆',
    isHidden: false,
    progressMax: 1000,
    unlockCondition: { type: 'SESSION_COMPLETE', target: 1000, comparator: 'CUMULATIVE' },
    reward: { coins: 500, xp: 1500, badge: 'Session Master', title: 'The Focused' },
    pointValue: 50,
    shareText: '1000 sessions! The grind never stops 🏆',
    unlockRate: 0.12,
  },
];
