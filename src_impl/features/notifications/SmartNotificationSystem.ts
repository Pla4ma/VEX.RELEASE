/**
 * Smart Notification System
 *
 * Phase 5.2 - Retention Mechanics
 * Smart, not spammy notifications
 * - Max 1 push per day, only when truly relevant
 * - Context-aware messaging based on user state
 * - Re-engagement flow for inactive users
 *
 * Notification Types:
 * 1. Streak Protection (high priority) - "2 hours left to protect your streak"
 * 2. Boss Opportunity (medium) - "Dragon is vulnerable for 3 more hours"
 * 3. Study Reminder (low) - "Continue Biology plan - 2 sessions remaining"
 * 4. Comeback (emotional) - "Ready to restart? Your squad misses you."
 *
 * Dependencies:
 * - Notifications (delivery)
 * - Streaks (streak protection timing)
 * - Boss (prime time windows)
 * - Content Study (plan progress)
 * - Squads (squad activity)
 */

import { eventBus } from '../../events';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Notification Rules & Scheduling
// ============================================================================
// Streak Protection Rule (CRITICAL)
const STREAK_PROTECTION_RULE: NotificationRule = {
  type: 'STREAK_PROTECTION',
  priority: 'CRITICAL',
  condition: (ctx) => {
    if (!ctx.streakDays || ctx.hasCompletedSessionToday) {
      return false;
    }
    if (ctx.hoursUntilStreakBreak === null) {
      return false;
    }
    return ctx.hoursUntilStreakBreak <= 4; // Only when < 4 hours left
  },
  message: (ctx) => {
    const hours = Math.ceil(ctx.hoursUntilStreakBreak || 0);
    if (hours <= 1) {
      return {
        title: '🚨 Streak breaks in 1 hour!',
        body: `Your ${ctx.streakDays}-day streak is about to break. Start a quick session now!`,
        data: { urgency: 'critical', streakDays: ctx.streakDays },
      };
    }
    return {
      title: `⏰ ${hours} hours to save your streak`,
      body: `Protect your ${ctx.streakDays}-day streak with a quick focus session.`,
      data: { urgency: 'high', streakDays: ctx.streakDays, hoursRemaining: hours },
    };
  },
  maxPerDay: 2,
  cooldownHours: 2,
  quietHoursRespected: false, // Always send for streak protection
  requiresOptIn: false,
};

// Boss Opportunity Rule (HIGH)
const BOSS_OPPORTUNITY_RULE: NotificationRule = {
  type: 'BOSS_OPPORTUNITY',
  priority: 'HIGH',
  condition: (ctx) => {
    if (!ctx.hasActiveBoss) {
      return false;
    }
    if (ctx.bossHealthPercent > 30) {
      return false;
    }
    if (ctx.bossTimeRemaining <= 0) {
      return false;
    }
    return ctx.isPrimeTime || ctx.bossHealthPercent < 15;
  },
  message: (ctx) => {
    const health = Math.round(ctx.bossHealthPercent);
    const time = Math.round(ctx.bossTimeRemaining);
    return {
      title: `⚔️ Boss at ${health}% health!`,
      body: ctx.isPrimeTime ? `Prime Time active! Deal bonus damage for ${time} more hours.` : `One focused session could finish this. ${time} hours remaining.`,
      data: { bossHealth: health, timeRemaining: time, isPrimeTime: ctx.isPrimeTime },
    };
  },
  maxPerDay: 1,
  cooldownHours: 6,
  quietHoursRespected: true,
  requiresOptIn: true,
};

// Study Reminder Rule (MEDIUM)
const STUDY_REMINDER_RULE: NotificationRule = {
  type: 'STUDY_REMINDER',
  priority: 'MEDIUM',
  condition: (ctx) => {
    if (!ctx.hasActiveStudyPlan) {
      return false;
    }
    if (ctx.studyPlanProgress > 0.8) {
      return false; // Almost done
    }
    if (ctx.studyTasksRemaining === 0) {
      return false;
    }
    // Only if hasn't studied today
    if (ctx.hasCompletedSessionToday) {
      return false;
    }
    return true;
  },
  message: (ctx) => ({
    title: '📚 Continue your study plan',
    body: `${ctx.studyTasksRemaining} tasks remaining. One session makes real progress.`,
    data: { tasksRemaining: ctx.studyTasksRemaining, progress: ctx.studyPlanProgress },
  }),
  maxPerDay: 1,
  cooldownHours: 24,
  quietHoursRespected: true,
  requiresOptIn: true,
};

// Squad Activity Rule (LOW)
const SQUAD_ACTIVITY_RULE: NotificationRule = {
  type: 'SQUAD_ACTIVITY',
  priority: 'LOW',
  condition: (ctx) => {
    if (ctx.squadMemberCount < 2) {
      return false;
    }
    if (ctx.squadWeeklyProgress > 0.9) {
      return false; // Goal almost done
    }
    return true;
  },
  message: (ctx) => {
    const progress = Math.round(ctx.squadWeeklyProgress);
    return {
      title: '👥 Squad needs you!',
      body: `Your squad is at ${progress}% of their weekly goal. Join a session and contribute!`,
      data: { squadProgress: progress },
    };
  },
  maxPerDay: 1,
  cooldownHours: 48,
  quietHoursRespected: true,
  requiresOptIn: true,
};

// Comeback Rule (EMOTIONAL - varies by days absent)
const COMEBACK_RULE: NotificationRule = {
  type: 'COMEBACK',
  priority: 'HIGH',
  condition: (ctx) => {
    // Only for users with some history
    if (!ctx.lastSessionAt) {
      return false;
    }
    return ctx.daysSinceLastSession >= 3 && ctx.daysSinceLastSession <= 14;
  },
  message: (ctx) => {
    const days = ctx.daysSinceLastSession;
    if (days <= 3) {
      return {
        title: 'We miss you! 💙',
        body: "Life happens. When you're ready, your streak can start again.",
        data: { daysAbsent: days },
      };
    }
    if (days <= 7) {
      return {
        title: 'Your progress is waiting 🌱',
        body: 'You were building something great. Ready to continue?',
        data: { daysAbsent: days },
      };
    }
    return {
      title: 'Fresh start, same you ✨',
      body: 'New boss available. Perfect time to jump back in!',
      data: { daysAbsent: days },
    };
  },
  maxPerDay: 1,
  cooldownHours: 72,
  quietHoursRespected: true,
  requiresOptIn: false,
};

const NOTIFICATION_RULES: NotificationRule[] = [STREAK_PROTECTION_RULE, BOSS_OPPORTUNITY_RULE, STUDY_REMINDER_RULE, SQUAD_ACTIVITY_RULE, COMEBACK_RULE];

// ============================================================================
// Smart Notification Engine
// ============================================================================

const notificationHistory = new Map<string, SmartNotification[]>();
const scheduledNotifications = new Map<string, SmartNotification[]>();

/**
 * Check if user is opted in for notification type
 */
function isOptedIn(ctx: NotificationContext, type: NotificationType): boolean {
  switch (type) {
    case 'STREAK_PROTECTION':
      return ctx.notificationPrefs.streakProtectionEnabled;
    case 'BOSS_OPPORTUNITY':
      return ctx.notificationPrefs.bossAlertsEnabled;
    case 'STUDY_REMINDER':
      return ctx.notificationPrefs.studyRemindersEnabled;
    case 'SQUAD_ACTIVITY':
      return ctx.notificationPrefs.squadActivityEnabled;
    default:
      return true;
  }
}

/**
 * Check if notification type is in cooldown
 */
function isInCooldown(userId: string, type: NotificationType, cooldownHours: number): boolean {
  const history = notificationHistory.get(userId) || [];
  const lastOfType = history.filter((n) => n.type === type && n.sentAt).sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0))[0];

  if (!lastOfType?.sentAt) {
    return false;
  }

  const hoursSinceLast = (Date.now() - lastOfType.sentAt) / (1000 * 60 * 60);
  return hoursSinceLast < cooldownHours;
}

/**
 * Get today's notification count
 */
function getTodayNotificationCount(userId: string): number {
  const history = notificationHistory.get(userId) || [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return history.filter((n) => n.sentAt && n.sentAt >= startOfDay.getTime()).length;
}

/**
 * Get today's count for specific type
 */
function getTodayTypeCount(userId: string, type: NotificationType): number {
  const history = notificationHistory.get(userId) || [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return history.filter((n) => n.type === type && n.sentAt && n.sentAt >= startOfDay.getTime()).length;
}

// ============================================================================
// Notification Scheduling & Delivery
// ============================================================================
// ============================================================================
// Re-engagement Flow
// ============================================================================
const RE_ENGAGEMENT_STAGES: ReEngagementStage[] = [
  {
    dayThreshold: 3,
    notificationType: 'COMEBACK',
    title: 'We miss you! 💙',
    body: "Life happens. When you're ready, your streak can start again.",
  },
  {
    dayThreshold: 7,
    notificationType: 'RE_ENGAGEMENT',
    title: 'Your progress is waiting 🌱',
    body: 'You were building something great. Ready to continue?',
  },
  {
    dayThreshold: 14,
    notificationType: 'RE_ENGAGEMENT',
    title: 'Fresh start, same you ✨',
    body: 'New boss available. Perfect time to jump back in!',
  },
  {
    dayThreshold: 30,
    notificationType: 'RE_ENGAGEMENT',
    title: 'Special comeback offer 🎁',
    body: 'We saved your progress. Start a free trial to unlock everything.',
    offerIncentive: true,
  },
];
// ============================================================================
// Analytics
// ============================================================================
// ============================================================================
// Exports
// ============================================================================

export { NOTIFICATION_RULES, RE_ENGAGEMENT_STAGES, STREAK_PROTECTION_RULE, BOSS_OPPORTUNITY_RULE, STUDY_REMINDER_RULE, SQUAD_ACTIVITY_RULE, COMEBACK_RULE };

// Types are already exported via 'export interface' and 'export type' declarations above
export * from "./SmartNotificationSystem.types";
export * from "./SmartNotificationSystem.part1";
