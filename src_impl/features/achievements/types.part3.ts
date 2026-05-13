

export const HIDDEN_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'achievement-3am-session',
    title: 'Night Owl',
    description: '???',
    category: 'SESSION',
    rarity: 'UNCOMMON',
    icon: '🦉',
    isHidden: true,
    progressMax: 1,
    unlockCondition: {
      type: 'SESSION_AT_TIME',
      target: 1,
      comparator: 'GREATER_THAN',
      context: { hour: 3, minute: 0 },
    },
    reward: { coins: 200, xp: 400, badge: 'Night Owl' },
    pointValue: 25,
    shareText: 'Night owl achievement unlocked! 🦉',
    unlockRate: 0.1,
  },
  {
    id: 'achievement-10-sessions-day',
    title: 'Marathon Runner',
    description: '???',
    category: 'SESSION',
    rarity: 'RARE',
    icon: '🏃',
    isHidden: true,
    progressMax: 10,
    unlockCondition: {
      type: 'SESSIONS_IN_DAY',
      target: 10,
      comparator: 'GREATER_THAN',
    },
    reward: { coins: 500, xp: 1000, badge: 'Marathon Runner' },
    pointValue: 50,
    shareText: '10 sessions in one day! Marathon Runner 🏃',
    unlockRate: 0.05,
  },
  {
    id: 'achievement-perfect-s-week',
    title: 'Flawless',
    description: '???',
    category: 'SESSION',
    rarity: 'EPIC',
    icon: '💎',
    isHidden: true,
    progressMax: 7,
    unlockCondition: {
      type: 'S_GRADE_STREAK',
      target: 7,
      comparator: 'GREATER_THAN',
    },
    reward: { coins: 1500, xp: 3000, badge: 'Flawless', cosmetic: 'diamond-aura' },
    pointValue: 100,
    shareText: 'Perfect S-grade week! Flawless 💎',
    unlockRate: 0.005,
  },
  {
    id: 'achievement-comeback-king',
    title: 'Phoenix Rising',
    description: '???',
    category: 'STREAK',
    rarity: 'RARE',
    icon: '🔥',
    isHidden: true,
    progressMax: 1,
    unlockCondition: {
      type: 'COMEBACK_FROM_BREAK',
      target: 1,
      comparator: 'GREATER_THAN',
      context: { days: 30 },
    },
    reward: { coins: 400, xp: 800, badge: 'Phoenix Rising' },
    pointValue: 50,
    shareText: 'Risen from the ashes! Phoenix Rising 🔥',
    unlockRate: 0.15,
  },
  {
    id: 'achievement-all-bosses',
    title: 'Boss Collector',
    description: '???',
    category: 'BOSS',
    rarity: 'LEGENDARY',
    icon: '👹',
    isHidden: true,
    progressMax: 1,
    unlockCondition: {
      type: 'DEFEAT_ALL_BOSSES',
      target: 1,
      comparator: 'EQUALS',
    },
    reward: { coins: 5000, xp: 10000, badge: 'Boss Collector', title: 'Ultimate Hunter' },
    pointValue: 500,
    shareText: 'All bosses defeated! Ultimate Hunter 👹',
    unlockRate: 0.001,
  },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [...DEDICATION_ACHIEVEMENTS, ...STREAK_ACHIEVEMENTS, ...COMBAT_ACHIEVEMENTS, ...SOCIAL_ACHIEVEMENTS, ...HIDDEN_ACHIEVEMENTS];

export const ACHIEVEMENT_COUNT = ALL_ACHIEVEMENTS.length;

export const HIDDEN_ACHIEVEMENT_COUNT = HIDDEN_ACHIEVEMENTS.length;

export function getAchievementById(id: string) {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: string) {
  return ALL_ACHIEVEMENTS.filter((a) => (a as { category: string }).category === category);
}

export function getVisibleAchievements() {
  return ALL_ACHIEVEMENTS.filter((a) => !(a as { isHidden: boolean }).isHidden);
}

export function getHiddenAchievements() {
  return ALL_ACHIEVEMENTS.filter((a) => (a as { isHidden: boolean }).isHidden);
}

export function getAchievementsByTier(tier: string) {
  return ALL_ACHIEVEMENTS.filter((a) => (a as { tier?: string }).tier === tier);
}

export function getAchievementDisplayInfo(
  achievement: Record<string, unknown>,
  isUnlocked: boolean,
): {
  name: string;
  description: string;
  icon: string;
} {
  if (achievement.isHidden && !isUnlocked) {
    return {
      name: '???',
      description: 'This achievement is a mystery...',
      icon: '❓',
    };
  }

  return {
    name: (achievement as { name: string }).name,
    description: (achievement as { description: string }).description,
    icon: (achievement as { icon: string }).icon,
  };
}