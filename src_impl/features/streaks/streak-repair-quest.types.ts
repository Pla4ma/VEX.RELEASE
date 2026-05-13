export interface StreakRepairQuest {
    id: string;
    userId: string;
    previousStreak: number;
    targetRestoreDays: number;
    sessionsCompleted: number;
    sessionsRequired: number;
    startedAt: number;
    expiresAt: number;
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED';
    sessionIds: string[];
}

export interface RepairQuestStatus {
    hasActiveQuest: boolean;
    quest: StreakRepairQuest | null;
    progressPercent: number;
    hoursRemaining: number;
    canStartQuest: boolean;
    previousStreak: number;
    potentialRestoreDays: number;
}
