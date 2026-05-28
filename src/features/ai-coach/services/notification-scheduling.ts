import * as Notifications from "expo-notifications";
import { createDebugger } from "../../../utils/debug";
import { isSameCalendarDay } from "./notification-helpers";
import { ensureNotificationChannel } from "./notification-permissions";

const debug = createDebugger("ai-coach:notifications");

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
