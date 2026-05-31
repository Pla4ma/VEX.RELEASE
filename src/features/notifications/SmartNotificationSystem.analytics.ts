import type {
  NotificationPriority,
  NotificationType,
} from './SmartNotificationSystem.types';
import { notificationHistory } from './SmartNotificationSystem';

export interface NotificationAnalytics {
  totalSent: number;
  totalOpened: number;
  totalDismissed: number;
  openRate: number;
  byType: Record<
    NotificationType,
    { sent: number; opened: number; rate: number }
  >;
  byPriority: Record<
    NotificationPriority,
    { sent: number; opened: number; rate: number }
  >;
}

export function getNotificationAnalytics(
  userId: string,
): NotificationAnalytics {
  const history = notificationHistory.get(userId) ?? [];
  const totalSent = history.filter((n) => n.sentAt).length;
  const totalOpened = history.filter((n) => n.openedAt).length;
  const totalDismissed = history.filter((n) => n.dismissedAt).length;
  const byType: Record<string, { sent: number; opened: number; rate: number }> =
    {};
  const byPriority: Record<
    string,
    { sent: number; opened: number; rate: number }
  > = {};
  for (const type of [
    'STREAK_PROTECTION',
    'BOSS_OPPORTUNITY',
    'STUDY_REMINDER',
    'COMEBACK',
    'SQUAD_ACTIVITY',
  ] as NotificationType[]) {
    const typeNotifications = history.filter((n) => n.type === type);
    const sent = typeNotifications.filter((n) => n.sentAt).length;
    const opened = typeNotifications.filter((n) => n.openedAt).length;
    byType[type] = { sent, opened, rate: sent > 0 ? opened / sent : 0 };
  }
  for (const priority of [
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
  ] as NotificationPriority[]) {
    const priorityNotifications = history.filter(
      (n) => n.priority === priority,
    );
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
