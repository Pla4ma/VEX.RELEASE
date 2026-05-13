export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastSessionDate: string | null;
    streakHistory: {
        date: string;
        sessionsCompleted: number;
        maintained: boolean;
        }[];
    isAtRisk: boolean;
    hoursRemaining: number;
}

export interface StreakUpdate {
    newStreak: number;
    streakMaintained: boolean;
    streakBroken: boolean;
    newLongestStreak: boolean;
}
