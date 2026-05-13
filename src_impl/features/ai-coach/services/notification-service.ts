import * as Notifications from 'expo-notifications';

import { createDebugger } from '../../../utils/debug';
import { type CoachMessage } from '../schemas';
import { getCategoryConfig, NOTIFICATION_CONFIG } from './notification-config';
import { ensureNotificationChannel, requestNotificationPermissions } from './notification-permissions';
import { getScheduledCoachNotifications } from './notification-support';

const debug = createDebugger('ai-coach:notifications');

export { requestNotificationPermissions };
export {
  cancelAllCoachNotifications,
  clearBadge,
  getPushToken,
  getScheduledCoachNotifications,
  sendPushNotification,
  setBadgeCount,
} from './notification-support';

function isSameCalendarDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isQuietHours(): boolean {
  const hour = new Date().getHours();
  return hour >= NOTIFICATION_CONFIG.quietHoursStart || hour < NOTIFICATION_CONFIG.quietHoursEnd;
}

async function isRateLimited(): Promise<boolean> {
  try {
    const scheduled = await getScheduledCoachNotifications();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = scheduled.filter((item) => {
      const trigger = item.trigger;
      return Boolean(
        trigger &&
          typeof trigger === 'object' &&
          'date' in trigger &&
          new Date(String(trigger.date)).getTime() > oneHourAgo
      );
    }).length;
    return recentCount >= NOTIFICATION_CONFIG.maxNotificationsPerHour;
  } catch (error) {
    debug.warn('Notification rate limit check failed', error);
    return false;
  }
}

export * from "./notification-service.part1";
