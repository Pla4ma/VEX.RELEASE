export interface UserPerformanceMetrics {
    userId: string;
    sessionsAttempted: number;
    sessionsCompleted: number;
    completionRate: number;
    averagePurity: number;
    averageGrade: 'S' | 'A' | 'B' | 'C' | 'D';
    perfectSessions: number;
    trendDirection: 'improving' | 'stable' | 'declining';
    consistencyScore: number;
    bossDefeatRate: number;
    averageBossDamage: number;
    lastUpdated: number;
}

export interface AdaptiveBossConfig {
    baseHealth: number;
    healthMultiplier: number;
    attackFrequency: number;
    purityThreshold: number;
    timeLimit: number;
    recommendedMode: 'FLOW' | 'CHALLENGE' | 'RECOVERY';
}

export interface DifficultyAdjustment {
    reason: string;
    previousRating: DifficultyRating;
    newRating: DifficultyRating;
    changes: {
        healthChange: number; // percentage
        attackFreqChange: number;
        purityThresholdChange: number;
        };
    messageToUser: string;
}

export type DifficultyRating = 'EASY' | 'NORMAL' | 'HARD' | 'EXTREME';
