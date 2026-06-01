import { eventBus } from '../../events';
import type {
  SmartNotification,
  NotificationContext,
  NotificationType,
  NotificationPriority,
} from './SmartNotificationSystem.types';
import { NOTIFICATION_RULES } from './SmartNotificationSystem.rules';

// Re-exports from sub-modules (backward compatibility)
export {
  NOTIFICATION_RULES,
  STREAK_PROTECTION_RULE,
  BOSS_OPPORTUNITY_RULE,
  STUDY_REMINDER_RULE,
  SQUAD_ACTIVITY_RULE,
  COMEBACK_RULE,
} from './SmartNotificationSystem.rules';
export {
  RE_ENGAGEMENT_STAGES,
  getReEngagementMessage,
  shouldReEngage,
} from './SmartNotificationSystem.reengagement';
export type { ReEngagementStage } from './SmartNotificationSystem.reengagement';
export { getNotificationAnalytics } from './SmartNotificationSystem.analytics';
export type { NotificationAnalytics } from './SmartNotificationSystem.analytics';

export const notificationHistory = new Map<string, SmartNotification[]>();
export const scheduledNotifications = new Map<string, SmartNotification[]>();

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

function isInCooldown(
  userId: string,
  type: NotificationType,
  cooldownHours: number,
): boolean {
  const history = notificationHistory.get(userId) ?? [];
  const lastOfType = history
    .filter((n) => n.type === type && n.sentAt)
    .sort((a, b) => (b.sentAt ?? 0) - (a.sentAt ?? 0))[0];
  if (!lastOfType?.sentAt) {
    return false;
  }
  const hoursSinceLast = (Date.now() - lastOfType.sentAt) / (1000 * 60 * 60);
  return hoursSinceLast < cooldownHours;
}

function getTodayNotificationCount(userId: string): number {
  const history = notificationHistory.get(userId) ?? [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return history.filter((n) => n.sentAt && n.sentAt >= startOfDay.getTime())
    .length;
}

function getTodayTypeCount(userId: string, type: NotificationType): number {
  const history = notificationHistory.get(userId) ?? [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return history.filter(
    (n) => n.type === type && n.sentAt && n.sentAt >= startOfDay.getTime(),
  ).length;
}

export function evaluateNotificationContext(
  ctx: NotificationContext,
): SmartNotification | null {
  const todayCount = getTodayNotificationCount(ctx.userId);
  if (todayCount >= ctx.notificationPrefs.maxPerDay) {
    return null;
  }
  const currentHour = new Date(ctx.currentTime).getHours();
  const inQuietHours =
    currentHour >= ctx.notificationPrefs.quietHoursStart &&
    currentHour < ctx.notificationPrefs.quietHoursEnd;
  const applicable = NOTIFICATION_RULES.filter((rule) => {
    if (rule.requiresOptIn && !isOptedIn(ctx, rule.type)) {
      return false;
    }
    if (inQuietHours && rule.quietHoursRespected) {
      return false;
    }
    if (isInCooldown(ctx.userId, rule.type, rule.cooldownHours)) {
      return false;
    }
    const typeCount = getTodayTypeCount(ctx.userId, rule.type);
    if (typeCount >= rule.maxPerDay) {
      return false;
    }
    return rule.condition(ctx);
  });
  if (applicable.length === 0) {
    return null;
  }
  const priorityOrder: Record<NotificationPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };
  applicable.sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
  );
  const selected = applicable[0];
  if (!selected) {
    return null;
  }
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

export function scheduleNotification(
  notification: SmartNotification,
  deliverAt?: number,
): void {
  const scheduled = scheduledNotifications.get(notification.userId) ?? [];
  const filtered = scheduled.filter((n) => n.type !== notification.type);
  notification.scheduledAt = deliverAt ?? Date.now();
  filtered.push(notification);
  scheduledNotifications.set(notification.userId, filtered);
}

export function sendScheduledNotification(
  userId: string,
  notificationId: string,
): boolean {
  const scheduled = scheduledNotifications.get(userId) ?? [];
  const index = scheduled.findIndex((n) => n.id === notificationId);
  if (index === -1) {
    return false;
  }
  const notification = scheduled[index];
  if (!notification) {
    return false;
  }
  notification.sentAt = Date.now();
  const history = notificationHistory.get(userId) ?? [];
  history.push(notification);
  notificationHistory.set(userId, history);
  scheduled.splice(index, 1);
  scheduledNotifications.set(userId, scheduled);
  eventBus.publish('notification:sent', {
    userId,
    notificationId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    timestamp: Date.now(),
  });
  return true;
}

export function markNotificationOpened(
  userId: string,
  notificationId: string,
): void {
  const history = notificationHistory.get(userId) ?? [];
  const notification = history.find((n) => n.id === notificationId);
  if (notification) {
    notification.openedAt = Date.now();
  }
}

export function markNotificationDismissed(
  userId: string,
  notificationId: string,
): void {
  const history = notificationHistory.get(userId) ?? [];
  const notification = history.find((n) => n.id === notificationId);
  if (notification) {
    notification.dismissedAt = Date.now();
  }
}
