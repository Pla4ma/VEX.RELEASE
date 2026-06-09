import * as Notifications from 'expo-notifications';
import { createDebugger } from '../../../utils/debug';
import { type CoachMessage } from '../schemas';
import { getCategoryConfig } from './notification-config';
import {
  ensureNotificationChannel,
  requestNotificationPermissions,
} from './notification-permissions';
import { isQuietHours, isRateLimited } from './notification-helpers';

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

export { isSameCalendarDay, isQuietHours, isRateLimited } from './notification-helpers';
export {
  scheduleStreakReminderNotification,
  cancelNotification,
  handleNotificationResponse,
} from './notification-scheduling';

export function initializeNotifications(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    debug.warn('Notification handler setup failed', error);
  }
  ensureNotificationChannel();
}

export async function scheduleLocalNotification(
  message: CoachMessage,
): Promise<string | null> {
  if (isQuietHours() || (await isRateLimited())) {
    return null;
  }
  try {
    await ensureNotificationChannel();
    const categoryConfig = getCategoryConfig(message.category);
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: categoryConfig.title,
        body: message.content,
        data: {
          messageId: message.id,
          category: message.category,
          action: 'OPEN_COACH_MESSAGE',
        },
        sound: 'default',
        badge: 1,
        ...categoryConfig.androidConfig,
      },
      trigger: null,
    });
  } catch (error) {
    debug.warn('Local notification scheduling failed', error);
    return null;
  }
}

export async function scheduleReminderNotification(
  title: string,
  body: string,
  triggerTime: number,
  data?: Record<string, unknown>,
): Promise<string | null> {
  if (triggerTime < Date.now()) {
    debug.warn(
      'Reminder notification was skipped because it was scheduled in the past',
    );
    return null;
  }
  try {
    await ensureNotificationChannel();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, action: 'COACH_REMINDER' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerTime),
      },
    });
  } catch (error) {
    debug.warn('Reminder notification scheduling failed', error);
    return null;
  }
}
