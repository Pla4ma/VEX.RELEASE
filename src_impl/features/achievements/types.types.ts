export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: AchievementCategory;
    rarity: AchievementRarity;
    icon: string;
    isHidden: boolean;
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

export interface AchievementCondition {
    type: string;
    target: number;
    comparator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CUMULATIVE';
    context?: Record<string, unknown>;
}

export interface UserAchievement {
    userId: string;
    achievementId: string;
    progress: number;
    maxProgress: number;
    isUnlocked: boolean;
    unlockedAt?: number;
    progressHistory: {
        timestamp: number;
        progress: number;
        source: string;
        }[];
}

/**
 * Achievement System Types
 *
 * Phase 11.3 — Full achievement feature structure
 * 5 categories: Dedication, Streak, Combat, Social, Hidden
 */
export type AchievementCategory = 'SESSION' | 'STREAK' | 'BOSS' | 'SOCIAL' | 'PROGRESSION' | 'ECONOMY';
export type AchievementRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
