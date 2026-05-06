/**
 * Push Notification Delivery Service
 *
 * Handles real push notification delivery using expo-notifications.
 */

import * as Notifications from 'expo-notifications';
import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('notifications:push');

// Notification priority levels
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

// Push notification payload
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  badge?: number;
  sound?: string | boolean;
  vibrate?: boolean;
}

// Scheduled notification
export interface ScheduledNotification {
  identifier: string;
  trigger: Notifications.NotificationTriggerInput;
  payload: PushNotificationPayload;
}

const PushNotificationPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
  data: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  badge: z.number().optional(),
  sound: z.union([z.string(), z.boolean()]).optional(),
  vibrate: z.boolean().optional(),
});

/**
 * Request push notification permissions
 */
export async function requestPushPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Get push notification token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    debug.error('Failed to get push token', error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Send immediate push notification (local)
 */
export async function sendPushNotification(payload: PushNotificationPayload): Promise<string> {
  const validated = PushNotificationPayloadSchema.parse(payload);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: validated.title,
      body: validated.body,
      data: validated.data ?? {},
      badge: validated.badge,
      sound: validated.sound ?? true,
    },
    trigger: null, // Immediate
  });

  debug.info('Sent push notification: %s', notificationId);
  return notificationId;
}

/**
 * Schedule push notification for later delivery
 */
export async function schedulePushNotification(
  payload: PushNotificationPayload,
  triggerDate: Date
): Promise<string> {
  const validated = PushNotificationPayloadSchema.parse(payload);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: validated.title,
      body: validated.body,
      data: validated.data ?? {},
      badge: validated.badge,
      sound: validated.sound ?? true,
    },
    trigger: triggerDate as unknown as Notifications.NotificationTriggerInput,
  });

  debug.info('Scheduled push notification: %s for %s', notificationId, triggerDate.toISOString());
  return notificationId;
}

/**
 * Cancel scheduled notification
 */
export async function cancelPushNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  debug.info('Cancelled push notification: %s', notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllPushNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  debug.info('Cancelled all scheduled push notifications');
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledPushNotifications(): Promise<Notifications.NotificationRequest[]> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications;
}

/**
 * Present in-app notification (for foreground) - immediately triggers
 */
export async function presentInAppNotification(payload: PushNotificationPayload): Promise<string> {
  const validated = PushNotificationPayloadSchema.parse(payload);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: validated.title,
      body: validated.body,
      data: validated.data ?? {},
      badge: validated.badge,
      sound: validated.sound ?? true,
    },
    trigger: null,
  });

  return notificationId;
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
  debug.info('Set badge count: %d', count);
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
  debug.info('Cleared badge count');
}

/**
 * Handle notification response (when user taps notification)
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  handlers: {
    onSessionReminder?: () => void;
    onStreakRisk?: () => void;
    onBossEscape?: () => void;
    onSocialInteraction?: () => void;
  }
): void {
  const { notification } = response;
  const data = notification.request.content.data;

  debug.info('Handling notification response: %s', data?.type);

  switch (data?.type) {
    case 'SESSION_REMINDER':
      handlers.onSessionReminder?.();
      break;
    case 'STREAK_RISK':
      handlers.onStreakRisk?.();
      break;
    case 'BOSS_ESCAPE':
      handlers.onBossEscape?.();
      break;
    case 'SOCIAL':
      handlers.onSocialInteraction?.();
      break;
    default:
      debug.warn('Unknown notification type: %s', data?.type);
  }
}

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
