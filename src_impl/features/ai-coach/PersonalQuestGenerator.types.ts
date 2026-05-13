export interface PersonalQuest {
    id: string;
    userId: string;
    type: QuestType;
    title: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    rewardXp: number;
    rewardBonus: number;
    expiresAt: number;
    completedAt: number | null;
    createdAt: number;
    reasoning: string;
}

export interface UserPatterns {
    peakFocusHour: number | null;
    avgSessionDuration: number;
    maxSessionDuration: number;
    daysSinceNoPauseSession: number;
    currentStreak: number;
    lastQualityGrade: string;
    avgQualityScore: number;
    sessionsThisWeek: number;
    preferredSessionTimes: number[];
    commonPauseReasons: string[];
    lastBossEncounter: number | null;
    rivalStatus: 'AHEAD' | 'BEHIND' | 'NONE';
    squadContribution: number;
}

export type QuestType = 'PEAK_TIME_FOCUS' | 'BEAT_PERSONAL_BEST' | 'NO_PAUSE_CHALLENGE' | 'STREAK_PROTECTION' | 'QUALITY_GRADE_TARGET' | 'DURATION_MILESTONE' | 'BOSS_DAMAGE_DEALT' | 'RIVAL_OUTFOCUS' | 'SQUAD_SUPPORT';
