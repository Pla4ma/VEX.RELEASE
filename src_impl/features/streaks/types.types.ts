/**
 * Streaks Feature - Domain Types
 *
 * Dependencies:
 * - Sessions (qualifying sessions increment streaks)
 * - Rewards (streak milestone rewards)
 * - Progression (streak XP bonuses)
 * - Analytics (streak events tracked)
 * - Notifications (streak reminders)
 */
export interface Streak {
    id: string;
    userId: string;
    currentDays: number;
    longestDays: number;
    lastQualifyingSessionAt: number | null;
    currentDayCompletedAt: number | null;
    shieldsAvailable: number;
    gracePeriodUsed: boolean;
    timezone: string;
    createdAt: number;
    updatedAt: number;
}

export interface StreakSummary {
    id: string;
    userId: string;
    currentDays: number;
    longestDays: number;
    isAtRisk: boolean;
    riskLevel: RiskLevel;
    nextDeadline: number | null;
    shieldAvailable: boolean;
}

export interface StreakMilestone {
    id: string;
    days: number;
    name: string;
    description: string;
    rewardType: MilestoneRewardType;
    rewardAmount: number;
    rewardItemId: string | null;
    badgeId: string | null;
    achieved: boolean;
    achievedAt: number | null;
}

export interface StreakShield {
    id: string;
    userId: string;
    source: ShieldSource;
    used: boolean;
    usedAt: number | null;
    expiresAt: number | null;
    createdAt: number;
}

export interface StreakProtection {
    userId: string;
    shieldsAvailable: number;
    frozenUntil: number | null;
    graceUsed: boolean;
}

export interface StreakRecovery {
    userId: string;
    previousStreak: number;
    restoredTo: number;
    restoredAt: number;
    source: RecoverySource;
}

export interface ComebackState {
    isComeback: boolean;
    daysAbsent: number;
    streakBefore: number;
    streakNow: number;
    rewardMultiplier: number;
    streakRestoreEligible: boolean;
    message: string;
}

export interface StreakCalendarDay {
    date: string;
    hasSession: boolean;
    sessionCount: number;
    totalDuration: number;
    qualifiesForStreak: boolean;
}

export interface StreakCalendar {
    month: number;
    year: number;
    days: StreakCalendarDay[];
    currentStreakDays: number;
    longestStreakInMonth: number;
}

export interface QualifyingSession {
    sessionId: string;
    completedAt: number;
    duration: number;
    qualityScore: number;
}

export interface StreakEngineResult {
    action: StreakAction;
    previousStreak: number;
    newStreak: number;
    milestoneReached: StreakMilestone | null;
    shieldUsed: boolean;
}

export interface StreakMultiplier {
    days: number;
    multiplier: number;
    xpBonus: number;
    label: string;
}

export interface RecordSessionInput {
    userId: string;
    sessionId: string;
    completedAt: number;
    duration: number;
    qualityScore: number;
}

export interface UseShieldInput {
    userId: string;
    reason: 'MANUAL' | 'AUTO';
}

export interface FreezeStreakInput {
    userId: string;
    durationHours: number;
}

export interface RestoreStreakInput {
    userId: string;
    targetDays: number;
    source: RecoverySource;
}
