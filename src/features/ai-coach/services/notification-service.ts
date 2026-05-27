import * as Notifications from "expo-notifications";
import { createDebugger } from "../../../utils/debug";
import { type CoachMessage } from "../schemas";
import { getCategoryConfig, NOTIFICATION_CONFIG } from "./notification-config";
import {
  ensureNotificationChannel,
  requestNotificationPermissions,
} from "./notification-permissions";
import { getScheduledCoachNotifications } from "./notification-support";
const debug = createDebugger("ai-coach:notifications");
export { requestNotificationPermissions };
export {
  cancelAllCoachNotifications,
  clearBadge,
  getPushToken,
  getScheduledCoachNotifications,
  sendPushNotification,
  setBadgeCount,
} from "./notification-support";
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
    debug.warn("Notification handler setup failed", error);
  }
  void ensureNotificationChannel();
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
          action: "OPEN_COACH_MESSAGE",
        },
        sound: "default",
        badge: 1,
        ...categoryConfig.androidConfig,
      },
      trigger: null,
    });
  } catch (error) {
    debug.warn("Local notification scheduling failed", error);
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
      "Reminder notification was skipped because it was scheduled in the past",
    );
    return null;
  }
  try {
    await ensureNotificationChannel();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, action: "COACH_REMINDER" },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerTime),
      },
    });
  } catch (error) {
    debug.warn("Reminder notification scheduling failed", error);
    return null;
  }
}
export async function scheduleStreakReminderNotification(
  userId: string,
  streakDays: number,
  scheduledTime: Date,
): Promise<string | null> {
  if (scheduledTime.getTime() <= Date.now()) {
    debug.warn(
      "Streak reminder was skipped because it was scheduled in the past",
    );
    return null;
  }
  try {
    await ensureNotificationChannel();
    const permissions = await Notifications.getPermissionsAsync();
    const granted =
      permissions.granted ||
      permissions.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL;
    if (!granted) {
      return null;
    }
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matchingNotifications = scheduled.filter((item) => {
      const data = item.content.data ?? {};
      const trigger = item.trigger;
      const triggerDate =
        trigger && typeof trigger === "object" && "date" in trigger
          ? new Date(String(trigger.date))
          : null;
      return (
        data.action === "STREAK_REMINDER" &&
        data.userId === userId &&
        triggerDate !== null &&
        isSameCalendarDay(triggerDate, scheduledTime)
      );
    });
    await Promise.all(
      matchingNotifications.map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier),
      ),
    );
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Protect your streak",
        body:
          streakDays > 1
            ? `Your ${streakDays}-day streak is at risk. Complete a session today to keep it alive.`
            : "Complete one session today to lock in day 1.",
        data: { action: "STREAK_REMINDER", userId, streakDays },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledTime,
      },
    });
  } catch (error) {
    debug.warn("Streak reminder scheduling failed", error);
    return null;
  }
}
export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    debug.warn("Notification cancel failed", error);
  }
}
function isSameCalendarDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
function isQuietHours(): boolean {
  const hour = new Date().getHours();
  return (
    hour >= NOTIFICATION_CONFIG.quietHoursStart ||
    hour < NOTIFICATION_CONFIG.quietHoursEnd
  );
}
async function isRateLimited(): Promise<boolean> {
  try {
    const scheduled = await getScheduledCoachNotifications();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = scheduled.filter((item) => {
      const trigger = item.trigger;
      return Boolean(
        trigger &&
        typeof trigger === "object" &&
        "date" in trigger &&
        new Date(String(trigger.date)).getTime() > oneHourAgo,
      );
    }).length;
    return recentCount >= NOTIFICATION_CONFIG.maxNotificationsPerHour;
  } catch (error) {
    debug.warn("Notification rate limit check failed", error);
    return false;
  }
}
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse,
): Promise<void> {
  try {
    const action = response.notification.request.content.data?.action;
    debug.info(
      "Handled notification response for action: %s",
      String(action ?? "unknown"),
    );
  } catch (error) {
    debug.warn("Notification response handling failed", error);
  }
}
