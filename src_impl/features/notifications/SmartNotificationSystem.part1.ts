import { eventBus } from "../../events";


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

export function scheduleNotification(notification: SmartNotification, deliverAt?: number): void {
  const scheduled = scheduledNotifications.get(notification.userId) || [];

  // Cancel any existing scheduled notification of same type
  const filtered = scheduled.filter((n) => n.type !== notification.type);

  notification.scheduledAt = deliverAt || Date.now();
  filtered.push(notification);

  scheduledNotifications.set(notification.userId, filtered);
}

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

export function markNotificationOpened(userId: string, notificationId: string): void {
  const history = notificationHistory.get(userId) || [];
  const notification = history.find((n) => n.id === notificationId);
  if (notification) {
    notification.openedAt = Date.now();
  }
}

export function markNotificationDismissed(userId: string, notificationId: string): void {
  const history = notificationHistory.get(userId) || [];
  const notification = history.find((n) => n.id === notificationId);
  if (notification) {
    notification.dismissedAt = Date.now();
  }
}

export function getReEngagementMessage(daysInactive: number): ReEngagementStage | null {
  // Find the appropriate stage (highest threshold <= daysInactive)
  const stage = [...RE_ENGAGEMENT_STAGES].reverse().find((s) => daysInactive >= s.dayThreshold);
  return stage || null;
}

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
  const lastReEngagement = history.filter((n) => n.type === 'RE_ENGAGEMENT' || n.type === 'COMEBACK').pop();

  if (lastReEngagement?.sentAt) {
    const daysSinceLast = (Date.now() - lastReEngagement.sentAt) / (1000 * 60 * 60 * 24);
    return daysSinceLast >= 7; // Wait at least a week between re-engagement attempts
  }

  return true;
}

export function getNotificationAnalytics(userId: string): NotificationAnalytics {
  const history = notificationHistory.get(userId) || [];

  const totalSent = history.filter((n) => n.sentAt).length;
  const totalOpened = history.filter((n) => n.openedAt).length;
  const totalDismissed = history.filter((n) => n.dismissedAt).length;

  const byType: Record<string, { sent: number; opened: number; rate: number }> = {};
  const byPriority: Record<string, { sent: number; opened: number; rate: number }> = {};

  for (const type of ['STREAK_PROTECTION', 'BOSS_OPPORTUNITY', 'STUDY_REMINDER', 'COMEBACK', 'SQUAD_ACTIVITY'] as NotificationType[]) {
    const typeNotifications = history.filter((n) => n.type === type);
    const sent = typeNotifications.filter((n) => n.sentAt).length;
    const opened = typeNotifications.filter((n) => n.openedAt).length;
    byType[type] = { sent, opened, rate: sent > 0 ? opened / sent : 0 };
  }

  for (const priority of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as NotificationPriority[]) {
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