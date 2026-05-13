/**
 * Progression Feature - Domain Types
 *
 * Dependencies:
 * - Rewards (level-up rewards, XP grants)
 * - Boss (level gates boss unlocks)
 * - Shop (level gates shop items)
 * - Analytics (progression events tracked)
 * - Sessions (XP earned from sessions)
 * - Streaks (streak bonuses to XP)
 */
export interface Progression {
    id: string;
    userId: string;
    level: number;
    xp: number;
    totalXp: number;
    nextLevelThreshold: number;
    lastLevelUpAt: number | null;
    createdAt: number;
    updatedAt: number;
}

export interface ProgressionSummary {
    id: string;
    userId: string;
    level: number;
    xp: number;
    nextLevelThreshold: number;
    progressPercent: number;
}

export interface ProgressionDetail extends Progression {
    levelUpHistory: LevelUpRecord[];
    xpHistory: XpEntry[];
    unlocks: Unlock[];
}

export interface LevelUpRecord {
    level: number;
    achievedAt: number;
    xpAtLevel: number;
}

export interface XpEntry {
    id: string;
    amount: number;
    source: XpSource;
    sessionId: string | null;
    metadata: XpMetadata | null;
    createdAt: number;
}

export interface XpMetadata {
    [key: string]: unknown;
    streakDays?: number;
    squadMultiplier?: number;
    bossActive?: boolean;
    perfectSession?: boolean;
    comebackActive?: boolean;
}

export interface XpBreakdown {
    base: number;
    streakBonus: number;
    squadBonus: number;
    bossBonus: number;
    comebackBonus: number;
    perfectBonus: number;
    total: number;
}

export interface LevelThreshold {
    level: number;
    xpRequired: number;
    totalXpToReach: number;
}

export interface LevelFormula {
    baseXp: number;
    growthFactor: number;
    maxLevel: number;
}

export interface Unlock {
    id: string;
    type: UnlockType;
    featureId: string;
    name: string;
    description: string;
    unlockedAt: number | null;
    minLevel: number;
}

export interface Milestone {
    id: string;
    type: MilestoneType;
    threshold: number;
    rewardType: MilestoneRewardType;
    rewardAmount: number;
    rewardItemId: string | null;
    completed: boolean;
    completedAt: number | null;
}

export interface ProgressionTier {
    level: number;
    name: string;
    description: string;
    unlocks: string[];
    badgeUrl: string | null;
}

export interface TierProgression {
    currentTier: ProgressionTier;
    nextTier: ProgressionTier | null;
    progressToNextTier: number;
}

export interface ProgressionStats {
    totalSessionsCompleted: number;
    totalFocusTime: number;
    averageXpPerSession: number;
    fastestLevelUp: number | null;
    totalLevelUps: number;
}

export interface DailyProgress {
    date: string;
    xpGained: number;
    sessionsCompleted: number;
    levelUps: number;
    streakDay: number;
}

export interface WeeklySummary {
    weekStart: string;
    weekEnd: string;
    totalXp: number;
    sessionsCompleted: number;
    levelsGained: number;
    milestonesReached: number;
    comparisonToLastWeek: number;
}

export interface LongTermProgress {
    totalDaysActive: number;
    totalSessions: number;
    totalFocusTime: number;
    currentStreak: number;
    longestStreak: number;
    achievementsUnlocked: number;
    bossesDefeated: number;
}

export interface AddXpResult {
    xpAdded: number;
    totalXp: number;
    currentLevel: number;
    levelsGained: number;
    newLevel: number;
    xpToNextLevel: number;
    breakdown: XpBreakdown;
}

export interface LevelUpResult {
    newLevel: number;
    previousLevel: number;
    totalXp: number;
    xpToNextLevel: number;
    rewards: string[];
    unlocks: Unlock[];
}
