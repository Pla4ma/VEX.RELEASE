export interface ScoreBand {
    min: number;
    max: number;
    label: string;
    title: string;
    color: string;
    percentile: number;
}

export interface FocusScoreFactors {
    consistency: {
        score: number; // 0-100
        sessionsLast30Days: number;
        targetSessionsPerWeek: number;
        actualConsistency: number; // 0-1
        missedDaysLast30Days: number;
        };
    streakStability: {
        score: number;
        currentStreak: number;
        longestStreak: number;
        averageStreakLength: number;
        totalStreaksStarted: number;
        streakBreakFrequency: number; // breaks per month
        };
    sessionQuality: {
        score: number;
        averageFocusPurity: number; // 0-100
        averageGrade: 'S' | 'A' | 'B' | 'C' | 'D';
        perfectSessionsCount: number;
        averageSessionDuration: number;
        };
    diversity: {
        score: number;
        uniqueSessionModes: number;
        uniqueTimeSlots: number; // morning/afternoon/evening
        uniqueDaysOfWeek: number;
        weekendSessions: number;
        contextVariety: number; // locations, contexts
        };
    recency: {
        score: number;
        daysSinceLastSession: number;
        last7DayActivity: number; // sessions
        last30DayActivity: number;
        trendDirection: 'UP' | 'STABLE' | 'DOWN' | 'CONCERNING';
        velocity: number; // score change rate
        };
}

export interface FocusIdentityProfile {
    userId: string;
    currentScore: number;
    previousScore: number;
    scoreHistory: Array<{ date: string; score: number; reason: string }>;
    percentileRank: number;
    band: ScoreBand;
    factors: FocusScoreFactors;
    identityStatement: string;
    streakInCurrentBand: number;
    totalScoreCalculations: number;
    firstScoreDate: string;
    isInRecovery: boolean;
    recoveryStartDate: string | null;
    recoveryProgress: number;
    preLapseScore: number | null;
    topStrength: keyof FocusScoreFactors;
    topWeakness: keyof FocusScoreFactors;
    recommendedActions: string[];
    monthlyReport: {
        month: string;
        startingScore: number;
        endingScore: number;
        change: number;
        sessionsCompleted: number;
        grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
        highlight: string;
        } | null;
    updatedAt: number;
}
