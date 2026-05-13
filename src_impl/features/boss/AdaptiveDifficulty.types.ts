export interface DifficultyAdjustment {
    encounterId: string;
    timestamp: number;
    trigger: 'performance_change' | 'squad_balance' | 'predictive' | 'real_time';
    adjustment: number;
    reason: string;
    factors: string[];
}

export interface PerformanceMetrics {
    sessionPurity: number;
    completionRate: number;
    averageSessionTime: number;
    streakLength: number;
    recentBossResults: Array<{
        bossId: string;
        outcome: 'victory' | 'defeat';
        performance: number;
        difficulty: number;
        }>;
}

export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type DifficultyFactor = z.infer<typeof DifficultyFactorSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AdaptiveBossEncounter = z.infer<typeof AdaptiveBossEncounterSchema>;
