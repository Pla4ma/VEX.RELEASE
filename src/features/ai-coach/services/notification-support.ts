import * as Notifications from "expo-notifications";

import { createDebugger } from "../../../utils/debug";
import { type CoachMessage } from "../schemas";
import { CircuitBreaker } from "../utils/retry";
import { getCategoryConfig } from "./notification-config";
import {
  ensureNotificationChannel,
  requestNotificationPermissions,
} from "./notification-permissions";

const debug = createDebugger("ai-coach:notifications");

const pushCircuitBreaker = new CircuitBreaker(
  { failureThreshold: 5, resetTimeoutMs: 60000, halfOpenMaxCalls: 2 },
  "push-notifications",
);

export async function cancelAllCoachNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const coachNotifications = scheduled.filter((item) =>
      String(item.content.data?.action ?? "").includes("COACH"),
    );
    await Promise.all(
      coachNotifications.map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier),
      ),
    );
  } catch (error) {
    debug.warn("Cancel all coach notifications failed", error);
  }
}

export async function getPushToken(): Promise<string | null> {
  try {
    await ensureNotificationChannel();
    const granted = await requestNotificationPermissions();
    if (!granted) {
      return null;
    }

    return (await Notifications.getExpoPushTokenAsync()).data;
  } catch (error) {
    debug.warn("Push token retrieval failed", error);
    return null;
  }
}

export async function sendPushNotification(
  expoPushToken: string,
  message: CoachMessage,
): Promise<boolean> {
  try {
    return await pushCircuitBreaker.execute(async () => {
      const categoryConfig = getCategoryConfig(message.category);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: categoryConfig.title,
          body: message.content,
          data: { action: "COACH_MESSAGE", messageId: message.id, token: expoPushToken },
        },
        trigger: null,
      });
      return true;
    });
  } catch (error) {
    debug.warn("Push notification dispatch failed", error);
    return false;
  }
}

export async function getScheduledCoachNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.filter((item) =>
      String(item.content.data?.action ?? "").includes("COACH"),
    );
  } catch (error) {
    debug.warn("Fetching scheduled coach notifications failed", error);
    return [];
  }
}

export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    debug.warn("Setting badge count failed", error);
  }
}

export async function clearBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    debug.warn("Clearing badge count failed", error);
  }
}
