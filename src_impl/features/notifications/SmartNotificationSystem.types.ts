export interface SmartNotification {
    id: string;
    userId: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    scheduledAt: number;
    sentAt?: number;
    openedAt?: number;
    dismissedAt?: number;
}

export interface NotificationContext {
    userId: string;
    currentTime: number;
    streakDays: number;
    hasCompletedSessionToday: boolean;
    hoursUntilStreakBreak: number | null;
    hasActiveBoss: boolean;
    bossHealthPercent: number;
    bossTimeRemaining: number;
    isPrimeTime: boolean;
    hasActiveStudyPlan: boolean;
    studyPlanProgress: number;
    studyTasksRemaining: number;
    squadMemberCount: number;
    squadWeeklyProgress: number;
    squadGoalAchieved: boolean;
    lastSessionAt: number | null;
    daysSinceLastSession: number;
    sessionsThisWeek: number;
    notificationPrefs: NotificationPreferences;
}

export interface NotificationPreferences {
    streakProtectionEnabled: boolean;
    bossAlertsEnabled: boolean;
    studyRemindersEnabled: boolean;
    squadActivityEnabled: boolean;
    quietHoursStart: number;
    quietHoursEnd: number;
    maxPerDay: number;
}

export interface NotificationRule {
    type: NotificationType;
    priority: NotificationPriority;
    condition: (ctx: NotificationContext) => boolean;
    message: (ctx: NotificationContext) => { title: string; body: string; data?: Record<string, unknown> };
    maxPerDay: number;
    cooldownHours: number;
    quietHoursRespected: boolean;
    requiresOptIn: boolean;
}

export interface ReEngagementStage {
    dayThreshold: number;
    notificationType: NotificationType;
    title: string;
    body: string;
    offerIncentive?: boolean;
}

export interface NotificationAnalytics {
    totalSent: number;
    totalOpened: number;
    totalDismissed: number;
    openRate: number;
    byType: Record<NotificationType, { sent: number; opened: number; rate: number }>;
    byPriority: Record<NotificationPriority, { sent: number; opened: number; rate: number }>;
}

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type NotificationType = 'STREAK_PROTECTION' | 'BOSS_OPPORTUNITY' | 'STUDY_REMINDER' | 'COMEBACK' | 'SQUAD_ACTIVITY' | 'WEEKLY_GOAL' | 'MILESTONE' | 'RE_ENGAGEMENT';
