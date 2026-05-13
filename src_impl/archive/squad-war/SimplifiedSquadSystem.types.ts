export interface SimplifiedSquad {
    id: string;
    name: string;
    description: string;
    avatarUrl: string | null;
    createdAt: number;
    createdByUserId: string;
    members: SquadMember[];
    maxMembers: number;
    weeklyGoal: WeeklyGoal;
    streak: SquadStreak;
    recentActivity: SquadActivity[];
    activeBossEncounter: SquadBossEncounter | null;
    isPublic: boolean;
    joinCode: string | null;
}

export interface SquadMember {
    userId: string;
    userName: string;
    avatarUrl: string | null;
    role: 'LEADER' | 'MEMBER';
    joinedAt: number;
    weeklyFocusMinutes: number;
    lastSessionAt: number | null;
    streakContributing: boolean;
    isActive: boolean;
}

export interface WeeklyGoal {
    targetFocusHours: number;
    currentTotalHours: number;
    weekStartsAt: number;
    weekEndsAt: number;
    achieved: boolean;
}

export interface SquadStreak {
    currentWeeks: number;
    longestWeeks: number;
    lastAchievedAt: number | null;
    requiresAllMembers: boolean;
}

export interface SquadActivity {
    id: string;
    userId: string;
    userName: string;
    type: 'SESSION_COMPLETE' | 'BOSS_DAMAGE' | 'STREAK_MILESTONE' | 'GOAL_ACHIEVED';
    description: string;
    timestamp: number;
    metadata?: {
        duration?: number;
        damage?: number;
        streakDays?: number;
        };
}

export interface SquadBossEncounter {
    encounterId: string;
    bossId: string;
    bossName: string;
    startedAt: number;
    expiresAt: number;
    healthRemaining: number;
    maxHealth: number;
    participantDamage: Record<string, number>;
    status: 'ACTIVE' | 'DEFEATED' | 'EXPIRED';
}

export interface SquadSummary {
    id: string;
    name: string;
    memberCount: number;
    maxMembers: number;
    isFull: boolean;
    streakWeeks: number;
    weeklyProgress: number;
    recentActivityCount: number;
    hasActiveBoss: boolean;
    isMember: boolean;
    userRole?: 'LEADER' | 'MEMBER';
}
