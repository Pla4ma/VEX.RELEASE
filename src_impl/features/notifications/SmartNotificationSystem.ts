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

import { eventBus } from "../../events";

// ============================================================================
// Types
// ============================================================================

export type NotificationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type NotificationType = "STREAK_PROTECTION" | "BOSS_OPPORTUNITY" | "STUDY_REMINDER" | "COMEBACK" | "SQUAD_ACTIVITY" | "WEEKLY_GOAL" | "MILESTONE" | "RE_ENGAGEMENT";

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

  // Streak info
  streakDays: number;
  hasCompletedSessionToday: boolean;
  hoursUntilStreakBreak: number | null;

  // Boss info
  hasActiveBoss: boolean;
  bossHealthPercent: number;
  bossTimeRemaining: number;
  isPrimeTime: boolean;

  // Study info
  hasActiveStudyPlan: boolean;
  studyPlanProgress: number;
  studyTasksRemaining: number;

  // Squad info
  squadMemberCount: number;
  squadWeeklyProgress: number;
  squadGoalAchieved: boolean;

  // Activity
  lastSessionAt: number | null;
  daysSinceLastSession: number;
  sessionsThisWeek: number;

  // Preferences
  notificationPrefs: NotificationPreferences;
}

export interface NotificationPreferences {
  streakProtectionEnabled: boolean;
  bossAlertsEnabled: boolean;
  studyRemindersEnabled: boolean;
  squadActivityEnabled: boolean;
  quietHoursStart: number; // Hour (0-23)
  quietHoursEnd: number; // Hour (0-23)
  maxPerDay: number;
}

// ============================================================================
// Notification Rules & Scheduling
// ============================================================================

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

// Streak Protection Rule (CRITICAL)
const STREAK_PROTECTION_RULE: NotificationRule = {
  type: "STREAK_PROTECTION",
  priority: "CRITICAL",
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
        title: "🚨 Streak breaks in 1 hour!",
        body: `Your ${ctx.streakDays}-day streak is about to break. Start a quick session now!`,
        data: { urgency: "critical", streakDays: ctx.streakDays },
      };
    }
    return {
      title: `⏰ ${hours} hours to save your streak`,
      body: `Protect your ${ctx.streakDays}-day streak with a quick focus session.`,
      data: { urgency: "high", streakDays: ctx.streakDays, hoursRemaining: hours },
    };
  },
  maxPerDay: 2,
  cooldownHours: 2,
  quietHoursRespected: false, // Always send for streak protection
  requiresOptIn: false,
};

// Boss Opportunity Rule (HIGH)
const BOSS_OPPORTUNITY_RULE: NotificationRule = {
  type: "BOSS_OPPORTUNITY",
  priority: "HIGH",
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
  type: "STUDY_REMINDER",
  priority: "MEDIUM",
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
    title: "📚 Continue your study plan",
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
  type: "SQUAD_ACTIVITY",
  priority: "LOW",
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
      title: "👥 Squad needs you!",
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
  type: "COMEBACK",
  priority: "HIGH",
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
        title: "We miss you! 💙",
        body: "Life happens. When you're ready, your streak can start again.",
        data: { daysAbsent: days },
      };
    }
    if (days <= 7) {
      return {
        title: "Your progress is waiting 🌱",
        body: "You were building something great. Ready to continue?",
        data: { daysAbsent: days },
      };
    }
    return {
      title: "Fresh start, same you ✨",
      body: "New boss available. Perfect time to jump back in!",
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
 * Evaluate and generate best notification for user context
 */
export function evaluateNotificationContext(ctx: NotificationContext): SmartNotification | null {
  // Check daily limit
  const todayCount = getTodayNotificationCount(ctx.userId);
  if (todayCount >= ctx.notificationPrefs.maxPerDay) {
    return null;
  }

  // Check quiet hours
  const currentHour = new Date(ctx.currentTime).getHours();
  const inQuietHours = currentHour >= ctx.notificationPrefs.quietHoursStart && currentHour < ctx.notificationPrefs.quietHoursEnd;

  // Filter applicable rules
  const applicable = NOTIFICATION_RULES.filter((rule) => {
    // Check opt-in
    if (rule.requiresOptIn && !isOptedIn(ctx, rule.type)) {
      return false;
    }

    // Check quiet hours
    if (inQuietHours && rule.quietHoursRespected) {
      return false;
    }

    // Check cooldown
    if (isInCooldown(ctx.userId, rule.type, rule.cooldownHours)) {
      return false;
    }

    // Check daily limit for this type
    const typeCount = getTodayTypeCount(ctx.userId, rule.type);
    if (typeCount >= rule.maxPerDay) {
      return false;
    }

    // Check condition
    return rule.condition(ctx);
  });

  if (applicable.length === 0) {
    return null;
  }

  // Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
  const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  applicable.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  // Select highest priority
  const selected = applicable[0];
  const message = selected.message(ctx);

  const notification: SmartNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: ctx.userId,
    type: selected.type,
    priority: selected.priority,
    title: message.title,
    body: message.body,
    data: message.data,
    scheduledAt: ctx.currentTime,
  };

  return notification;
}

/**
 * Check if user is opted in for notification type
 */
function isOptedIn(ctx: NotificationContext, type: NotificationType): boolean {
  switch (type) {
    case "STREAK_PROTECTION":
      return ctx.notificationPrefs.streakProtectionEnabled;
    case "BOSS_OPPORTUNITY":
      return ctx.notificationPrefs.bossAlertsEnabled;
    case "STUDY_REMINDER":
      return ctx.notificationPrefs.studyRemindersEnabled;
    case "SQUAD_ACTIVITY":
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

/**
 * Schedule notification for delivery
 */
export function scheduleNotification(notification: SmartNotification, deliverAt?: number): void {
  const scheduled = scheduledNotifications.get(notification.userId) || [];

  // Cancel any existing scheduled notification of same type
  const filtered = scheduled.filter((n) => n.type !== notification.type);

  notification.scheduledAt = deliverAt || Date.now();
  filtered.push(notification);

  scheduledNotifications.set(notification.userId, filtered);
}

/**
 * Send scheduled notification
 */
export function sendScheduledNotification(userId: string, notificationId: string): boolean {
  const scheduled = scheduledNotifications.get(userId) || [];
  const index = scheduled.findIndex((n) => n.id === notificationId);

  if (index === -1) {
    return false;
  }

  const notification = scheduled[index];
  notification.sentAt = Date.now();

  // Record in history
  const history = notificationHistory.get(userId) || [];
  history.push(notification);
  notificationHistory.set(userId, history);

  // Remove from scheduled
  scheduled.splice(index, 1);
  scheduledNotifications.set(userId, scheduled);

  // Publish event
  eventBus.publish("notification:sent", {
    userId,
    notificationId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    timestamp: Date.now(),
  });

  return true;
}

/**
 * Mark notification as opened
 */
export function markNotificationOpened(userId: string, notificationId: string): void {
  const history = notificationHistory.get(userId) || [];
  const notification = history.find((n) => n.id === notificationId);
  if (notification) {
    notification.openedAt = Date.now();
  }
}

/**
 * Mark notification as dismissed
 */
export function markNotificationDismissed(userId: string, notificationId: string): void {
  const history = notificationHistory.get(userId) || [];
  const notification = history.find((n) => n.id === notificationId);
  if (notification) {
    notification.dismissedAt = Date.now();
  }
}

// ============================================================================
// Re-engagement Flow
// ============================================================================

export interface ReEngagementStage {
  dayThreshold: number;
  notificationType: NotificationType;
  title: string;
  body: string;
  offerIncentive?: boolean;
}

const RE_ENGAGEMENT_STAGES: ReEngagementStage[] = [
  {
    dayThreshold: 3,
    notificationType: "COMEBACK",
    title: "We miss you! 💙",
    body: "Life happens. When you're ready, your streak can start again.",
  },
  {
    dayThreshold: 7,
    notificationType: "RE_ENGAGEMENT",
    title: "Your progress is waiting 🌱",
    body: "You were building something great. Ready to continue?",
  },
  {
    dayThreshold: 14,
    notificationType: "RE_ENGAGEMENT",
    title: "Fresh start, same you ✨",
    body: "New boss available. Perfect time to jump back in!",
  },
  {
    dayThreshold: 30,
    notificationType: "RE_ENGAGEMENT",
    title: "Special comeback offer 🎁",
    body: "We saved your progress. Start a free trial to unlock everything.",
    offerIncentive: true,
  },
];

/**
 * Get re-engagement message for days inactive
 */
export function getReEngagementMessage(daysInactive: number): ReEngagementStage | null {
  // Find the appropriate stage (highest threshold <= daysInactive)
  const stage = [...RE_ENGAGEMENT_STAGES].reverse().find((s) => daysInactive >= s.dayThreshold);
  return stage || null;
}

/**
 * Check if user needs re-engagement notification
 */
export function shouldReEngage(userId: string, daysInactive: number, hasBeenNotified: boolean = false): boolean {
  if (daysInactive < 3) {
    return false;
  }
  if (hasBeenNotified) {
    return false;
  }

  const stage = getReEngagementMessage(daysInactive);
  if (!stage) {
    return false;
  }

  // Don't re-notify for same stage
  const history = notificationHistory.get(userId) || [];
  const lastReEngagement = history.filter((n) => n.type === "RE_ENGAGEMENT" || n.type === "COMEBACK").pop();

  if (lastReEngagement?.sentAt) {
    const daysSinceLast = (Date.now() - lastReEngagement.sentAt) / (1000 * 60 * 60 * 24);
    return daysSinceLast >= 7; // Wait at least a week between re-engagement attempts
  }

  return true;
}

// ============================================================================
// Analytics
// ============================================================================

export interface NotificationAnalytics {
  totalSent: number;
  totalOpened: number;
  totalDismissed: number;
  openRate: number;
  byType: Record<NotificationType, { sent: number; opened: number; rate: number }>;
  byPriority: Record<NotificationPriority, { sent: number; opened: number; rate: number }>;
}

/**
 * Get notification analytics for user
 */
export function getNotificationAnalytics(userId: string): NotificationAnalytics {
  const history = notificationHistory.get(userId) || [];

  const totalSent = history.filter((n) => n.sentAt).length;
  const totalOpened = history.filter((n) => n.openedAt).length;
  const totalDismissed = history.filter((n) => n.dismissedAt).length;

  const byType: Record<string, { sent: number; opened: number; rate: number }> = {};
  const byPriority: Record<string, { sent: number; opened: number; rate: number }> = {};

  for (const type of ["STREAK_PROTECTION", "BOSS_OPPORTUNITY", "STUDY_REMINDER", "COMEBACK", "SQUAD_ACTIVITY"] as NotificationType[]) {
    const typeNotifications = history.filter((n) => n.type === type);
    const sent = typeNotifications.filter((n) => n.sentAt).length;
    const opened = typeNotifications.filter((n) => n.openedAt).length;
    byType[type] = { sent, opened, rate: sent > 0 ? opened / sent : 0 };
  }

  for (const priority of ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as NotificationPriority[]) {
    const priorityNotifications = history.filter((n) => n.priority === priority);
    const sent = priorityNotifications.filter((n) => n.sentAt).length;
    const opened = priorityNotifications.filter((n) => n.openedAt).length;
    byPriority[priority] = { sent, opened, rate: sent > 0 ? opened / sent : 0 };
  }

  return {
    totalSent,
    totalOpened,
    totalDismissed,
    openRate: totalSent > 0 ? totalOpened / totalSent : 0,
    byType,
    byPriority,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { NOTIFICATION_RULES, RE_ENGAGEMENT_STAGES, STREAK_PROTECTION_RULE, BOSS_OPPORTUNITY_RULE, STUDY_REMINDER_RULE, SQUAD_ACTIVITY_RULE, COMEBACK_RULE };

// Types are already exported via 'export interface' and 'export type' declarations above
