/**
 * Notification Analytics
 *
 * Track notification interactions for A/B testing and optimization.
 */

import { z } from "zod";

import { getAnalyticsService } from "../../analytics/AnalyticsService";
import { addBreadcrumb } from "../../config/sentry";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("notifications:analytics");

/**
 * Notification event types
 */
export const NotificationEventTypeSchema = z.enum([
  "opened",
  "delivered",
  "dismissed",
]);

export type NotificationEventType = z.infer<typeof NotificationEventTypeSchema>;

/**
 * Notification type schema for validation
 */
export const NotificationTypeSchema = z.enum([
  "streak_reminder",
  "session_prompt",
  "challenge_reminder",
  "level_up",
  "boss_timeout_warning",
  "welcome_back",
  "comeback",
  "RETENTION_ONBOARDING_DAY_1",
  "RETENTION_ONBOARDING_DAY_3",
  "RETENTION_ONBOARDING_DAY_7",
  "RETENTION_STREAK_PROTECTION",
  "RETENTION_RE_ENGAGEMENT",
  "RETENTION_CHALLENGE_EXPIRY",
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

/**
 * Track notification opened event
 * Called when user taps/opens a notification
 */
export function trackNotificationOpened(
  type: string,
  userId: string,
  notificationId: string,
): void {
  try {
    const validatedType = NotificationTypeSchema.parse(type);

    getAnalyticsService().track("notification_opened", {
      notification_type: validatedType,
      notification_id: notificationId,
      user_id: userId,
      timestamp: Date.now(),
    });

    addBreadcrumb(
      `Notification opened: ${validatedType}`,
      "notification.interaction",
      { notificationId, userId, type: validatedType },
    );

    debug.info("[Analytics] Notification opened: %s", validatedType);
  } catch (error) {
    debug.warn("Failed to track notification opened", error);
  }
}

/**
 * Track notification delivered event
 * Called when notification is successfully delivered to device
 */
export function trackNotificationDelivered(type: string, userId: string): void {
  try {
    const validatedType = NotificationTypeSchema.parse(type);

    getAnalyticsService().track("notification_delivered", {
      notification_type: validatedType,
      user_id: userId,
      timestamp: Date.now(),
    });

    addBreadcrumb(
      `Notification delivered: ${validatedType}`,
      "notification.delivery",
      { userId, type: validatedType },
    );

    debug.info("[Analytics] Notification delivered: %s", validatedType);
  } catch (error) {
    debug.warn("Failed to track notification delivered", error);
  }
}

/**
 * Track notification dismissed event
 * Called when user dismisses a notification without opening
 */
export function trackNotificationDismissed(type: string, userId: string): void {
  try {
    const validatedType = NotificationTypeSchema.parse(type);

    getAnalyticsService().track("notification_dismissed", {
      notification_type: validatedType,
      user_id: userId,
      timestamp: Date.now(),
    });

    addBreadcrumb(
      `Notification dismissed: ${validatedType}`,
      "notification.interaction",
      { userId, type: validatedType },
    );

    debug.info("[Analytics] Notification dismissed: %s", validatedType);
  } catch (error) {
    debug.warn("Failed to track notification dismissed", error);
  }
}

/**
 * Track notification scheduled event
 * Called when a notification is scheduled for future delivery
 */
export function trackNotificationScheduled(
  type: string,
  userId: string,
  scheduledFor: number,
): void {
  try {
    const validatedType = NotificationTypeSchema.parse(type);

    getAnalyticsService().track("notification_scheduled", {
      notification_type: validatedType,
      user_id: userId,
      scheduled_for: scheduledFor,
      timestamp: Date.now(),
    });

    debug.info("[Analytics] Notification scheduled: %s", validatedType);
  } catch (error) {
    debug.warn("Failed to track notification scheduled", error);
  }
}

/**
 * Track permission request event
 * Called when notification permission is requested/granted/denied
 */
export function trackNotificationPermission(
  userId: string,
  granted: boolean,
  source: "onboarding" | "settings" | "prompt",
): void {
  try {
    getAnalyticsService().track("notification_permission", {
      user_id: userId,
      granted,
      source,
      timestamp: Date.now(),
    });

    addBreadcrumb(
      `Notification permission ${granted ? "granted" : "denied"}`,
      "notification.permission",
      { userId, granted, source },
    );

    debug.info(
      "[Analytics] Notification permission: granted=%s, source=%s",
      granted,
      source,
    );
  } catch (error) {
    debug.warn("Failed to track notification permission", error);
  }
}
